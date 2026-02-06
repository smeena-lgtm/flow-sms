"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Home,
  Ruler,
  Car,
  TrendingUp,
  Users,
  Filter,
  ChevronRight,
  ArrowUpDown,
  Layers,
} from "lucide-react"
import type { BuildingInfo, BuildingInfoStats } from "@/types/building"

interface APIResponse {
  buildings: BuildingInfo[]
  stats: BuildingInfoStats
  lastUpdated: string
}

export default function ProjectsPage() {
  const router = useRouter()
  const [data, setData] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dmFilter, setDmFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("plotNo")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch("/api/pxt")
        if (!res.ok) throw new Error("Failed to fetch")
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError("Failed to load building data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getFilteredAndSortedBuildings = () => {
    if (!data) return []
    let buildings = [...data.buildings]

    // Filter by Design Manager
    if (dmFilter !== "all") {
      buildings = buildings.filter(
        (b) => b.identity.designManager === dmFilter
      )
    }

    // Sort
    buildings.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "plotNo":
          comparison = a.identity.plotNo.localeCompare(b.identity.plotNo)
          break
        case "units":
          comparison = a.unitCounts.total - b.unitCounts.total
          break
        case "gfa":
          comparison = a.gfa.totalProposedGfaFt2 - b.gfa.totalProposedGfaFt2
          break
        case "efficiency":
          comparison = a.totalSellable.efficiencySaGfa - b.totalSellable.efficiencySaGfa
          break
        case "far":
          comparison = a.identity.far - b.identity.far
          break
        case "height":
          comparison = a.liftsHeight.heightFt - b.liftsHeight.heightFt
          break
      }
      return sortDir === "asc" ? comparison : -comparison
    })

    return buildings
  }

  const buildings = getFilteredAndSortedBuildings()
  const designManagers = data
    ? Array.from(new Set(data.buildings.map((b) => b.identity.designManager))).filter(Boolean)
    : []

  const handleBuildingClick = (plotNo: string) => {
    router.push(`/projects/${encodeURIComponent(plotNo)}`)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toLocaleString()
  }

  const formatPercent = (num: number) => {
    return `${(num * 100).toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Buildings</h1>
          <p className="text-sm text-text-muted mt-1">
            Building Information Summary - {data?.stats.totalBuildings || 0} plots
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <KPICard
            icon={Building2}
            label="Buildings"
            value={data.stats.totalBuildings}
            color="bg-accent-blue"
          />
          <KPICard
            icon={Home}
            label="Total Units"
            value={formatNumber(data.stats.totalUnits)}
            color="bg-accent-green"
          />
          <KPICard
            icon={Ruler}
            label="Total GFA"
            value={`${formatNumber(data.stats.totalGfaFt2)} ft²`}
            color="bg-accent-purple"
          />
          <KPICard
            icon={TrendingUp}
            label="Avg Efficiency"
            value={formatPercent(data.stats.avgEfficiency)}
            color="bg-accent-cyan"
          />
          <KPICard
            icon={Layers}
            label="Avg FAR"
            value={data.stats.avgFar.toFixed(2)}
            color="bg-accent-yellow"
          />
          <KPICard
            icon={Car}
            label="Total Parking"
            value={formatNumber(data.stats.totalParking)}
            color="bg-accent-pink"
          />
          <KPICard
            icon={Users}
            label="Design Mgrs"
            value={Object.keys(data.stats.byDesignManager).length}
            color="bg-accent-red"
          />
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-muted" />
          <select
            value={dmFilter}
            onChange={(e) => setDmFilter(e.target.value)}
            className="bg-bg-card border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-ocean-swell"
          >
            <option value="all">All Design Managers</option>
            {designManagers.map((dm) => (
              <option key={dm} value={dm}>
                {dm}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-bg-card border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-ocean-swell"
          >
            <option value="plotNo">Plot No</option>
            <option value="units">Units</option>
            <option value="gfa">GFA</option>
            <option value="efficiency">Efficiency</option>
            <option value="far">FAR</option>
            <option value="height">Height</option>
          </select>
          <button
            onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
            className="p-2 rounded-lg bg-bg-card border border-border-color hover:bg-bg-card-hover transition-colors"
          >
            <span className="text-xs text-text-muted">
              {sortDir === "asc" ? "↑" : "↓"}
            </span>
          </button>
        </div>

        <span className="text-sm text-text-muted ml-auto">
          Showing {buildings.length} of {data?.stats.totalBuildings || 0}
        </span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-20 text-accent-red">{error}</div>
      )}

      {/* Buildings Table */}
      {!loading && !error && (
        <div className="rounded-2xl bg-bg-card border border-border-color overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-surface">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Building
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    DM
                  </th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Units
                  </th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    GFA (ft²)
                  </th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Efficiency
                  </th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    FAR
                  </th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Height
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Config
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {buildings.map((building, index) => (
                  <tr
                    key={building.identity.plotNo || index}
                    onClick={() => handleBuildingClick(building.identity.plotNo)}
                    className="hover:bg-bg-card-hover transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-swell to-accent-blue flex items-center justify-center text-white font-semibold">
                          {building.identity.numberOfBuildings || 1}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary group-hover:text-ocean-swell transition-colors">
                            {building.identity.marketingName || building.identity.plotNo}
                          </p>
                          <p className="text-xs text-text-muted">
                            {building.identity.plotNo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent-purple/15 text-accent-purple">
                        {building.identity.designManager || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-semibold text-text-primary">
                        {building.unitCounts.total.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-text-secondary">
                        {formatNumber(building.gfa.totalProposedGfaFt2)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <EfficiencyBadge value={building.totalSellable.efficiencySaGfa} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-text-secondary">
                        {building.identity.far.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-text-secondary">
                        {building.liftsHeight.heightFt > 0
                          ? `${building.liftsHeight.heightFt.toLocaleString()} ft`
                          : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-text-muted font-mono">
                        {building.liftsHeight.buildingConfiguration || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-ocean-swell transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {buildings.length === 0 && (
            <div className="text-center py-12 text-text-muted">
              No buildings found
            </div>
          )}
        </div>
      )}

      {/* Last Updated */}
      {data && (
        <p className="text-xs text-text-muted text-right">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  )
}

function KPICard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  color: string
}) {
  return (
    <div className="rounded-xl bg-bg-card border border-border-color p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <span className="text-xl font-bold text-text-primary">{value}</span>
    </div>
  )
}

function EfficiencyBadge({ value }: { value: number }) {
  const percent = value * 100
  let colorClass = "bg-accent-red/15 text-accent-red"

  if (percent >= 90) {
    colorClass = "bg-accent-green/15 text-accent-green"
  } else if (percent >= 85) {
    colorClass = "bg-accent-yellow/15 text-accent-yellow"
  } else if (percent >= 80) {
    colorClass = "bg-accent-cyan/15 text-accent-cyan"
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {percent.toFixed(1)}%
    </span>
  )
}
