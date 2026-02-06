import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20",
  {
    variants: {
      variant: {
        default: 
          "bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30",
        ai: 
          "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/35",
        destructive:
          "bg-red-500 text-white shadow-xl shadow-red-500/20 hover:bg-red-600",
        outline:
          "border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 hover:border-slate-300",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        link: 
          "text-blue-600 underline-offset-4 hover:underline",
        success:
          "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm rounded-2xl",
        xs: "h-7 gap-1 px-3 text-xs rounded-xl",
        sm: "h-9 gap-1.5 px-4 text-sm rounded-xl",
        lg: "h-13 px-8 py-3 text-base rounded-2xl",
        xl: "h-14 px-10 py-4 text-lg rounded-2xl",
        icon: "size-11 rounded-2xl",
        "icon-sm": "size-9 rounded-xl",
        "icon-lg": "size-13 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
