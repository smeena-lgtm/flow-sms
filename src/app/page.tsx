"use client"

import { useState, useEffect } from "react"
import {
  FolderKanban,
  Users,
  TrendingUp,
  Building2,
  ArrowUpRight,
  ListTodo,
  Ruler,
  Car,
} from "lucide-react"
import Link from "next/link"
import { DonutChart } from "@/components/charts/donut-chart"
import type { BuildingInfo, BuildingInfoStats } from "@/types/building"

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
  buildings: { stats: BuildingInfoStats; buildings: BuildingInfo[] } | null
  hr: { stats: HRStats } | null
  tasks: TaskStats | null
}

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData>({
    buildings: null,
    hr: null,
    tasks: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true)

        // Fetch all APIs in parallel
        const [buildingsRes, hrRes, tasksRes] = await Promise.all([
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
          buildings: buildingsRes,
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

  const buildingStats = data.buildings?.stats
  const hrStats = data.hr?.stats
  const taskStats = data.tasks
  const recentBuildings = data.buildings?.buildings?.slice(0, 5) || []

  // Chart data - Design Manager breakdown
  const dmData = buildingStats?.byDesignManager
    ? Object.entries(buildingStats.byDesignManager).map(([dm, count], index) => ({
        label: dm || "Unknown",
        value: count,
        color: ["var(--accent-blue)", "var(--accent-green)", "var(--accent-purple)", "var(--accent-cyan)", "var(--accent-yellow)"][index % 5],
      }))
    : []

  // Efficiency distribution
  const efficiencyData = recentBuildings.length > 0
    ? [
        {
          label: "High (≥90%)",
          value: recentBuildings.filter((b) => b.totalSellable.efficiencySaGfa >= 0.9).length,
          color: "var(--accent-green)",
        },
        {
          label: "Good (85-90%)",
          value: recentBuildings.filter((b) => b.totalSellable.efficiencySaGfa >= 0.85 && b.totalSellable.efficiencySaGfa < 0.9).length,
          color: "var(--accent-yellow)",
        },
        {
          label: "Below 85%",
          value: recentBuildings.filter((b) => b.totalSellable.efficiencySaGfa < 0.85).length,
          color: "var(--accent-red)",
        },
      ].filter((d) => d.value > 0)
    : []

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toLocaleString()
  }

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
          title="Total Buildings"
          value={buildingStats?.totalBuildings || 0}
          icon={FolderKanban}
          color="text-accent-blue"
          bgColor="bg-accent-blue/10"
        />
        <StatCard
          title="Total Units"
          value={formatNumber(buildingStats?.totalUnits || 0)}
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

      {/* Building KPIs Row */}
      {buildingStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl bg-bg-card border border-border-color p-4">
            <div className="flex items-center gap-2 text-text-muted mb-2">
              <Ruler className="h-4 w-4" />
              <span className="text-xs">Total GFA</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {formatNumber(buildingStats.totalGfaFt2)} ft²
            </p>
          </div>
          <div className="rounded-xl bg-bg-card border border-border-color p-4">
            <div className="flex items-center gap-2 text-text-muted mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Avg Efficiency</span>
            </div>
            <p className="text-2xl font-bold text-accent-green">
              {(buildingStats.avgEfficiency * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-xl bg-bg-card border border-border-color p-4">
            <div className="flex items-center gap-2 text-text-muted mb-2">
              <Building2 className="h-4 w-4" />
              <span className="text-xs">Avg FAR</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {buildingStats.avgFar.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl bg-bg-card border border-border-color p-4">
            <div className="flex items-center gap-2 text-text-muted mb-2">
              <Car className="h-4 w-4" />
              <span className="text-xs">Total Parking</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {formatNumber(buildingStats.totalParking)}
            </p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By Design Manager */}
        <div className="rounded-2xl bg-bg-card border border-border-color p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">
            By Design Manager
          </h3>
          {dmData.length > 0 ? (
            <DonutChart
              data={dmData}
              size={140}
              strokeWidth={14}
              title="Buildings"
            />
          ) : (
            <div className="text-center py-8 text-text-muted">No data</div>
          )}
        </div>

        {/* Efficiency Distribution */}
        <div className="rounded-2xl bg-bg-card border border-border-color p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">
            Efficiency Distribution
          </h3>
          {efficiencyData.length > 0 ? (
            <DonutChart
              data={efficiencyData}
              size={140}
              strokeWidth={14}
              title="Buildings"
            />
          ) : (
            <div className="text-center py-8 text-text-muted">No data</div>
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

      {/* Recent Buildings Table */}
      <div className="rounded-2xl bg-bg-card border border-border-color overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-border-color">
          <h3 className="text-lg font-semibold text-text-primary">Recent Buildings</h3>
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
                  Building
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                  DM
                </th>
                <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                  Units
                </th>
                <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                  Efficiency
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {recentBuildings.length > 0 ? (
                recentBuildings.map((building, index) => (
                  <tr
                    key={building.identity.plotNo || index}
                    className="hover:bg-bg-card-hover transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-gradient-to-br from-ocean-swell to-accent-blue">
                          {building.identity.numberOfBuildings || 1}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-text-primary">
                            {building.identity.marketingName || building.identity.plotNo}
                          </span>
                          <p className="text-xs text-text-muted">{building.identity.plotNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent-purple/15 text-accent-purple">
                        {building.identity.designManager || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-text-primary">
                      {building.unitCounts.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          building.totalSellable.efficiencySaGfa >= 0.9
                            ? "bg-accent-green/15 text-accent-green"
                            : building.totalSellable.efficiencySaGfa >= 0.85
                            ? "bg-accent-yellow/15 text-accent-yellow"
                            : "bg-accent-red/15 text-accent-red"
                        }`}
                      >
                        {(building.totalSellable.efficiencySaGfa * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                    No buildings found
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
  icon: React.ElementType
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
