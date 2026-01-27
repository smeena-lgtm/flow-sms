import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
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
        _count: {
          select: {
            tasks: true,
            documents: true,
            milestones: true,
          },
        },
      },
    })

    return NextResponse.json(
      projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        client: project.client.name,
        clientId: project.client.id,
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
          role: m.role,
          avatar: m.user.avatar,
        })),
        counts: project._count,
      }))
    )
  } catch (error) {
    console.error("Projects API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}
