import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET /api/tasks - List tasks with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Filter params
    const projectId = searchParams.get("projectId")
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const assigneeId = searchParams.get("assigneeId")

    // Build where clause
    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (status) where.status = status
    if (priority) where.priority = priority
    if (assigneeId) where.assigneeId = assigneeId

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            subtasks: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { priority: "desc" },
        { order: "asc" },
        { createdAt: "desc" },
      ],
    })

    // Group by status for Kanban view
    const grouped = {
      todo: tasks.filter(t => t.status === "todo"),
      in_progress: tasks.filter(t => t.status === "in_progress"),
      review: tasks.filter(t => t.status === "review"),
      completed: tasks.filter(t => t.status === "completed"),
      blocked: tasks.filter(t => t.status === "blocked"),
    }

    // Stats
    const stats = {
      total: tasks.length,
      todo: grouped.todo.length,
      inProgress: grouped.in_progress.length,
      review: grouped.review.length,
      completed: grouped.completed.length,
      blocked: grouped.blocked.length,
      highPriority: tasks.filter(t => t.priority === "high" || t.priority === "urgent").length,
    }

    return NextResponse.json({
      tasks,
      grouped,
      stats,
    })
  } catch (error) {
    console.error("Failed to fetch tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      projectId,
      title,
      description,
      status = "todo",
      priority = "medium",
      assigneeId,
      dueDate,
      phaseId,
      parentId,
    } = body

    // Validate required fields
    if (!projectId || !title) {
      return NextResponse.json(
        { error: "Project ID and title are required" },
        { status: 400 }
      )
    }

    // Get default creator (first admin user for now)
    // In production, this would come from auth session
    let creator = await prisma.user.findFirst({
      where: { role: "admin" },
    })

    // If no admin, get any user
    if (!creator) {
      creator = await prisma.user.findFirst()
    }

    if (!creator) {
      return NextResponse.json(
        { error: "No users found in system" },
        { status: 400 }
      )
    }

    // Get max order for the status column
    const maxOrderTask = await prisma.task.findFirst({
      where: { projectId, status },
      orderBy: { order: "desc" },
    })
    const newOrder = (maxOrderTask?.order ?? 0) + 1

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        status,
        priority,
        assigneeId,
        creatorId: creator.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        phaseId,
        parentId,
        order: newOrder,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        projectId,
        userId: creator.id,
        action: "created_task",
        target: title,
        details: { taskId: task.id },
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Failed to create task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
