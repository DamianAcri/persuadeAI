"use client"

import * as React from "react"

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`h-[350px] w-full ${className || ''}`} {...props} />
  ),
)
ChartContainer.displayName = "ChartContainer"

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="font-medium">{label}</div>
        <div className="font-medium text-right"></div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-2">
            <div className="flex items-center">
              <div
                className="mr-1 h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.name}:
              </span>
            </div>
            <span className="text-sm font-medium">
              {entry.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip }

