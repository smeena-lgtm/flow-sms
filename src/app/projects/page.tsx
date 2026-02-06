"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import {
  Building2,
  Home,
  Ruler,
  Car,
  TrendingUp,
  Filter,
  ChevronRight,
  ArrowUpDown,
  Layers,
  FolderPlus,
  CheckCircle2,
  ArrowRightLeft,
  Map,
  MapPin,
} from "lucide-react"
import type { BuildingInfo, BuildingInfoStats } from "@/types/building"

// Dynamically import map to avoid SSR issues
const ProjectMap = dynamic(() => import("@/components/maps/ProjectMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] rounded-xl bg-bg-surface animate-pulse" />
  ),
})

interface APIResponse {
  buildings: BuildingInfo[]
  grouped: {
    pit: BuildingInfo[]
    pot: BuildingInfo[]
    pht: BuildingInfo[]
  }
  stats: BuildingInfoStats
  lastUpdated: string
}

const statusTabs = [
  { id: "all", label: "All Projects", icon: Building2 },
  { id: "pit", label: "PIT - Initiation", icon: FolderPlus },
  { id: "pot", label: "POT - Onboard", icon: CheckCircle2 },
  { id: "pht", label: "PHT - Handover", icon: ArrowRightLeft },
]

export default function ProjectsPage() {
  const router = useRouter()
  const [data, setData] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
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

    // Get buildings based on status tab
    let buildings: BuildingInfo[]
    switch (activeTab) {
      case "pit":
        buildings = [...(data.grouped?.pit || [])]
        break
      case "pot":
        buildings = [...(data.grouped?.pot || [])]
        break
      case "pht":
        buildings = [...(data.grouped?.pht || [])]
        break
      default:
        buildings = [...data.buildings]
    }

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

  // Use plotNo if available, otherwise use marketingName as identifier
  const getProjectId = (building: BuildingInfo) => {
    return building.identity.plotNo || building.identity.marketingName
  }

  const handleBuildingClick = (building: BuildingInfo) => {
    const projectId = getProjectId(building)
    if (projectId) {
      router.push(`/projects/${encodeURIComponent(projectId)}`)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toLocaleString()
  }

  const formatPercent = (num: number) => {
    return `${(num * 100).toFixed(1)}%`
  }

  // Transform buildings for map component (needs location for coordinates)
  const mapProjects = buildings.map((b) => ({
    srNo: b.identity.plotNo,
    projectName: b.identity.marketingName || b.identity.plotNo,
    location: b.identity.location,
    status: b.identity.status as "PIT" | "POT" | "PHT",
    unitMix: { total: b.unitCounts.total },
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
          <p className="text-sm text-text-muted mt-1">
            Track projects through Initiation → Onboard → Handover
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <KPICard
            label="Total"
            value={data.stats.totalBuildings}
            color="bg-accent-blue"
          />
          <KPICard
            label="PIT"
            value={data.stats.byStatus?.pit || 0}
            color="bg-accent-yellow"
          />
          <KPICard
            label="POT"
            value={data.stats.byStatus?.pot || 0}
            color="bg-accent-green"
          />
          <KPICard
            label="PHT"
            value={data.stats.byStatus?.pht || 0}
            color="bg-accent-purple"
          />
          <KPICard
            label="Miami"
            value={data.stats.byLocation?.miami || 0}
            color="bg-accent-cyan"
          />
          <KPICard
            label="Riyadh"
            value={data.stats.byLocation?.riyadh || 0}
            color="bg-accent-pink"
          />
          <KPICard
            label="Total Units"
            value={formatNumber(data.stats.totalUnits)}
            color="bg-accent-blue"
          />
        </div>
      )}

      {/* Map Section */}
      {data && buildings.length > 0 && (
        <div className="rounded-2xl bg-bg-card border border-border-color p-4">
          <h2 className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
            <Map className="h-4 w-4" />
            Project Locations
            <span className="ml-auto text-xs">
              {data.stats.byLocation?.miami || 0} Miami • {data.stats.byLocation?.riyadh || 0} Riyadh
            </span>
          </h2>
          <ProjectMap
            projects={mapProjects}
            showAllMarkers={true}
            height="250px"
          />
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-accent-yellow" />
              PIT
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-accent-green" />
              POT
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-accent-purple" />
              PHT
            </span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-accent-blue text-white"
                : "bg-bg-card text-text-secondary hover:bg-bg-card-hover"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? "bg-white/20" : "bg-bg-hover"
              }`}
            >
              {tab.id === "all"
                ? data?.stats.totalBuildings || 0
                : tab.id === "pit"
                ? data?.stats.byStatus?.pit || 0
                : tab.id === "pot"
                ? data?.stats.byStatus?.pot || 0
                : data?.stats.byStatus?.pht || 0}
            </span>
          </button>
        ))}
      </div>

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
                    Project
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Location
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Units
                  </th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    GFA
                  </th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Efficiency
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    DM
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {buildings.map((building, index) => (
                  <tr
                    key={building.identity.plotNo || building.identity.marketingName || index}
                    onClick={() => handleBuildingClick(building)}
                    className="hover:bg-bg-card-hover transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold ${
                            building.identity.location === "MIA"
                              ? "bg-gradient-to-br from-accent-cyan to-accent-blue"
                              : "bg-gradient-to-br from-accent-yellow to-accent-red"
                          }`}
                        >
                          {(building.identity.marketingName || building.identity.plotNo).charAt(0).toUpperCase()}
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
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-text-muted" />
                        <span className="text-sm text-text-secondary">
                          {building.identity.location === "MIA" ? "Miami" : "Riyadh"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          building.identity.status === "PIT"
                            ? "bg-accent-yellow/15 text-accent-yellow"
                            : building.identity.status === "POT"
                            ? "bg-accent-green/15 text-accent-green"
                            : "bg-accent-purple/15 text-accent-purple"
                        }`}
                      >
                        {building.identity.status}
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
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent-purple/15 text-accent-purple">
                        {building.identity.designManager || "-"}
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
              No projects found
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
  label,
  value,
  color,
}: {
  label: string
  value: number | string
  color: string
}) {
  return (
    <div className="rounded-xl bg-bg-card border border-border-color p-4">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-xl font-bold text-text-primary">{value}</span>
      </div>
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
