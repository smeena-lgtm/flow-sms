"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import {
  FolderPlus,
  ArrowRightLeft,
  CheckCircle2,
  Building2,
  MapPin,
  Map,
  ChevronRight,
} from "lucide-react"

// Dynamically import map to avoid SSR issues
const ProjectMap = dynamic(() => import("@/components/maps/ProjectMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] rounded-xl bg-bg-surface animate-pulse" />
  ),
})

interface PXTProject {
  srNo: string
  plotName: string
  projectName: string
  plotArea: string
  location: string
  status: "PIT" | "POT" | "PHT"
  unitMix: {
    studio: number
    oneBR: number
    twoBR: number
    threeBR: number
    fourBR: number
    liner: number
    total: number
  }
  gfa: {
    residential: number
    commercial: number
    total: number
  }
  sellableArea: {
    residential: number
    commercial: number
    total: number
  }
}

interface PXTData {
  projects: PXTProject[]
  grouped: {
    pit: PXTProject[]
    pot: PXTProject[]
    pht: PXTProject[]
  }
  stats: {
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
  lastUpdated: string
}

const tabs = [
  { id: "all", label: "All Projects", icon: Building2 },
  { id: "pit", label: "PIT - Initiation", icon: FolderPlus },
  { id: "pot", label: "POT - Onboard", icon: CheckCircle2 },
  { id: "pht", label: "PHT - Handover", icon: ArrowRightLeft },
]

export default function ProjectsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [data, setData] = useState<PXTData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch("/api/pxt")
        if (!res.ok) throw new Error("Failed to fetch")
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError("Failed to load project data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getFilteredProjects = () => {
    if (!data) return []
    switch (activeTab) {
      case "pit":
        return data.grouped.pit
      case "pot":
        return data.grouped.pot
      case "pht":
        return data.grouped.pht
      default:
        return data.projects
    }
  }

  const projects = getFilteredProjects()

  const handleProjectClick = (srNo: string) => {
    router.push(`/projects/${encodeURIComponent(srNo)}`)
  }

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
          <StatCard
            label="Total"
            value={data.stats.total}
            color="bg-accent-blue"
          />
          <StatCard
            label="PIT"
            value={data.stats.pit}
            color="bg-accent-yellow"
          />
          <StatCard
            label="POT"
            value={data.stats.pot}
            color="bg-accent-green"
          />
          <StatCard
            label="PHT"
            value={data.stats.pht}
            color="bg-accent-purple"
          />
          <StatCard
            label="Miami"
            value={data.stats.byLocation.miami}
            color="bg-accent-cyan"
          />
          <StatCard
            label="Riyadh"
            value={data.stats.byLocation.riyadh}
            color="bg-accent-pink"
          />
          <StatCard
            label="Total Units"
            value={data.stats.totalUnits.toLocaleString()}
            color="bg-accent-blue"
          />
        </div>
      )}

      {/* Map Section */}
      {data && data.projects.length > 0 && (
        <div className="rounded-2xl bg-bg-card border border-border-color p-4">
          <h2 className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
            <Map className="h-4 w-4" />
            Project Locations
            <span className="ml-auto text-xs">
              {data.stats.byLocation.miami} Miami • {data.stats.byLocation.riyadh} Riyadh
            </span>
          </h2>
          <ProjectMap
            projects={projects}
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
        {tabs.map((tab) => (
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
                ? data?.stats.total || 0
                : tab.id === "pit"
                ? data?.stats.pit || 0
                : tab.id === "pot"
                ? data?.stats.pot || 0
                : data?.stats.pht || 0}
            </span>
          </button>
        ))}
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

      {/* Projects Table */}
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
                    Total Units
                  </th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    GFA
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Unit Mix
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {projects.map((project, index) => (
                  <tr
                    key={project.srNo || index}
                    onClick={() => handleProjectClick(project.srNo)}
                    className="hover:bg-bg-card-hover transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold ${
                            project.location === "MIA"
                              ? "bg-gradient-to-br from-accent-cyan to-accent-blue"
                              : "bg-gradient-to-br from-accent-yellow to-accent-red"
                          }`}
                        >
                          {project.projectName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary group-hover:text-ocean-swell transition-colors">
                            {project.projectName}
                          </p>
                          {project.plotName && (
                            <p className="text-xs text-text-muted">
                              {project.plotName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-text-muted" />
                        <span className="text-sm text-text-secondary">
                          {project.location === "MIA" ? "Miami" : "Riyadh"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
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
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-semibold text-text-primary">
                        {project.unitMix.total.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-text-secondary">
                        {project.gfa.total > 0
                          ? project.gfa.total.toLocaleString()
                          : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {project.unitMix.total > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {project.unitMix.studio > 0 && (
                            <UnitBadge label="ST" value={project.unitMix.studio} />
                          )}
                          {project.unitMix.oneBR > 0 && (
                            <UnitBadge label="1BR" value={project.unitMix.oneBR} />
                          )}
                          {project.unitMix.twoBR > 0 && (
                            <UnitBadge label="2BR" value={project.unitMix.twoBR} />
                          )}
                          {project.unitMix.threeBR > 0 && (
                            <UnitBadge label="3BR" value={project.unitMix.threeBR} />
                          )}
                          {project.unitMix.fourBR > 0 && (
                            <UnitBadge label="4BR" value={project.unitMix.fourBR} />
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-ocean-swell transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {projects.length === 0 && (
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

function StatCard({
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

function UnitBadge({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-bg-surface text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </span>
  )
}
