"use client"

import { useState, useEffect } from "react"
import {
  FolderKanban,
  Users,
  CheckCircle2,
  MapPin,
  ArrowUpRight,
  Building2,
  ListTodo,
} from "lucide-react"
import Link from "next/link"
import { DonutChart } from "@/components/charts/donut-chart"

interface PXTStats {
  total: number
  pit: number
  pot: number
  pht: number
  byLocation: {
    miami: number
    riyadh: number
  }
  totalUnits: number
  totalGFA: number
}

interface PXTProject {
  srNo: string
  projectName: string
  location: string
  status: "PIT" | "POT" | "PHT"
  unitMix: { total: number }
}

interface HRStats {
  totalEmployees: number
  totalTBJ: number
  byOffice: Record<string, number>
}

interface TaskStats {
  todo: number
  inProgress: number
  completed: number
  total: number
}

interface DashboardData {
  pxt: { stats: PXTStats; projects: PXTProject[] } | null
  hr: { stats: HRStats } | null
  tasks: TaskStats | null
}

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData>({
    pxt: null,
    hr: null,
    tasks: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true)

        // Fetch all APIs in parallel
        const [pxtRes, hrRes, tasksRes] = await Promise.all([
          fetch("/api/pxt").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/hr").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tasks").then((r) => (r.ok ? r.json() : null)),
        ])

        // Calculate task stats
        let taskStats: TaskStats | null = null
        if (tasksRes?.grouped) {
          taskStats = {
            todo: tasksRes.grouped.todo?.length || 0,
            inProgress: tasksRes.grouped.in_progress?.length || 0,
            completed: tasksRes.grouped.completed?.length || 0,
            total: tasksRes.tasks?.length || 0,
          }
        }

        setData({
          pxt: pxtRes,
          hr: hrRes,
          tasks: taskStats,
        })
      } catch (err) {
        console.error("Failed to load dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAllData()
  }, [])

  const pxtStats = data.pxt?.stats
  const hrStats = data.hr?.stats
  const taskStats = data.tasks
  const recentProjects = data.pxt?.projects?.slice(0, 5) || []

  // Chart data from real stats
  const projectStatusData = pxtStats
    ? [
        { label: "PIT", value: pxtStats.pit, color: "var(--accent-yellow)" },
        { label: "POT", value: pxtStats.pot, color: "var(--accent-green)" },
        { label: "PHT", value: pxtStats.pht, color: "var(--accent-purple)" },
      ]
    : []

  const locationData = pxtStats
    ? [
        { label: "Miami", value: pxtStats.byLocation.miami, color: "var(--accent-cyan)" },
        { label: "Riyadh", value: pxtStats.byLocation.riyadh, color: "var(--accent-yellow)" },
      ]
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-sm text-text-muted mt-1">
            Overview of all Flow data sources
          </p>
        </div>
      </div>

      {/* Stats Grid - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={pxtStats?.total || 0}
          icon={FolderKanban}
          color="text-accent-blue"
          bgColor="bg-accent-blue/10"
        />
        <StatCard
          title="Total Units"
          value={pxtStats?.totalUnits?.toLocaleString() || "0"}
          icon={Building2}
          color="text-accent-purple"
          bgColor="bg-accent-purple/10"
        />
        <StatCard
          title="Team Members"
          value={hrStats?.totalEmployees || 0}
          icon={Users}
          subtitle={`+ ${hrStats?.totalTBJ || 0} TBJ`}
          color="text-accent-green"
          bgColor="bg-accent-green/10"
        />
        <StatCard
          title="Active Tasks"
          value={(taskStats?.todo || 0) + (taskStats?.inProgress || 0)}
          icon={ListTodo}
          subtitle={`${taskStats?.completed || 0} completed`}
          color="text-accent-cyan"
          bgColor="bg-accent-cyan/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Project Status Donut */}
        <div className="rounded-2xl bg-bg-card border border-border-color p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">
            Projects by Status
          </h3>
          {projectStatusData.length > 0 ? (
            <DonutChart
              data={projectStatusData}
              size={140}
              strokeWidth={14}
              title="Projects"
            />
          ) : (
            <div className="text-center py-8 text-text-muted">No project data</div>
          )}
        </div>

        {/* Location Breakdown */}
        <div className="rounded-2xl bg-bg-card border border-border-color p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">
            Projects by Location
          </h3>
          {locationData.length > 0 ? (
            <DonutChart
              data={locationData}
              size={140}
              strokeWidth={14}
              title="Projects"
            />
          ) : (
            <div className="text-center py-8 text-text-muted">No location data</div>
          )}
        </div>
      </div>

      {/* HR Summary Row */}
      {hrStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl bg-bg-card border border-border-color p-4">
            <p className="text-xs text-text-muted mb-1">MIA Office</p>
            <p className="text-2xl font-bold text-text-primary">
              {hrStats.byOffice?.MIA || 0}
            </p>
          </div>
          <div className="rounded-xl bg-bg-card border border-border-color p-4">
            <p className="text-xs text-text-muted mb-1">KSA Office</p>
            <p className="text-2xl font-bold text-text-primary">
              {hrStats.byOffice?.KSA || 0}
            </p>
          </div>
          <div className="rounded-xl bg-bg-card border border-border-color p-4">
            <p className="text-xs text-text-muted mb-1">DXB Office</p>
            <p className="text-2xl font-bold text-text-primary">
              {hrStats.byOffice?.DXB || 0}
            </p>
          </div>
          <div className="rounded-xl bg-bg-card border border-border-color p-4">
            <p className="text-xs text-text-muted mb-1">To Be Joined</p>
            <p className="text-2xl font-bold text-accent-yellow">
              {hrStats.totalTBJ || 0}
            </p>
          </div>
        </div>
      )}

      {/* Recent Projects Table */}
      <div className="rounded-2xl bg-bg-card border border-border-color overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-border-color">
          <h3 className="text-lg font-semibold text-text-primary">Recent Projects</h3>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
          >
            View all
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-surface">
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                  Project
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                  Location
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                  Units
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {recentProjects.length > 0 ? (
                recentProjects.map((project, index) => (
                  <tr
                    key={project.srNo || index}
                    className="hover:bg-bg-card-hover transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                            project.location === "MIA"
                              ? "bg-gradient-to-br from-accent-cyan to-accent-blue"
                              : "bg-gradient-to-br from-accent-yellow to-accent-red"
                          }`}
                        >
                          {project.projectName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-text-primary">
                          {project.projectName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-text-muted" />
                        <span className="text-sm text-text-secondary">
                          {project.location === "MIA" ? "Miami" : "Riyadh"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          project.status === "PIT"
                            ? "bg-accent-yellow/15 text-accent-yellow"
                            : project.status === "POT"
                            ? "bg-accent-green/15 text-accent-green"
                            : "bg-accent-purple/15 text-accent-purple"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-text-primary">
                      {project.unitMix.total.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  color,
  bgColor,
}: {
  title: string
  value: string | number
  icon: any
  subtitle?: string
  color: string
  bgColor: string
}) {
  return (
    <div className="rounded-2xl bg-bg-card border border-border-color p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-text-muted font-medium">{title}</p>
        <div className={`p-2 rounded-xl ${bgColor}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-text-primary">{value}</p>
      {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
    </div>
  )
}
