import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                department: true,
              },
            },
          },
        },
        phases: {
          orderBy: { order: "asc" },
        },
        milestones: {
          orderBy: { dueDate: "asc" },
        },
        tasks: {
          orderBy: { createdAt: "desc" },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        documents: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            documents: true,
            milestones: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: project.id,
      name: project.name,
      description: project.description,
      client: {
        id: project.client.id,
        name: project.client.name,
        email: project.client.email,
        phone: project.client.phone,
      },
      type: project.type,
      status: project.status,
      progress: project.progress,
      location: project.location,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget,
      team: project.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        avatar: m.user.avatar,
        department: m.user.department,
      })),
      phases: project.phases,
      milestones: project.milestones,
      tasks: project.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        assignee: t.assignee,
      })),
      documents: project.documents.map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        fileUrl: d.fileUrl,
        uploadedBy: d.uploader.name,
        createdAt: d.createdAt,
      })),
      activities: project.activities.map((a) => ({
        id: a.id,
        user: a.user.name,
        action: a.action,
        target: a.target,
        time: a.createdAt,
      })),
      counts: project._count,
    })
  } catch (error) {
    console.error("Project detail API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    )
  }
}
