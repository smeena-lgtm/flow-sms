import { FolderKanban, Users, Clock, CheckCircle2 } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ProjectsTable } from "@/components/dashboard/projects-table"
import { MilestoneOverview } from "@/components/dashboard/milestone-overview"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { prisma } from "@/lib/db"

async function getDashboardData() {
  const [
    activeProjects,
    totalMembers,
    pendingTasks,
    completedThisMonth,
    recentProjects,
    upcomingMilestones,
    recentActivities,
  ] = await Promise.all([
    prisma.project.count({ where: { status: "active" } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.task.count({ where: { status: { in: ["todo", "in_progress"] } } }),
    prisma.task.count({
      where: {
        status: "completed",
        completedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.project.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        client: true,
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    }),
    prisma.milestone.findMany({
      take: 5,
      where: { status: { in: ["pending", "in_progress", "overdue"] } },
      orderBy: { dueDate: "asc" },
      include: { project: { select: { name: true } } },
    }),
    prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        project: { select: { name: true } },
      },
    }),
  ])

  return {
    stats: { activeProjects, totalMembers, pendingTasks, completedThisMonth },
    recentProjects,
    upcomingMilestones,
    recentActivities,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <StatCard
            title="Active Projects"
            value={data.stats.activeProjects}
            icon={FolderKanban}
            trend={{ value: 8, isPositive: true }}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <StatCard
            title="Team Members"
            value={data.stats.totalMembers}
            icon={Users}
            trend={{ value: 4, isPositive: true }}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <StatCard
            title="Pending Tasks"
            value={data.stats.pendingTasks}
            icon={Clock}
            trend={{ value: 12, isPositive: false }}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <StatCard
            title="Completed This Month"
            value={data.stats.completedThisMonth}
            icon={CheckCircle2}
            trend={{ value: 25, isPositive: true }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <div className="xl:col-span-2 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <ProjectsTable projects={data.recentProjects} />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <MilestoneOverview milestones={data.upcomingMilestones} />
        </div>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <div className="xl:col-span-2 animate-fade-in" style={{ animationDelay: "0.7s" }}>
          <ActivityFeed activities={data.recentActivities} />
        </div>
      </div>
    </div>
  )
}
