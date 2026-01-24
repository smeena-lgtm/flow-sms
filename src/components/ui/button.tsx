import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-swell focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-ocean-swell text-midnight font-semibold hover:bg-ocean-swell/90 hover:shadow-lg hover:shadow-ocean-swell/20",
        destructive: "bg-heart text-midnight font-semibold hover:bg-heart/90 hover:shadow-lg hover:shadow-heart/20",
        outline: "border border-border-color bg-transparent text-text-primary hover:bg-bg-hover hover:border-text-secondary",
        secondary: "bg-bg-hover text-text-primary hover:bg-bg-hover/80",
        ghost: "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
        link: "text-ocean-swell underline-offset-4 hover:underline",
        success: "bg-green-500 text-midnight font-semibold hover:bg-green-500/90 hover:shadow-lg hover:shadow-green-500/20",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
