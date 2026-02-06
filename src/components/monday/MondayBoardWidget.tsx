"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CircleDot,
  RefreshCw,
  ExternalLink,
  ListTodo,
} from "lucide-react"

interface MondayProjectMetrics {
  boardId: string
  boardName: string
  totalItems: number
  completedItems: number
  inProgressItems: number
  stuckItems: number
  notStartedItems: number
  completionPercentage: number
  timeline: {
    earliestStart: string | null
    latestEnd: string | null
  }
  items: {
    id: string
    name: string
    status: string
    statusColor: string
    timeline: {
      from: string
      to: string
    } | null
  }[]
  lastFetched: string
}

interface MondayBoardWidgetProps {
  projectSrNo: string
}

export function MondayBoardWidget({ projectSrNo }: MondayBoardWidgetProps) {
  const [metrics, setMetrics] = useState<MondayProjectMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasBoard, setHasBoard] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)

      const res = await fetch(`/api/monday/project/${encodeURIComponent(projectSrNo)}`)
      const data = await res.json()

      if (data.error && res.status !== 200) {
        throw new Error(data.error)
      }

      setHasBoard(data.hasBoard)
      if (data.hasBoard && data.metrics) {
        setMetrics(data.metrics)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Monday.com data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [projectSrNo])

  // Don't render anything if there's no board linked
  if (!loading && !hasBoard) {
    return null
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-bg-card border border-border-color p-6 animate-pulse">
        <div className="h-6 w-48 bg-bg-surface rounded mb-4" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-bg-surface rounded-xl" />
          ))}
        </div>
        <div className="h-4 bg-bg-surface rounded w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-bg-card border border-accent-red/30 p-6">
        <div className="flex items-center gap-2 text-accent-red mb-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Monday.com Error</span>
        </div>
        <p className="text-sm text-text-muted">{error}</p>
      </div>
    )
  }

  if (!metrics) return null

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not set"
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="rounded-2xl bg-bg-card border border-border-color p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff3d57] to-[#ff6b6b] flex items-center justify-center">
            <ListTodo className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {metrics.boardName}
            </h2>
            <p className="text-xs text-text-muted">Monday.com Project Board</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-bg-hover transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 text-text-muted ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <a
            href={`https://view.monday.com/board/${metrics.boardId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
            title="Open in Monday.com"
          >
            <ExternalLink className="h-4 w-4 text-text-muted" />
          </a>
        </div>
      </div>

      {/* Completion Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-muted">Overall Progress</span>
          <span className="text-sm font-semibold text-text-primary">
            {metrics.completionPercentage}%
          </span>
        </div>
        <div className="h-3 bg-bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-green to-accent-cyan rounded-full transition-all duration-500"
            style={{ width: `${metrics.completionPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
          <span>{metrics.completedItems} of {metrics.totalItems} tasks completed</span>
          <span>
            {formatDate(metrics.timeline.earliestStart)} - {formatDate(metrics.timeline.latestEnd)}
          </span>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatusCard
          icon={CheckCircle2}
          label="Completed"
          value={metrics.completedItems}
          color="accent-green"
        />
        <StatusCard
          icon={Clock}
          label="In Progress"
          value={metrics.inProgressItems}
          color="accent-blue"
        />
        <StatusCard
          icon={AlertTriangle}
          label="Stuck"
          value={metrics.stuckItems}
          color="accent-red"
        />
        <StatusCard
          icon={CircleDot}
          label="Not Started"
          value={metrics.notStartedItems}
          color="text-muted"
        />
      </div>

      {/* Timeline Info */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-surface">
        <Calendar className="h-5 w-5 text-ocean-swell" />
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">Project Timeline</p>
          <p className="text-xs text-text-muted">
            {metrics.timeline.earliestStart && metrics.timeline.latestEnd ? (
              <>
                {formatDate(metrics.timeline.earliestStart)} → {formatDate(metrics.timeline.latestEnd)}
              </>
            ) : (
              "No timeline data available"
            )}
          </p>
        </div>
        {metrics.timeline.earliestStart && metrics.timeline.latestEnd && (
          <div className="text-right">
            <p className="text-sm font-semibold text-text-primary">
              {calculateDuration(metrics.timeline.earliestStart, metrics.timeline.latestEnd)}
            </p>
            <p className="text-xs text-text-muted">Duration</p>
          </div>
        )}
      </div>

      {/* Last Updated */}
      <p className="text-xs text-text-muted text-right mt-4">
        Last synced: {new Date(metrics.lastFetched).toLocaleString()}
      </p>
    </div>
  )
}

function StatusCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-xl bg-bg-surface p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 text-${color}`} style={{ color: `var(--${color})` }} />
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  )
}

function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 7) {
    return `${diffDays} days`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks > 1 ? "s" : ""}`
  } else {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? "s" : ""}`
  }
}
