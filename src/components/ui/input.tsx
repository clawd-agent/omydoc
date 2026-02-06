import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base
        "h-11 w-full min-w-0 rounded-xl border bg-slate-50 px-4 py-2.5 text-base text-slate-900 placeholder:text-slate-400",
        // Border & transition
        "border-slate-200 transition-all duration-150",
        // Focus
        "focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none",
        // Invalid
        "aria-invalid:border-red-500 aria-invalid:ring-4 aria-invalid:ring-red-500/10",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // File input
        "file:text-slate-900 file:inline-flex file:h-8 file:border-0 file:bg-slate-100 file:rounded-lg file:px-3 file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
