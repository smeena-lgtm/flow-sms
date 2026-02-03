"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import {
  ArrowLeft,
  Building2,
  MapPin,
  Ruler,
  Home,
  LayoutGrid,
  TrendingUp,
} from "lucide-react"

// Dynamically import map to avoid SSR issues
const ProjectMap = dynamic(() => import("@/components/maps/ProjectMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] rounded-xl bg-bg-surface animate-pulse" />
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

const statusConfig = {
  PIT: {
    label: "Project Initiation",
    color: "text-accent-yellow",
    bg: "bg-accent-yellow/15",
    description: "Project in initiation phase",
  },
  POT: {
    label: "Project Onboard",
    color: "text-accent-green",
    bg: "bg-accent-green/15",
    description: "Project is onboarded and active",
  },
  PHT: {
    label: "Project Handover",
    color: "text-accent-purple",
    bg: "bg-accent-purple/15",
    description: "Project in handover phase",
  },
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<PXTProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const srNo = params.srNo as string

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true)
        const res = await fetch("/api/pxt")
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        const found = data.projects.find(
          (p: PXTProject) => p.srNo === decodeURIComponent(srNo)
        )
        if (!found) throw new Error("Project not found")
        setProject(found)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project")
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [srNo])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-bg-surface rounded-xl" />
        <div className="h-[300px] bg-bg-surface rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-bg-surface rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center py-20">
        <p className="text-accent-red mb-4">{error || "Project not found"}</p>
        <button
          onClick={() => router.push("/projects")}
          className="text-ocean-swell hover:underline"
        >
          ← Back to Projects
        </button>
      </div>
    )
  }

  const status = statusConfig[project.status]
  const locationName = project.location === "MIA" ? "Miami, FL" : "Riyadh, KSA"

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/projects")}
          className="p-2 rounded-xl bg-bg-card hover:bg-bg-card-hover transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">
            {project.projectName}
          </h1>
          <p className="text-sm text-text-muted">{project.plotName}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Map */}
      <div className="rounded-2xl bg-bg-card border border-border-color p-4">
        <h2 className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location: {locationName}
        </h2>
        <ProjectMap
          projects={[project]}
          selectedProject={project.srNo}
          showAllMarkers={false}
          height="300px"
        />
      </div>

      {/* Project Info Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          icon={Building2}
          label="Plot Area"
          value={project.plotArea || "N/A"}
        />
        <InfoCard
          icon={MapPin}
          label="Location"
          value={locationName}
        />
        <InfoCard
          icon={LayoutGrid}
          label="Status"
          value={project.status}
          valueColor={status.color}
        />
        <InfoCard
          icon={Home}
          label="Total Units"
          value={project.unitMix.total.toLocaleString()}
        />
      </div>

      {/* Unit Mix Section */}
      <div className="rounded-2xl bg-bg-card border border-border-color p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Home className="h-5 w-5 text-ocean-swell" />
          Unit Mix
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          <UnitCard label="Studio" value={project.unitMix.studio} />
          <UnitCard label="1 BR" value={project.unitMix.oneBR} />
          <UnitCard label="2 BR" value={project.unitMix.twoBR} />
          <UnitCard label="3 BR" value={project.unitMix.threeBR} />
          <UnitCard label="4 BR" value={project.unitMix.fourBR} />
          <UnitCard label="Liner" value={project.unitMix.liner} />
          <UnitCard label="Total" value={project.unitMix.total} highlight />
        </div>

        {/* Unit Mix Bar Chart */}
        {project.unitMix.total > 0 && (
          <div className="mt-6">
            <div className="flex h-8 rounded-lg overflow-hidden">
              {project.unitMix.studio > 0 && (
                <div
                  className="bg-accent-cyan flex items-center justify-center text-xs font-medium text-white"
                  style={{
                    width: `${(project.unitMix.studio / project.unitMix.total) * 100}%`,
                  }}
                >
                  {project.unitMix.studio > project.unitMix.total * 0.05 && "ST"}
                </div>
              )}
              {project.unitMix.oneBR > 0 && (
                <div
                  className="bg-accent-blue flex items-center justify-center text-xs font-medium text-white"
                  style={{
                    width: `${(project.unitMix.oneBR / project.unitMix.total) * 100}%`,
                  }}
                >
                  {project.unitMix.oneBR > project.unitMix.total * 0.05 && "1BR"}
                </div>
              )}
              {project.unitMix.twoBR > 0 && (
                <div
                  className="bg-accent-green flex items-center justify-center text-xs font-medium text-white"
                  style={{
                    width: `${(project.unitMix.twoBR / project.unitMix.total) * 100}%`,
                  }}
                >
                  {project.unitMix.twoBR > project.unitMix.total * 0.05 && "2BR"}
                </div>
              )}
              {project.unitMix.threeBR > 0 && (
                <div
                  className="bg-accent-yellow flex items-center justify-center text-xs font-medium text-black"
                  style={{
                    width: `${(project.unitMix.threeBR / project.unitMix.total) * 100}%`,
                  }}
                >
                  {project.unitMix.threeBR > project.unitMix.total * 0.05 && "3BR"}
                </div>
              )}
              {project.unitMix.fourBR > 0 && (
                <div
                  className="bg-accent-purple flex items-center justify-center text-xs font-medium text-white"
                  style={{
                    width: `${(project.unitMix.fourBR / project.unitMix.total) * 100}%`,
                  }}
                >
                  {project.unitMix.fourBR > project.unitMix.total * 0.05 && "4BR"}
                </div>
              )}
              {project.unitMix.liner > 0 && (
                <div
                  className="bg-accent-pink flex items-center justify-center text-xs font-medium text-white"
                  style={{
                    width: `${(project.unitMix.liner / project.unitMix.total) * 100}%`,
                  }}
                >
                  {project.unitMix.liner > project.unitMix.total * 0.05 && "LN"}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-text-muted">
              {project.unitMix.studio > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-accent-cyan" /> Studio
                </span>
              )}
              {project.unitMix.oneBR > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-accent-blue" /> 1BR
                </span>
              )}
              {project.unitMix.twoBR > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-accent-green" /> 2BR
                </span>
              )}
              {project.unitMix.threeBR > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-accent-yellow" /> 3BR
                </span>
              )}
              {project.unitMix.fourBR > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-accent-purple" /> 4BR
                </span>
              )}
              {project.unitMix.liner > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-accent-pink" /> Liner
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* GFA Section */}
      <div className="rounded-2xl bg-bg-card border border-border-color p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Ruler className="h-5 w-5 text-ocean-swell" />
          Gross Floor Area (GFA)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AreaCard
            label="Residential"
            value={project.gfa.residential}
            total={project.gfa.total}
            color="bg-accent-blue"
          />
          <AreaCard
            label="Commercial"
            value={project.gfa.commercial}
            total={project.gfa.total}
            color="bg-accent-green"
          />
          <AreaCard
            label="Total GFA"
            value={project.gfa.total}
            total={project.gfa.total}
            color="bg-ocean-swell"
            highlight
          />
        </div>
      </div>

      {/* Sellable Area Section */}
      <div className="rounded-2xl bg-bg-card border border-border-color p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-ocean-swell" />
          Sellable Area
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AreaCard
            label="Residential"
            value={project.sellableArea.residential}
            total={project.sellableArea.total}
            color="bg-accent-blue"
          />
          <AreaCard
            label="Commercial"
            value={project.sellableArea.commercial}
            total={project.sellableArea.total}
            color="bg-accent-green"
          />
          <AreaCard
            label="Total Sellable"
            value={project.sellableArea.total}
            total={project.sellableArea.total}
            color="bg-ocean-swell"
            highlight
          />
        </div>
      </div>
    </div>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ElementType
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <div className="rounded-xl bg-bg-card border border-border-color p-4">
      <div className="flex items-center gap-2 text-text-muted mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-lg font-semibold ${valueColor || "text-text-primary"}`}>
        {value}
      </p>
    </div>
  )
}

function UnitCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl p-4 text-center ${
        highlight
          ? "bg-ocean-swell/10 border-2 border-ocean-swell"
          : "bg-bg-surface"
      }`}
    >
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p
        className={`text-xl font-bold ${
          highlight ? "text-ocean-swell" : "text-text-primary"
        }`}
      >
        {value > 0 ? value.toLocaleString() : "-"}
      </p>
    </div>
  )
}

function AreaCard({
  label,
  value,
  total,
  color,
  highlight,
}: {
  label: string
  value: number
  total: number
  color: string
  highlight?: boolean
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <div
      className={`rounded-xl p-4 ${
        highlight ? "bg-ocean-swell/10 border-2 border-ocean-swell" : "bg-bg-surface"
      }`}
    >
      <p className="text-xs text-text-muted mb-2">{label}</p>
      <p
        className={`text-2xl font-bold mb-2 ${
          highlight ? "text-ocean-swell" : "text-text-primary"
        }`}
      >
        {value > 0 ? value.toLocaleString() : "-"}
        {value > 0 && <span className="text-sm font-normal text-text-muted ml-1">sqm</span>}
      </p>
      {!highlight && total > 0 && (
        <div className="h-2 bg-bg-dark rounded-full overflow-hidden">
          <div
            className={`h-full ${color} rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}
