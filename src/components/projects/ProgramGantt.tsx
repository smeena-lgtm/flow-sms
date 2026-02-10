"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import {
  CalendarRange,
  Clock,
  CheckCircle2,
  Circle,
  Pause,
  X,
  Diamond,
  List,
  BarChart3,
  Download,
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
const LABEL_W = 240

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

const CAT_HEX: Record<string, string> = {
  design:       "#818cf8",
  approvals:    "#c084fc",
  construction: "#22d3ee",
  handover:     "#34d399",
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
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function fmtDateShort(d: string | null): string {
  if (!d) return "TBD"
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
}

function getEffectiveDates(s: ProgramStage): { start: Date | null; end: Date | null } {
  if (s.milestoneOnly) {
    const d = s.dueDate ? new Date(s.dueDate) : null
    return { start: d, end: d }
  }
  const start = s.startDate ? new Date(s.startDate) : null
  const end = s.endDate ? new Date(s.endDate) : s.dueDate ? new Date(s.dueDate) : null
  return { start, end }
}

// ============================================================
// PDF DOWNLOAD — opens a print-ready page the user can save as PDF
// ============================================================
function generatePDF(program: ProjectProgram) {
  const w = window.open("", "_blank")
  if (!w) return

  const rows = program.stages.map((s, i) => {
    const catColor = CAT_HEX[s.category] || "#818cf8"
    const statusLabel = STATUS_LABEL[s.status] || s.status
    const dates = s.milestoneOnly && s.dueDate
      ? fmtDate(s.dueDate)
      : s.startDate
        ? `${fmtDate(s.startDate)} — ${fmtDate(s.endDate || s.dueDate)}`
        : "TBD"

    return `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 12px;text-align:center;">
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:3px;height:20px;border-radius:2px;background:${catColor};"></div>
            <span style="font-size:12px;color:#64748b;">${String(i + 1).padStart(2, "0")}</span>
          </div>
        </td>
        <td style="padding:10px 12px;">
          <span style="font-size:13px;font-weight:600;color:#1e293b;${s.status === "cancelled" ? "text-decoration:line-through;opacity:0.5;" : ""}">${s.name}</span>
          ${s.milestoneOnly ? '<span style="display:inline-block;margin-left:6px;font-size:9px;padding:1px 5px;background:#f1f5f9;border-radius:3px;color:#64748b;">MILESTONE</span>' : ""}
        </td>
        <td style="padding:10px 12px;">
          <span style="font-size:11px;padding:3px 8px;border-radius:4px;font-weight:600;background:${
            s.status === "completed" ? "#dcfce7;color:#16a34a" :
            s.status === "in_progress" ? "#e0e7ff;color:#4f46e5" :
            s.status === "on_hold" ? "#fef3c7;color:#d97706" :
            s.status === "cancelled" ? "#fecaca;color:#dc2626" :
            "#f1f5f9;color:#64748b"
          }">${statusLabel}</span>
        </td>
        <td style="padding:10px 12px;font-size:12px;color:#475569;">${dates}</td>
        <td style="padding:10px 12px;font-size:12px;font-weight:600;color:${s.lead === "DLF" ? "#7c3aed" : s.lead === "AOR-Z" ? "#0891b2" : "#475569"}">${s.lead || "-"}</td>
        <td style="padding:10px 12px;font-size:12px;color:#94a3b8;">${s.assist || "-"}</td>
        <td style="padding:10px 12px;font-size:11px;color:#64748b;max-width:220px;">${s.remarks || "-"}</td>
      </tr>
    `
  }).join("")

  const completedCount = program.stages.filter(s => s.status === "completed").length
  const inProgressCount = program.stages.filter(s => s.status === "in_progress").length

  w.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${program.projectName} — Project Program</title>
  <style>
    @page { size: landscape; margin: 15mm; }
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#1e293b; background:#fff; padding:24px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #6366f1;">
    <div>
      <h1 style="font-size:22px;font-weight:700;color:#1e293b;margin-bottom:4px;">${program.projectName}</h1>
      <p style="font-size:12px;color:#64748b;">Project Program &mdash; ${program.stages.length} Stages &mdash; ${completedCount} Completed, ${inProgressCount} In Progress</p>
    </div>
    <div style="text-align:right;">
      <p style="font-size:11px;color:#94a3b8;">Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
      <p style="font-size:11px;color:#94a3b8;">Last Updated: ${fmtDate(program.lastUpdated)}</p>
    </div>
  </div>

  <div style="display:flex;gap:16px;margin-bottom:20px;">
    ${(["design","approvals","construction","handover"] as const).map(cat => `
      <div style="display:flex;align-items:center;gap:6px;">
        <div style="width:10px;height:10px;border-radius:2px;background:${CAT_HEX[cat]};"></div>
        <span style="font-size:11px;color:#64748b;text-transform:capitalize;">${cat}</span>
      </div>
    `).join("")}
  </div>

  <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;">
    <thead>
      <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">
        <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;width:50px;">#</th>
        <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Stage</th>
        <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;width:100px;">Status</th>
        <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;width:200px;">Timeline</th>
        <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;width:70px;">Lead</th>
        <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;width:70px;">Assist</th>
        <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Remarks</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div style="margin-top:20px;text-align:center;font-size:10px;color:#cbd5e1;">
    Flow Studio Management System
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`)
  w.document.close()
}

// ============================================================
// MAIN COMPONENT
// ============================================================
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

        let res = await fetch(`/api/programs?projectId=${encodeURIComponent(projectId)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.program) { setProgram(data.program); return }
        }

        if (projectName) {
          res = await fetch(`/api/programs?projectName=${encodeURIComponent(projectName)}`)
          if (res.ok) {
            const data = await res.json()
            if (data.programs?.length > 0) { setProgram(data.programs[0]); return }
          }
        }

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

    const allDates: Date[] = []
    program.stages.forEach(s => {
      const { start, end } = getEffectiveDates(s)
      if (start) allDates.push(start)
      if (end) allDates.push(end)
    })
    if (allDates.length === 0) return null

    const minMs = Math.min(...allDates.map(d => d.getTime()))
    const maxMs = Math.max(...allDates.map(d => d.getTime()))

    const tlStart = new Date(minMs)
    tlStart.setDate(1)
    tlStart.setMonth(tlStart.getMonth() - 1)

    const tlEnd = new Date(maxMs)
    tlEnd.setDate(1)
    tlEnd.setMonth(tlEnd.getMonth() + 2)

    const months: TimelineMonth[] = []
    const cur = new Date(tlStart)
    let px = 0
    while (cur < tlEnd) {
      months.push({ year: cur.getFullYear(), month: cur.getMonth(), label: MONTH_LABELS[cur.getMonth()], startPx: px, width: MONTH_W })
      px += MONTH_W
      cur.setMonth(cur.getMonth() + 1)
    }

    const totalPx = px
    const tlStartMs = tlStart.getTime()
    const range = tlEnd.getTime() - tlStartMs

    function dateToPx(d: Date): number {
      return ((d.getTime() - tlStartMs) / range) * totalPx
    }

    const now = new Date()
    const todayPx = now >= tlStart && now <= tlEnd ? dateToPx(now) : null

    const bars = program.stages.map(s => {
      const { start, end } = getEffectiveDates(s)
      if (!start || !end) return null
      const x1 = dateToPx(start)
      const x2 = dateToPx(end)
      return { x: x1, w: Math.max(s.milestoneOnly ? 0 : 6, x2 - x1), milestone: !!s.milestoneOnly }
    })

    return { months, totalPx, todayPx, bars }
  }, [program])

  // Scroll to today on first load
  useEffect(() => {
    if (timeline?.todayPx && scrollRef.current) {
      scrollRef.current.scrollLeft = Math.max(0, timeline.todayPx - scrollRef.current.clientWidth / 3)
    }
  }, [timeline])

  const handleDownloadPDF = useCallback(() => {
    if (program) generatePDF(program)
  }, [program])

  // ---------- RENDER ----------

  if (loading) {
    return (
      <div className="rounded-2xl border border-border-color bg-bg-card p-6 space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-bg-surface animate-pulse" />
          <div className="h-5 w-40 bg-bg-surface rounded-lg animate-pulse" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-56 h-8 rounded-lg bg-bg-surface animate-pulse" />
            <div className="flex-1 h-8 rounded-lg bg-bg-surface animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
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
    /* CRITICAL: w-full + overflow-hidden + contain stops this from pushing the page width */
    <div
      className="rounded-2xl border border-border-color bg-bg-card overflow-hidden w-full"
      style={{ contain: "inline-size" }}
    >

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

          <div className="flex items-center gap-3">
            {/* Category Legend */}
            <div className="hidden xl:flex items-center gap-4">
              {(["design","approvals","construction","handover"] as const).map(cat => (
                <div key={cat} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${CAT_BG[cat]}`} />
                  <span className="text-xs text-text-muted capitalize">{cat}</span>
                </div>
              ))}
            </div>

            {/* PDF Download */}
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-bg-hover border border-border-color transition-all"
              title="Download as PDF"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>

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
        /* overflow-hidden on this wrapper is the key fix — prevents internal width from leaking */
        <div className="relative overflow-hidden">
          <div className="flex overflow-hidden">
            {/* --- Left Column: Stage Names (fixed width) --- */}
            <div className="flex-shrink-0 z-10 bg-bg-card border-r border-border-color" style={{ width: LABEL_W }}>
              <div className="h-11 border-b border-border-color bg-bg-surface" />
              {program.stages.map((stage, i) => (
                <div
                  key={stage.id}
                  className={`flex items-center gap-2 px-3 border-b border-border-color transition-colors hover:bg-bg-hover cursor-default ${
                    i % 2 === 0 ? "bg-bg-card" : "bg-bg-surface/50"
                  }`}
                  style={{ height: ROW_H }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltip({ stage, x: rect.right + 12, y: rect.top + rect.height / 2 })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <div className={`w-1.5 h-5 rounded-full flex-shrink-0 ${CAT_DOT[stage.category]}`} />
                  <StatusIcon status={stage.status} />
                  <span className={`text-xs truncate ${
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
            {/* min-w-0 is critical to allow flex child to shrink below content width */}
            <div ref={scrollRef} className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
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
                          <span className="text-[10px] font-bold text-ocean-swell tracking-wider">{m.year}</span>
                        )}
                        <span className={`text-xs ${isYear ? "font-semibold text-text-primary" : "text-text-muted"}`}>{m.label}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Today line */}
                {timeline.todayPx !== null && (
                  <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left: timeline.todayPx - 0.5 }}>
                    <div className="w-px h-full" style={{ backgroundImage: "repeating-linear-gradient(to bottom, #fbbf24 0, #fbbf24 6px, transparent 6px, transparent 12px)" }} />
                    <div className="absolute top-0 -translate-x-1/2 bg-amber-500 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-b">TODAY</div>
                  </div>
                )}

                {/* Grid lines */}
                {timeline.months.map((m, i) => (
                  <div key={`g-${i}`} className="absolute top-11 bottom-0 border-r border-border-color/20 pointer-events-none" style={{ left: m.startPx }} />
                ))}

                {/* Stage rows & bars */}
                {program.stages.map((stage, i) => {
                  const bar = timeline.bars[i]
                  return (
                    <div
                      key={stage.id}
                      className={`relative border-b border-border-color/50 ${i % 2 === 0 ? "bg-bg-card/30" : "bg-bg-surface/20"}`}
                      style={{ height: ROW_H }}
                    >
                      {bar && !bar.milestone && (
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
                            {stage.status === "in_progress" && (
                              <div className="absolute inset-0 rounded-full overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse" />
                              </div>
                            )}
                            {stage.status === "completed" && bar.w > 20 && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white drop-shadow" />
                              </div>
                            )}
                            {bar.w > 100 && (
                              <div className="absolute inset-0 flex items-center justify-center px-2">
                                <span className="text-[10px] font-semibold text-white/90 truncate drop-shadow">{stage.lead}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {bar && bar.milestone && (
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
        <div className="overflow-x-auto overflow-y-hidden max-w-full">
          <table className="w-full min-w-[700px]">
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-6 rounded-full ${CAT_BG[stage.category]}`} />
                        <span className="text-xs text-text-muted font-mono">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {stage.milestoneOnly && <Diamond className={`w-3 h-3 flex-shrink-0 ${CAT_DIAMOND[stage.category]}`} />}
                        <span className={`text-sm ${stage.status === "cancelled" ? "text-text-muted line-through" : "text-text-primary font-medium"}`}>
                          {stage.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium ${STATUS_BADGE[stage.status]}`}>
                        <StatusIcon status={stage.status} className="w-3 h-3" />
                        {STATUS_LABEL[stage.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-text-secondary">
                        {stage.milestoneOnly && stage.dueDate ? fmtDate(stage.dueDate) :
                         start && end ? `${fmtDateShort(stage.startDate)} — ${fmtDateShort(stage.endDate || stage.dueDate)}` :
                         <span className="text-text-muted italic">TBD</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${
                        stage.lead === "DLF" ? "text-purple-400" : stage.lead === "AOR-Z" ? "text-cyan-400" : "text-text-secondary"
                      }`}>{stage.lead || "-"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-muted">{stage.assist || "-"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-muted leading-relaxed line-clamp-2">{stage.remarks || "-"}</span>
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
            <div className="flex items-start gap-2 mb-3">
              <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${CAT_DOT[tooltip.stage.category]}`} />
              <div>
                <h4 className="text-sm font-semibold text-text-primary">{tooltip.stage.name}</h4>
                <p className="text-[10px] text-text-muted capitalize mt-0.5">{tooltip.stage.category}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs border-t border-border-color pt-3">
              <div className="flex justify-between">
                <span className="text-text-muted">Status</span>
                <span className={`font-medium ${
                  tooltip.stage.status === "completed" ? "text-emerald-400" :
                  tooltip.stage.status === "in_progress" ? "text-indigo-400" : "text-text-secondary"
                }`}>{STATUS_LABEL[tooltip.stage.status]}</span>
              </div>
              {(tooltip.stage.startDate || tooltip.stage.dueDate) && (
                <div className="flex justify-between gap-4">
                  <span className="text-text-muted">Timeline</span>
                  <span className="text-text-secondary text-right">
                    {tooltip.stage.milestoneOnly
                      ? fmtDate(tooltip.stage.dueDate)
                      : `${fmtDate(tooltip.stage.startDate)} — ${fmtDate(tooltip.stage.endDate || tooltip.stage.dueDate)}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-muted">Lead</span>
                <span className={`font-semibold ${
                  tooltip.stage.lead === "DLF" ? "text-purple-400" : tooltip.stage.lead === "AOR-Z" ? "text-cyan-400" : "text-text-secondary"
                }`}>{tooltip.stage.lead || "-"}</span>
              </div>
              {tooltip.stage.assist && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Assist</span>
                  <span className="text-text-secondary">{tooltip.stage.assist}</span>
                </div>
              )}
            </div>
            {tooltip.stage.remarks && (
              <div className="mt-3 pt-3 border-t border-border-color">
                <p className="text-[11px] text-text-secondary leading-relaxed">{tooltip.stage.remarks}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== FOOTER: Legend (mobile) ========== */}
      <div className="xl:hidden border-t border-border-color px-4 py-3 flex flex-wrap gap-3">
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
