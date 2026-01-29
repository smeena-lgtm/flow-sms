import { FolderKanban, Users, Clock, CheckCircle2, Target, ArrowRight, Sparkles, MapPin } from "lucide-react"
import Link from "next/link"
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

      {/* 2026 Goals Preview */}
      <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
        <div className="rounded-xl border border-border-color bg-bg-card overflow-hidden">
          <div className="p-6 border-b border-border-color flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-ocean-swell/20 p-2">
                <Target className="h-5 w-5 text-ocean-swell" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">2026 Goals</h3>
                <p className="text-sm text-text-secondary">7 Initiatives · 7 Projects</p>
              </div>
            </div>
            <Link
              href="/reports?tab=goals"
              className="flex items-center gap-2 text-sm text-ocean-swell hover:text-ocean-swell/80 transition-colors"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Initiatives Preview */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-ocean-swell" />
                  <span className="text-sm font-medium text-text-primary">Key Initiatives</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Cost Verticals & P&L Setup", category: "Finance", quarter: "Q1" },
                    { name: "Design Guide - First Draft", category: "Design", quarter: "Q1-Q3" },
                    { name: "Furniture Alternatives", category: "Procurement", quarter: "Q1" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-bg-dark rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          item.category === "Finance" ? "bg-green-500" :
                          item.category === "Design" ? "bg-heart" :
                          "bg-sunlight"
                        }`} />
                        <span className="text-sm text-text-primary">{item.name}</span>
                      </div>
                      <span className="text-xs text-text-secondary bg-bg-hover px-2 py-1 rounded">{item.quarter}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Roadmap Preview */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-heart" />
                  <span className="text-sm font-medium text-text-primary">Q1 Milestones</span>
                </div>
                <div className="space-y-3">
                  {[
                    { project: "Olaya", location: "Riyadh", milestone: "Delivery" },
                    { project: "Brickell", location: "Miami", milestone: "SAP Filing" },
                    { project: "Aventura", location: "Miami", milestone: "Soft Launch" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-bg-dark rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-text-primary">{item.project}</span>
                        <span className="text-xs text-text-secondary ml-2">{item.location}</span>
                      </div>
                      <span className="text-xs text-ocean-swell bg-ocean-swell/10 px-2 py-1 rounded border border-ocean-swell/30">
                        {item.milestone}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
