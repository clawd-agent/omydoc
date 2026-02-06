import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base
        "flex min-h-24 w-full rounded-xl border bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400",
        // Border & transition
        "border-slate-200 transition-all duration-150",
        // Focus
        "focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none",
        // Invalid
        "aria-invalid:border-red-500 aria-invalid:ring-4 aria-invalid:ring-red-500/10",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Resize
        "resize-none",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
