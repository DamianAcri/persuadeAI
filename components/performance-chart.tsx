"use client"

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

export function PerformanceChart() {
  const data = [
    {
      name: "Jan",
      "Objection Handling": 65,
      "Active Listening": 78,
      "Value Proposition": 62,
      "Closing Techniques": 70,
    },
    {
      name: "Feb",
      "Objection Handling": 68,
      "Active Listening": 82,
      "Value Proposition": 60,
      "Closing Techniques": 73,
    },
    {
      name: "Mar",
      "Objection Handling": 72,
      "Active Listening": 85,
      "Value Proposition": 63,
      "Closing Techniques": 75,
    },
    {
      name: "Apr",
      "Objection Handling": 75,
      "Active Listening": 87,
      "Value Proposition": 65,
      "Closing Techniques": 78,
    },
    {
      name: "May",
      "Objection Handling": 78,
      "Active Listening": 92,
      "Value Proposition": 65,
      "Closing Techniques": 81,
    },
  ]

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip content={<ChartTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="Objection Handling"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Active Listening"
            stackId="2"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Value Proposition"
            stackId="3"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Closing Techniques"
            stackId="4"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

