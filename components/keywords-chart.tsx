"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

export function KeywordsChart() {
  const data = [
    { name: "Pricing", value: 28 },
    { name: "Features", value: 22 },
    { name: "Integration", value: 18 },
    { name: "Support", value: 15 },
    { name: "Timeline", value: 12 },
    { name: "Other", value: 5 },
  ]

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6b7280"]

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} formatter={(value) => [`${value} mentions`, "Frequency"]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

