import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
  iconBgColor?: string
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  iconBgColor = "bg-accent-blue/15",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-bg-card border border-border-color p-5 transition-all duration-300 hover:border-border-light hover:shadow-lg hover:shadow-black/20",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <p className="text-sm text-text-muted font-medium">{title}</p>
          <p className="text-3xl font-bold text-text-primary tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                  trend.isPositive
                    ? "text-accent-green bg-accent-green/15"
                    : "text-accent-red bg-accent-red/15"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-text-muted">
                {subtitle || "since last month"}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "rounded-xl p-3 transition-all duration-300 group-hover:scale-110",
            iconBgColor
          )}
        >
          <Icon className="h-6 w-6 text-accent-blue" />
        </div>
      </div>

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/0 to-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
}

// Large stat card variant for key metrics
interface LargeStatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  accentColor?: string
  className?: string
}

export function LargeStatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  accentColor = "accent-blue",
  className,
}: LargeStatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-bg-card border border-border-color p-6 transition-all duration-300 hover:border-border-light hover:shadow-lg",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "rounded-2xl p-4 transition-all duration-300 group-hover:scale-105",
            `bg-${accentColor}/15`
          )}
          style={{ backgroundColor: `var(--${accentColor})20` }}
        >
          <Icon
            className="h-8 w-8"
            style={{ color: `var(--${accentColor})` }}
          />
        </div>
        <div className="flex-1">
          <p className="text-sm text-text-muted font-medium">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-text-primary tracking-tight">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {trend && (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                  trend.isPositive
                    ? "text-accent-green bg-accent-green/15"
                    : "text-accent-red bg-accent-red/15"
                )}
              >
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-text-muted mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}
