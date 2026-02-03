"use client"

import { cn } from "@/lib/utils"

interface LineChartProps {
  data: { label: string; value: number }[]
  color?: string
  height?: number
  className?: string
  fillGradient?: boolean
}

export function LineChart({
  data,
  color = "var(--accent-blue)",
  height = 150,
  className,
  fillGradient = true,
}: LineChartProps) {
  if (data.length === 0) return null

  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const minValue = Math.min(...data.map((d) => d.value))
  const range = maxValue - minValue || 1

  // Calculate points for SVG path
  const width = 100 // percentage
  const padding = 5
  const usableWidth = width - padding * 2
  const usableHeight = height - 30

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * usableWidth
    const y = usableHeight - ((item.value - minValue) / range) * (usableHeight - 20) + 10
    return { x, y, value: item.value, label: item.label }
  })

  // Create SVG path
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")

  // Create area path for gradient fill
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${usableHeight} L ${points[0].x} ${usableHeight} Z`

  const gradientId = `lineGradient-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        {fillGradient && (
          <path
            d={areaPath}
            fill={`url(#${gradientId})`}
            className="transition-all duration-500"
          />
        )}

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-500"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="var(--bg-card)"
              stroke={color}
              strokeWidth="2"
              className="transition-all duration-300"
            />
          </g>
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between px-2 mt-1">
        {data.map((item, index) => (
          <span
            key={index}
            className="text-xs text-text-muted"
            style={{ width: `${100 / data.length}%`, textAlign: "center" }}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
