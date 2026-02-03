"use client"

import { cn } from "@/lib/utils"

interface DonutChartProps {
  data: { label: string; value: number; color: string }[]
  size?: number
  strokeWidth?: number
  className?: string
  showLegend?: boolean
}

export function DonutChart({
  data,
  size = 120,
  strokeWidth = 20,
  className,
  showLegend = true,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let cumulativePercentage = 0

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--bg-hover)"
            strokeWidth={strokeWidth}
          />
          {/* Data segments */}
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
            const strokeDashoffset = -((cumulativePercentage / 100) * circumference)
            cumulativePercentage += percentage

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
                className="transition-all duration-500 ease-out"
              />
            )
          })}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-text-primary">{total}</span>
          <span className="text-xs text-text-secondary">Total</span>
        </div>
      </div>

      {showLegend && (
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-text-secondary">{item.label}</span>
              <span className="text-xs font-medium text-text-primary ml-auto">
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
