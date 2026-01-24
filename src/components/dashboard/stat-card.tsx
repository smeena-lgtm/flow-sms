import { Card, CardContent } from "@/components/ui/card"
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
  className?: string
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("group hover-lift cursor-pointer", className)}>
      <CardContent className="p-5 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-text-secondary font-medium">{title}</p>
            <p className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
              {value}
            </p>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                trend.isPositive ? "text-green-400" : "text-heart"
              )}>
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-text-secondary font-normal text-xs hidden sm:inline">
                  vs last month
                </span>
              </div>
            )}
          </div>
          <div className="rounded-xl bg-ocean-swell/10 p-3 group-hover:bg-ocean-swell/20 transition-colors duration-200">
            <Icon className="h-6 w-6 text-ocean-swell group-hover:scale-110 transition-transform duration-200" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
