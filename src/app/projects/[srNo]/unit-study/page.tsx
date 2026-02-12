"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  LayoutGrid,
  Layers,
  Ruler,
  ChevronUp,
  ChevronDown,
  Car,
} from "lucide-react"
import { getUnitStudy, BEDROOM_COLORS } from "@/data/unit-studies"
import type { UnitPrototype, BedroomSummary, FloorBreakdown } from "@/data/unit-studies"

export default function UnitStudyPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = decodeURIComponent(params.srNo as string)
  const project = getUnitStudy(projectId)

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted mb-4">No unit study available for this project</p>
        <button onClick={() => router.back()} className="text-ocean-swell hover:underline">
          ← Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-bg-card hover:bg-bg-card-hover transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">{project.name}</h1>
          <p className="text-sm text-text-muted">{project.address}</p>
        </div>
      </div>

      {/* Hero Stats */}
      <HeroSection project={project} />

      {/* Tower Breakdown */}
      <TowerSection towers={project.towers} />

      {/* Bedroom Distribution */}
      <BedroomDistribution
        summaries={project.bedroomSummaries}
        totalUnits={project.totalUnits}
      />

      {/* Prototype Explorer */}
      <PrototypeExplorer
        prototypes={project.prototypes}
        summaries={project.bedroomSummaries}
      />

      {/* Floor-by-Floor */}
      <FloorByFloor floors={project.floors} />

      {/* Size Ranges */}
      <SizeRanges summaries={project.bedroomSummaries} />
    </div>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────

function HeroSection({ project }: { project: ReturnType<typeof getUnitStudy> & {} }) {
  return (
    <div className="rounded-2xl bg-bg-card border border-ocean-swell/20 p-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatPill label="Total Units" value={project.totalUnits.toLocaleString()} color="text-ocean-swell" />
        <StatPill label="Levels" value={String(project.levels)} color="text-accent-green" />
        <StatPill label="Height" value={`${project.maxHeightFt} ft`} color="text-accent-purple" />
        <StatPill label="Parking" value={project.parking.toLocaleString()} color="text-accent-yellow" />
      </div>
    </div>
  )
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center p-3 rounded-xl bg-bg-surface">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-text-muted mt-1">{label}</p>
    </div>
  )
}

// ─── Tower Section ────────────────────────────────────────────────────

function TowerSection({ towers }: { towers: ReturnType<typeof getUnitStudy> extends infer T ? T extends { towers: infer R } ? R : never : never }) {
  return (
    <SectionCard title="Tower Breakdown" icon={Building2}>
      <div className="grid grid-cols-3 gap-4">
        {towers.map((tower) => (
          <div
            key={tower.name}
            className="rounded-xl bg-bg-surface p-4 text-center border border-transparent hover:border-border-color transition-colors"
          >
            <Building2 className="h-6 w-6 mx-auto mb-2" style={{ color: tower.color }} />
            <p className="text-2xl font-bold text-text-primary">{tower.units}</p>
            <p className="text-sm font-medium text-text-primary mt-1">{tower.name}</p>
            <p className="text-xs text-text-muted">{tower.type}</p>
            <p className="text-xs mt-1" style={{ color: tower.color }}>L{tower.levels}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Bedroom Distribution ─────────────────────────────────────────────

function BedroomDistribution({ summaries, totalUnits }: { summaries: BedroomSummary[]; totalUnits: number }) {
  return (
    <SectionCard title="Bedroom Distribution" icon={LayoutGrid}>
      {/* Stacked bar */}
      <div className="flex h-8 rounded-lg overflow-hidden mb-4">
        {summaries.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-center text-xs font-bold text-white"
            style={{ width: `${s.mixPct * 100}%`, backgroundColor: s.color }}
          >
            {s.mixPct > 0.06 && `${(s.mixPct * 100).toFixed(0)}%`}
          </div>
        ))}
      </div>

      {/* Distribution bars */}
      <div className="space-y-3 mb-6">
        {summaries.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-14">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-sm font-medium text-text-primary">{s.label}</span>
            </div>
            <div className="flex-1 h-2 bg-bg-surface rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${s.mixPct * 100}%`, backgroundColor: s.color }} />
            </div>
            <div className="text-right w-20">
              <span className="text-sm font-semibold text-text-primary">{s.subtotal}</span>
              <span className="text-xs text-text-muted ml-1">({(s.mixPct * 100).toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tenure split table */}
      <div className="rounded-xl bg-bg-surface overflow-hidden">
        <div className="grid grid-cols-5 gap-px bg-border-color text-xs">
          <div className="bg-bg-card p-3 font-medium text-text-muted">Type</div>
          <div className="bg-bg-card p-3 font-medium text-ocean-swell text-right">Rental</div>
          <div className="bg-bg-card p-3 font-medium text-accent-green text-right">Condo</div>
          <div className="bg-bg-card p-3 font-medium text-accent-yellow text-right">Liner</div>
          <div className="bg-bg-card p-3 font-medium text-text-primary text-right">Total</div>
        </div>
        {summaries.map((s) => (
          <div key={s.label} className="grid grid-cols-5 gap-px bg-border-color text-sm">
            <div className="bg-bg-card p-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </div>
            <div className="bg-bg-card p-3 text-right text-ocean-swell">{s.rental}</div>
            <div className="bg-bg-card p-3 text-right text-accent-green">{s.condoApt}</div>
            <div className={`bg-bg-card p-3 text-right ${s.condoLiner > 0 ? "text-accent-yellow" : "text-text-muted/30"}`}>{s.condoLiner}</div>
            <div className="bg-bg-card p-3 text-right font-semibold text-text-primary">{s.subtotal}</div>
          </div>
        ))}
        <div className="grid grid-cols-5 gap-px bg-border-color text-sm font-semibold">
          <div className="bg-bg-card p-3 text-text-primary">Total</div>
          <div className="bg-bg-card p-3 text-right text-ocean-swell">{summaries.reduce((a, b) => a + b.rental, 0)}</div>
          <div className="bg-bg-card p-3 text-right text-accent-green">{summaries.reduce((a, b) => a + b.condoApt, 0)}</div>
          <div className="bg-bg-card p-3 text-right text-accent-yellow">{summaries.reduce((a, b) => a + b.condoLiner, 0)}</div>
          <div className="bg-bg-card p-3 text-right text-text-primary">{totalUnits}</div>
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Prototype Explorer ───────────────────────────────────────────────

function PrototypeExplorer({ prototypes, summaries }: { prototypes: UnitPrototype[]; summaries: BedroomSummary[] }) {
  const [filter, setFilter] = useState<number | null>(null)

  const filtered = filter ? prototypes.filter((p) => p.bedroomCount === filter) : prototypes
  const maxGfa = Math.max(...prototypes.map((p) => p.gfaSf))

  return (
    <SectionCard title="Prototype Catalog" icon={Layers}>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterPill label="All" count={prototypes.length} active={filter === null} onClick={() => setFilter(null)} color="#7DADBB" />
        {summaries.map((s) => (
          <FilterPill
            key={s.bedroomCount}
            label={s.label}
            count={s.uniqueTypes}
            active={filter === s.bedroomCount}
            onClick={() => setFilter(filter === s.bedroomCount ? null : s.bedroomCount)}
            color={s.color}
          />
        ))}
      </div>

      <p className="text-xs text-text-muted mb-3">{filtered.length} unique prototypes</p>

      {/* Prototype cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((proto) => (
          <PrototypeCard key={proto.id} proto={proto} maxGfa={maxGfa} />
        ))}
      </div>
    </SectionCard>
  )
}

function FilterPill({ label, count, active, onClick, color }: { label: string; count: number; active: boolean; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active ? "text-bg-dark" : "text-text-muted bg-bg-surface hover:bg-bg-card-hover"
      }`}
      style={active ? { backgroundColor: color } : undefined}
    >
      {label}
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? "bg-white/20" : "bg-bg-dark"}`}>
        {count}
      </span>
    </button>
  )
}

function PrototypeCard({ proto, maxGfa }: { proto: UnitPrototype; maxGfa: number }) {
  const color = BEDROOM_COLORS[proto.bedroomCount] || "#7DADBB"
  return (
    <div className="rounded-xl bg-bg-surface p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {proto.id}
          </span>
          <span className="text-xs text-text-muted flex items-center gap-1">
            {proto.category === "Liner" ? <Car className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
            {proto.category}
          </span>
        </div>
        <span className="text-sm font-semibold text-text-primary">{proto.unitCount} units</span>
      </div>

      {/* GFA bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-text-primary w-14">{proto.gfaSf} sf</span>
        <div className="flex-1 h-2 bg-bg-dark rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${(proto.gfaSf / maxGfa) * 100}%`, backgroundColor: color, opacity: 0.7 }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="flex gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <Building2 className="h-3 w-3" /> {proto.towers}
        </span>
        <span className="flex items-center gap-1">
          <ChevronUp className="h-3 w-3" /> L{proto.levels}
        </span>
      </div>

      {/* Notes */}
      <p className="text-xs text-text-muted/70">{proto.notes}</p>
    </div>
  )
}

// ─── Floor-by-Floor ───────────────────────────────────────────────────

function FloorByFloor({ floors }: { floors: FloorBreakdown[] }) {
  const residentialFloors = floors.filter((f) => f.total > 0)
  const maxUnits = Math.max(...residentialFloors.map((f) => f.total))

  return (
    <SectionCard title="Floor-by-Floor" icon={Layers}>
      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs text-text-muted">
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-ocean-swell" /> Rental</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-accent-green" /> Condo</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-accent-yellow" /> Liner</span>
      </div>

      {/* Floor rows — top floor first */}
      <div className="space-y-1">
        {[...residentialFloors].reverse().map((floor) => (
          <div key={floor.level} className="flex items-center gap-2 group">
            <span className="text-xs text-text-muted w-6 text-right font-mono">{floor.levelDisplay}</span>
            <span className="text-[10px] w-3 text-center" title={floor.classification}>
              {floor.classification === "Podium" ? "◆" : floor.classification.startsWith("Parking") ? "P" : floor.classification === "Resi + Clubhouse" ? "★" : "●"}
            </span>
            <div className="flex-1 flex gap-0.5 h-4">
              {floor.rental > 0 && (
                <div
                  className="bg-ocean-swell rounded-sm"
                  style={{ width: `${(floor.rental / maxUnits) * 100}%` }}
                />
              )}
              {floor.condo > 0 && (
                <div
                  className="bg-accent-green rounded-sm"
                  style={{ width: `${(floor.condo / maxUnits) * 100}%` }}
                />
              )}
              {floor.liner > 0 && (
                <div
                  className="bg-accent-yellow rounded-sm"
                  style={{ width: `${(floor.liner / maxUnits) * 100}%` }}
                />
              )}
            </div>
            <span className="text-xs font-medium text-text-primary w-6 text-right">{floor.total}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Size Ranges ──────────────────────────────────────────────────────

function SizeRanges({ summaries }: { summaries: BedroomSummary[] }) {
  const maxSf = Math.max(...summaries.map((s) => s.maxGfa))

  return (
    <SectionCard title="Size Ranges" icon={Ruler}>
      <div className="space-y-4">
        {summaries.map((s) => {
          const startPct = (s.minGfa / maxSf) * 100
          const widthPct = Math.max(((s.maxGfa - s.minGfa) / maxSf) * 100, 1)

          return (
            <div key={s.label} className="rounded-xl bg-bg-surface p-4">
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-sm font-medium text-text-primary">{s.label}</span>
                </div>
                <div className="flex gap-3 text-xs text-text-muted">
                  <span>{s.uniqueTypes} types</span>
                  <span>Min. {s.minApprovedSf} sf</span>
                </div>
              </div>

              {/* Range bar */}
              <div className="relative h-3 bg-bg-dark rounded-full overflow-visible mb-2">
                <div
                  className="absolute h-full rounded-full"
                  style={{
                    left: `${startPct}%`,
                    width: `${widthPct}%`,
                    background: `linear-gradient(90deg, ${s.color}99, ${s.color})`,
                  }}
                />
              </div>

              <div className="flex justify-between text-xs" style={{ color: s.color }}>
                <span>{s.minGfa} sf</span>
                <span>{s.maxGfa} sf</span>
              </div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-bg-card border border-border-color p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-ocean-swell" />
        {title}
      </h2>
      {children}
    </div>
  )
}
