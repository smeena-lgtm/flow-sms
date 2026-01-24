import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-ocean-swell text-midnight",
        secondary: "bg-bg-hover text-text-secondary",
        destructive: "bg-heart text-midnight",
        outline: "border border-border-color text-text-primary",
        success: "bg-green-500/20 text-green-400",
        warning: "bg-sunlight/20 text-sunlight",
        type1: "bg-ocean-swell text-midnight",
        type2: "bg-sunlight text-midnight",
        type3: "bg-heart text-midnight",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
