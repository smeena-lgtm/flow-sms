"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import {
  CalendarRange,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Pause,
  X,
  Diamond,
  List,
  BarChart3,
  Users,
  Info,
} from "lucide-react"
import type { ProjectProgram, ProgramStage, StageStatus } from "@/types/program"

interface ProgramGanttProps {
  projectId: string
  projectName?: string
}

interface TimelineMonth {
  year: number
  month: number
  label: string
  startPx: number
  width: number
}

interface TooltipData {
  stage: ProgramStage
  x: number
  y: number
}

const MONTH_W = 72
const ROW_H = 44
const LABEL_W = 260

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

const CAT_GRADIENT: Record<string, string> = {
  design:       "from-indigo-500 to-indigo-400",
  approvals:    "from-purple-500 to-purple-400",
  construction: "from-cyan-500 to-cyan-400",
  handover:     "from-emerald-500 to-emerald-400",
}

const CAT_BG: Record<string, string> = {
  design:       "bg-indigo-500",
  approvals:    "bg-purple-500",
  construction: "bg-cyan-500",
  handover:     "bg-emerald-500",
}

const CAT_DOT: Record<string, string> = {
  design:       "bg-indigo-400",
  approvals:    "bg-purple-400",
  construction: "bg-cyan-400",
  handover:     "bg-emerald-400",
}

const CAT_DIAMOND: Record<string, string> = {
  design:       "text-indigo-400",
  approvals:    "text-purple-400",
  construction: "text-cyan-400",
  handover:     "text-emerald-400",
}

const STATUS_BADGE: Record<StageStatus, string> = {
  completed:   "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
  in_progress: "bg-indigo-500/20 border-indigo-500/40 text-indigo-300",
  upcoming:    "bg-slate-500/20 border-slate-500/40 text-slate-400",
  on_hold:     "bg-amber-500/20 border-amber-500/40 text-amber-300",
  cancelled:   "bg-red-500/20 border-red-500/40 text-red-400",
}

const STATUS_LABEL: Record<StageStatus, string> = {
  completed: "Completed", in_progress: "In Progress",
  upcoming: "Upcoming", on_hold: "On Hold", cancelled: "Cancelled",
}

function StatusIcon({ status, className = "w-3.5 h-3.5" }: { status: StageStatus; className?: string }) {
  const map: Record<StageStatus, React.ReactNode> = {
    completed:   <CheckCircle2 className={`${className} text-emerald-400`} />,
    in_progress: <Clock className={`${className} text-indigo-400`} />,
    upcoming:    <Circle className={`${className} text-slate-500`} />,
    on_hold:     <Pause className={`${className} text-amber-400`} />,
    cancelled:   <X className={`${className} text-red-400`} />,
  }
  return <>{map[status]}</>
}

function fmtDate(d: string | null): string {
  if (!d) return "TBD"
  const dt = new Date(d)
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function fmtDateShort(d: string | null): string {
  if (!d) return "TBD"
  const dt = new Date(d)
  return dt.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
}

// Get the effective start and end dates for a stage (for bar rendering)
function getEffectiveDates(s: ProgramStage): { start: Date | null; end: Date | null } {
  if (s.milestoneOnly) {
    const d = s.dueDate ? new Date(s.dueDate) : null
    return { start: d, end: d }
  }
  const start = s.startDate ? new Date(s.startDate) : null
  // Use endDate, or fall back to dueDate if endDate is missing
  const end = s.endDate ? new Date(s.endDate) : s.dueDate ? new Date(s.dueDate) : null
  return { start, end }
}

export default function ProgramGantt({ projectId, projectName }: ProgramGanttProps) {
  const [program, setProgram] = useState<ProjectProgram | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<"gantt" | "list">("gantt")
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fetch program data
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)

        // Try by projectId first
        let res = await fetch(`/api/programs?projectId=${encodeURIComponent(projectId)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.program) { setProgram(data.program); return }
        }

        // Try by projectName fallback
        if (projectName) {
          res = await fetch(`/api/programs?projectName=${encodeURIComponent(projectName)}`)
          if (res.ok) {
            const data = await res.json()
            if (data.programs?.length > 0) { setProgram(data.programs[0]); return }
          }
        }

        // No match — try a fuzzy match on the projectId in the name
        res = await fetch(`/api/programs?projectName=${encodeURIComponent(projectId)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.programs?.length > 0) { setProgram(data.programs[0]); return }
        }

        setProgram(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load program")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId, projectName])

  // Build timeline
  const timeline = useMemo(() => {
    if (!program?.stages?.length) return null

    // Collect all valid dates
    const allDates: Date[] = []
    program.stages.forEach(s => {
      const { start, end } = getEffectiveDates(s)
      if (start) allDates.push(start)
      if (end) allDates.push(end)
    })

    if (allDates.length === 0) return null

    const minMs = Math.min(...allDates.map(d => d.getTime()))
    const maxMs = Math.max(...allDates.map(d => d.getTime()))

    // Pad 1 month on each side
    const tlStart = new Date(minMs)
    tlStart.setDate(1)
    tlStart.setMonth(tlStart.getMonth() - 1)

    const tlEnd = new Date(maxMs)
    tlEnd.setDate(1)
    tlEnd.setMonth(tlEnd.getMonth() + 2)

    // Generate months
    const months: TimelineMonth[] = []
    const cur = new Date(tlStart)
    let px = 0
    while (cur < tlEnd) {
      months.push({
        year: cur.getFullYear(),
        month: cur.getMonth(),
        label: MONTH_LABELS[cur.getMonth()],
        startPx: px,
        width: MONTH_W,
      })
      px += MONTH_W
      cur.setMonth(cur.getMonth() + 1)
    }

    const totalPx = px
    const tlStartMs = tlStart.getTime()
    const tlEndMs = tlEnd.getTime()
    const range = tlEndMs - tlStartMs

    // Position helper
    function dateToPx(d: Date): number {
      return ((d.getTime() - tlStartMs) / range) * totalPx
    }

    // Today line
    const now = new Date()
    const todayPx = now >= tlStart && now <= tlEnd ? dateToPx(now) : null

    // Stage bars
    const bars = program.stages.map(s => {
      const { start, end } = getEffectiveDates(s)
      if (!start || !end) return null
      const x1 = dateToPx(start)
      const x2 = dateToPx(end)
      return {
        x: x1,
        w: Math.max(s.milestoneOnly ? 0 : 6, x2 - x1),
        milestone: !!s.milestoneOnly,
      }
    })

    return { months, totalPx, todayPx, bars }
  }, [program])

  // Scroll to today on first load
  useEffect(() => {
    if (timeline?.todayPx && scrollRef.current) {
      const scrollTarget = timeline.todayPx - scrollRef.current.clientWidth / 3
      scrollRef.current.scrollLeft = Math.max(0, scrollTarget)
    }
  }, [timeline])

  // ---------- RENDER ----------

  if (loading) {
    return (
      <div className="rounded-2xl border border-border-color bg-bg-card p-6 space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-bg-surface animate-pulse" />
          <div className="h-5 w-40 bg-bg-surface rounded-lg animate-pulse" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-60 h-8 rounded-lg bg-bg-surface animate-pulse" />
            <div className="flex-1 h-8 rounded-lg bg-bg-surface animate-pulse" style={{ opacity: 1 - i * 0.08 }} />
          </div>
        ))}
      </div>
    )
  }

  if (!program || !program.stages?.length) {
    return (
      <div className="rounded-2xl border border-border-color bg-bg-card p-12">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <CalendarRange className="w-10 h-10 opacity-40" />
          <p className="text-sm font-medium">No project program available</p>
          <p className="text-xs">Program data can be added via the programs.json file</p>
        </div>
      </div>
    )
  }

  const hasTimeline = timeline !== null

  return (
    <div className="rounded-2xl border border-border-color bg-bg-card overflow-hidden">
      {/* ========== HEADER ========== */}
      <div className="border-b border-border-color px-6 py-4 bg-gradient-to-r from-bg-card to-bg-surface">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-ocean-swell/10">
              <CalendarRange className="w-5 h-5 text-ocean-swell" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Project Program</h3>
              <p className="text-xs text-text-muted">
                Updated {fmtDate(program.lastUpdated)}
                <span className="mx-2 opacity-30">|</span>
                {program.stages.length} stages
                <span className="mx-2 opacity-30">|</span>
                {program.stages.filter(s => s.status === "completed").length} completed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Category Legend */}
            <div className="hidden lg:flex items-center gap-4">
              {(["design","approvals","construction","handover"] as const).map(cat => (
                <div key={cat} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${CAT_BG[cat]}`} />
                  <span className="text-xs text-text-muted capitalize">{cat}</span>
                </div>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex p-1 rounded-lg bg-bg-surface border border-border-color">
              <button
                onClick={() => setView("gantt")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  view === "gantt" ? "bg-ocean-swell text-white shadow-md" : "text-text-muted hover:text-text-primary"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Timeline
              </button>
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  view === "list" ? "bg-ocean-swell text-white shadow-md" : "text-text-muted hover:text-text-primary"
                }`}
              >
                <List className="w-3.5 h-3.5" /> Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== GANTT VIEW ========== */}
      {view === "gantt" && hasTimeline && timeline ? (
        <div className="relative">
          <div className="flex">
            {/* --- Left Column: Stage Names (sticky) --- */}
            <div className="flex-shrink-0 z-10 bg-bg-card border-r border-border-color" style={{ width: LABEL_W }}>
              {/* Month header spacer */}
              <div className="h-11 border-b border-border-color bg-bg-surface" />

              {/* Stage names */}
              {program.stages.map((stage, i) => (
                <div
                  key={stage.id}
                  className={`flex items-center gap-2.5 px-4 border-b border-border-color transition-colors hover:bg-bg-hover cursor-default ${
                    i % 2 === 0 ? "bg-bg-card" : "bg-bg-surface/50"
                  }`}
                  style={{ height: ROW_H }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltip({ stage, x: rect.right + 12, y: rect.top + rect.height / 2 })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {/* Category color dot */}
                  <div className={`w-1.5 h-5 rounded-full flex-shrink-0 ${CAT_DOT[stage.category]}`} />

                  {/* Status icon */}
                  <StatusIcon status={stage.status} />

                  {/* Name */}
                  <span className={`text-sm truncate ${
                    stage.status === "cancelled"
                      ? "text-text-muted line-through opacity-60"
                      : stage.status === "completed"
                        ? "text-text-secondary"
                        : "text-text-primary font-medium"
                  }`}>
                    {stage.shortName || stage.name}
                  </span>
                </div>
              ))}
            </div>

            {/* --- Right Column: Timeline (scrollable) --- */}
            <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden">
              <div style={{ width: timeline.totalPx, position: "relative" }}>
                {/* Month headers */}
                <div className="flex h-11 border-b border-border-color bg-bg-surface sticky top-0 z-10">
                  {timeline.months.map((m, i) => {
                    const isYear = i === 0 || timeline.months[i - 1]?.year !== m.year
                    return (
                      <div
                        key={i}
                        className="border-r border-border-color/50 flex flex-col items-center justify-center"
                        style={{ width: m.width, left: m.startPx, position: "absolute", top: 0, bottom: 0 }}
                      >
                        {isYear && (
                          <span className="text-[10px] font-bold text-ocean-swell tracking-wider">
                            {m.year}
                          </span>
                        )}
                        <span className={`text-xs ${isYear ? "font-semibold text-text-primary" : "text-text-muted"}`}>
                          {m.label}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Today line */}
                {timeline.todayPx !== null && (
                  <div
                    className="absolute top-0 bottom-0 z-20 pointer-events-none"
                    style={{ left: timeline.todayPx - 0.5 }}
                  >
                    <div className="w-px h-full bg-amber-400/70" style={{
                      backgroundImage: "repeating-linear-gradient(to bottom, #fbbf24 0, #fbbf24 6px, transparent 6px, transparent 12px)"
                    }} />
                    <div className="absolute -top-0 -translate-x-1/2 bg-amber-500 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-b">
                      TODAY
                    </div>
                  </div>
                )}

                {/* Vertical grid lines (monthly) */}
                {timeline.months.map((m, i) => (
                  <div
                    key={`grid-${i}`}
                    className="absolute top-11 bottom-0 border-r border-border-color/30 pointer-events-none"
                    style={{ left: m.startPx }}
                  />
                ))}

                {/* Stage rows & bars */}
                {program.stages.map((stage, i) => {
                  const bar = timeline.bars[i]
                  return (
                    <div
                      key={stage.id}
                      className={`relative border-b border-border-color/50 ${
                        i % 2 === 0 ? "bg-bg-card/30" : "bg-bg-surface/20"
                      }`}
                      style={{ height: ROW_H }}
                    >
                      {bar && !bar.milestone && (
                        /* Duration bar */
                        <div
                          className="absolute top-1/2 -translate-y-1/2 group cursor-pointer"
                          style={{ left: bar.x, width: bar.w, height: 26 }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            setTooltip({ stage, x: rect.left + rect.width / 2, y: rect.top - 8 })
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          <div className={`
                            w-full h-full rounded-full bg-gradient-to-r ${CAT_GRADIENT[stage.category]}
                            shadow-lg transition-all duration-200
                            group-hover:brightness-125 group-hover:shadow-xl
                            ${stage.status === "upcoming" ? "opacity-35" : ""}
                            ${stage.status === "on_hold" ? "opacity-50" : ""}
                            ${stage.status === "cancelled" ? "opacity-20" : ""}
                          `}>
                            {/* In-progress shimmer */}
                            {stage.status === "in_progress" && (
                              <div className="absolute inset-0 rounded-full overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse" />
                              </div>
                            )}

                            {/* Completed checkmark */}
                            {stage.status === "completed" && bar.w > 20 && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white drop-shadow" />
                              </div>
                            )}

                            {/* Bar label (if wide enough) */}
                            {bar.w > 100 && (
                              <div className="absolute inset-0 flex items-center justify-center px-2">
                                <span className="text-[10px] font-semibold text-white/90 truncate drop-shadow">
                                  {stage.lead}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {bar && bar.milestone && (
                        /* Milestone diamond */
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer group"
                          style={{ left: bar.x }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            setTooltip({ stage, x: rect.left + rect.width / 2, y: rect.top - 8 })
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          <div className={`
                            w-5 h-5 rotate-45 rounded-sm transition-transform duration-200 group-hover:scale-125
                            ${CAT_BG[stage.category]}
                            ${stage.status === "upcoming" ? "opacity-40" : ""}
                            ${stage.status === "completed" ? "ring-2 ring-emerald-300" : ""}
                          `} />
                        </div>
                      )}

                      {/* No data marker */}
                      {!bar && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] text-text-muted/40 italic">TBD</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : view === "gantt" && !hasTimeline ? (
        <div className="p-8 text-center text-text-muted text-sm">
          No timeline data available yet. Add dates to stages to see the Gantt chart.
        </div>
      ) : null}

      {/* ========== LIST VIEW ========== */}
      {view === "list" && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-color bg-bg-surface">
                <th className="w-12 px-4 py-3 text-left text-xs font-semibold text-text-muted">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted min-w-[180px]">Stage</th>
                <th className="w-28 px-4 py-3 text-left text-xs font-semibold text-text-muted">Status</th>
                <th className="w-48 px-4 py-3 text-left text-xs font-semibold text-text-muted">Timeline</th>
                <th className="w-20 px-4 py-3 text-left text-xs font-semibold text-text-muted">Lead</th>
                <th className="w-20 px-4 py-3 text-left text-xs font-semibold text-text-muted">Assist</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {program.stages.map((stage, i) => {
                const { start, end } = getEffectiveDates(stage)
                return (
                  <tr
                    key={stage.id}
                    className={`border-b border-border-color/50 transition-colors hover:bg-bg-hover ${
                      i % 2 === 0 ? "bg-bg-card" : "bg-bg-surface/30"
                    }`}
                  >
                    {/* # with category bar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-6 rounded-full ${CAT_BG[stage.category]}`} />
                        <span className="text-xs text-text-muted font-mono">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                    </td>

                    {/* Stage */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {stage.milestoneOnly && <Diamond className={`w-3 h-3 flex-shrink-0 ${CAT_DIAMOND[stage.category]}`} />}
                        <span className={`text-sm ${
                          stage.status === "cancelled" ? "text-text-muted line-through" : "text-text-primary font-medium"
                        }`}>
                          {stage.name}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium ${STATUS_BADGE[stage.status]}`}>
                        <StatusIcon status={stage.status} className="w-3 h-3" />
                        {STATUS_LABEL[stage.status]}
                      </span>
                    </td>

                    {/* Timeline */}
                    <td className="px-4 py-3">
                      <div className="text-xs text-text-secondary">
                        {stage.milestoneOnly && stage.dueDate ? (
                          <span>{fmtDate(stage.dueDate)}</span>
                        ) : start && end ? (
                          <span>{fmtDateShort(stage.startDate)} — {fmtDateShort(stage.endDate || stage.dueDate)}</span>
                        ) : (
                          <span className="text-text-muted italic">TBD</span>
                        )}
                      </div>
                    </td>

                    {/* Lead */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${
                        stage.lead === "DLF" ? "text-purple-400" :
                        stage.lead === "AOR-Z" ? "text-cyan-400" : "text-text-secondary"
                      }`}>
                        {stage.lead || "-"}
                      </span>
                    </td>

                    {/* Assist */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-muted">{stage.assist || "-"}</span>
                    </td>

                    {/* Remarks */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-muted leading-relaxed line-clamp-2">
                        {stage.remarks || "-"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ========== TOOLTIP ========== */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
        >
          <div className="bg-bg-card/95 backdrop-blur-xl border border-border-color rounded-xl p-4 shadow-2xl max-w-xs">
            {/* Title row */}
            <div className="flex items-start gap-2 mb-3">
              <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${CAT_DOT[tooltip.stage.category]}`} />
              <div>
                <h4 className="text-sm font-semibold text-text-primary">{tooltip.stage.name}</h4>
                <p className="text-[10px] text-text-muted capitalize mt-0.5">{tooltip.stage.category}</p>
              </div>
            </div>

            {/* Info grid */}
            <div className="space-y-2 text-xs border-t border-border-color pt-3">
              <div className="flex justify-between">
                <span className="text-text-muted">Status</span>
                <span className={`font-medium ${
                  tooltip.stage.status === "completed" ? "text-emerald-400" :
                  tooltip.stage.status === "in_progress" ? "text-indigo-400" :
                  "text-text-secondary"
                }`}>{STATUS_LABEL[tooltip.stage.status]}</span>
              </div>

              {(tooltip.stage.startDate || tooltip.stage.dueDate) && (
                <div className="flex justify-between gap-4">
                  <span className="text-text-muted">Timeline</span>
                  <span className="text-text-secondary text-right">
                    {tooltip.stage.milestoneOnly
                      ? fmtDate(tooltip.stage.dueDate)
                      : `${fmtDate(tooltip.stage.startDate)} — ${fmtDate(tooltip.stage.endDate || tooltip.stage.dueDate)}`
                    }
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-text-muted">Lead</span>
                <span className={`font-semibold ${
                  tooltip.stage.lead === "DLF" ? "text-purple-400" :
                  tooltip.stage.lead === "AOR-Z" ? "text-cyan-400" : "text-text-secondary"
                }`}>{tooltip.stage.lead || "-"}</span>
              </div>

              {tooltip.stage.assist && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Assist</span>
                  <span className="text-text-secondary">{tooltip.stage.assist}</span>
                </div>
              )}
            </div>

            {/* Remarks */}
            {tooltip.stage.remarks && (
              <div className="mt-3 pt-3 border-t border-border-color">
                <p className="text-[11px] text-text-secondary leading-relaxed">{tooltip.stage.remarks}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== FOOTER: Legend (mobile) ========== */}
      <div className="lg:hidden border-t border-border-color px-4 py-3 flex flex-wrap gap-3">
        {(["design","approvals","construction","handover"] as const).map(cat => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-sm ${CAT_BG[cat]}`} />
            <span className="text-[10px] text-text-muted capitalize">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
