import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    // Get dashboard stats
    const [
      activeProjects,
      totalMembers,
      pendingTasks,
      completedThisMonth,
      recentProjects,
      upcomingMilestones,
      recentActivities,
    ] = await Promise.all([
      // Active projects count
      prisma.project.count({
        where: { status: "active" },
      }),

      // Total team members
      prisma.user.count({
        where: { isActive: true },
      }),

      // Pending tasks (todo + in_progress)
      prisma.task.count({
        where: {
          status: { in: ["todo", "in_progress"] },
        },
      }),

      // Completed tasks this month
      prisma.task.count({
        where: {
          status: "completed",
          completedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Recent projects with team members
      prisma.project.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: {
          client: true,
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  role: true,
                },
              },
            },
          },
        },
      }),

      // Upcoming milestones
      prisma.milestone.findMany({
        take: 5,
        where: {
          status: { in: ["pending", "in_progress", "overdue"] },
        },
        orderBy: { dueDate: "asc" },
        include: {
          project: {
            select: { name: true },
          },
        },
      }),

      // Recent activities
      prisma.activity.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          project: {
            select: { name: true },
          },
        },
      }),
    ])

    return NextResponse.json({
      stats: {
        activeProjects,
        totalMembers,
        pendingTasks,
        completedThisMonth,
      },
      recentProjects: recentProjects.map((project) => ({
        id: project.id,
        name: project.name,
        client: project.client.name,
        type: project.type,
        status: project.status,
        progress: project.progress,
        location: project.location,
        startDate: project.startDate,
        endDate: project.endDate,
        team: project.members.map((m) => ({
          id: m.user.id,
          name: m.user.name,
          role: m.role,
          avatar: m.user.avatar,
        })),
      })),
      upcomingMilestones: upcomingMilestones.map((m) => ({
        id: m.id,
        name: m.name,
        project: m.project.name,
        dueDate: m.dueDate,
        status: m.status,
      })),
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        user: a.user.name,
        action: a.action,
        target: a.target,
        time: a.createdAt,
      })),
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
