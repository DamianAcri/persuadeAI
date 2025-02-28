"use client"

import * as React from "react"
import type { TooltipProps } from "recharts/types/component/Tooltip"
import { cn } from "@/lib/utils"

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("h-[350px] w-full", className)} {...props} />,
)
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<HTMLDivElement, TooltipProps<any, any> & React.HTMLAttributes<HTMLDivElement>>(
  ({ active, payload, label, className, ...props }, ref) => {
    if (active && payload?.length) {
      return (
        <div ref={ref} className={cn("rounded-lg border bg-background p-2 shadow-sm", className)} {...props}>
          <div className="grid gap-2">
            <p className="text-sm font-medium">{label}</p>
            <ul className="grid gap-1">
              {payload.map((item: any, index: number) => (
                <li key={index} className="flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.name}</span>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    }

    return null
  },
)
ChartTooltip.displayName = "ChartTooltip"

export { ChartContainer, ChartTooltip }

