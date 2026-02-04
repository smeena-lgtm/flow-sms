"use client"

import { cn } from "@/lib/utils"

interface DonutChartProps {
  data: { label: string; value: number; color: string }[]
  size?: number
  strokeWidth?: number
  className?: string
  showLegend?: boolean
  title?: string
}

export function DonutChart({
  data,
  size = 160,
  strokeWidth = 16,
  className,
  showLegend = true,
  title,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Gap between segments (in percentage of total)
  const gapPercentage = 2
  const totalGaps = data.filter(d => d.value > 0).length * gapPercentage
  const availablePercentage = 100 - totalGaps

  let cumulativePercentage = 0

  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-6", className)}>
      {/* Chart */}
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--bg-hover)"
            strokeWidth={strokeWidth}
            opacity={0.5}
          />

          {/* Data segments with gaps */}
          {data.map((item, index) => {
            if (item.value === 0) return null

            const rawPercentage = total > 0 ? (item.value / total) * 100 : 0
            const adjustedPercentage = (rawPercentage / 100) * availablePercentage

            // Add gap before each segment
            const gapOffset = index * gapPercentage
            const startOffset = cumulativePercentage + gapOffset

            const strokeDasharray = `${(adjustedPercentage / 100) * circumference} ${circumference}`
            const strokeDashoffset = -((startOffset / 100) * circumference)

            cumulativePercentage += adjustedPercentage

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out origin-center"
                style={{
                  filter: `drop-shadow(0 2px 4px ${item.color}40)`,
                }}
              />
            )
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-text-primary">{total}</span>
          <span className="text-xs text-text-muted uppercase tracking-wider">
            {title || "Total"}
          </span>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-col gap-3 min-w-[140px]">
          {data.map((item, index) => {
            const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
            return (
              <div
                key={index}
                className="flex items-center gap-3 group cursor-default"
              >
                {/* Color indicator with glow */}
                <div
                  className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-bg-card transition-all duration-200 group-hover:scale-110"
                  style={{
                    backgroundColor: item.color,
                    ringColor: `${item.color}40`,
                  }}
                />

                {/* Label and stats */}
                <div className="flex-1 flex items-center justify-between gap-4">
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {item.value}
                    </span>
                    <span
                      className="text-xs font-medium px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${item.color}20`,
                        color: item.color
                      }}
                    >
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Radial Progress variant for single metrics
interface RadialProgressProps {
  value: number
  max: number
  color: string
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}

export function RadialProgress({
  value,
  max,
  color,
  size = 120,
  strokeWidth = 12,
  label,
  className,
}: RadialProgressProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-hover)"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />

        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{
            filter: `drop-shadow(0 2px 8px ${color}60)`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-text-primary">
          {Math.round(percentage)}%
        </span>
        {label && (
          <span className="text-xs text-text-muted">{label}</span>
        )}
      </div>
    </div>
  )
}
