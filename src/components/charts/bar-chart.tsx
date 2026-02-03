"use client"

import { cn } from "@/lib/utils"

interface BarChartProps {
  data: { label: string; value: number }[]
  color?: string
  height?: number
  className?: string
  showValues?: boolean
}

export function BarChart({
  data,
  color = "var(--chart-1)",
  height = 200,
  className,
  showValues = false,
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const barWidth = Math.max(100 / data.length - 2, 4) // percentage width with gap

  return (
    <div className={cn("w-full", className)}>
      <div
        className="flex items-end justify-between gap-1"
        style={{ height }}
      >
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100
          return (
            <div
              key={index}
              className="flex flex-col items-center gap-1 flex-1"
            >
              {showValues && (
                <span className="text-xs text-text-secondary font-medium">
                  {item.value}
                </span>
              )}
              <div
                className="w-full rounded-t-md transition-all duration-500 ease-out hover:opacity-80"
                style={{
                  height: `${barHeight}%`,
                  minHeight: item.value > 0 ? "4px" : "0",
                  backgroundColor: color,
                  animationDelay: `${index * 50}ms`,
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-2 px-1">
        {data.map((item, index) => (
          <span
            key={index}
            className="text-xs text-text-muted flex-1 text-center truncate"
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
