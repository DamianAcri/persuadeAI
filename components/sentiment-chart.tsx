"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

export function SentimentChart() {
  const data = [
    { time: "0:00", sentiment: 50 },
    { time: "3:00", sentiment: 65 },
    { time: "6:00", sentiment: 60 },
    { time: "9:00", sentiment: 45 },
    { time: "12:00", sentiment: 40 },
    { time: "15:00", sentiment: 30 },
    { time: "18:00", sentiment: 55 },
    { time: "21:00", sentiment: 75 },
    { time: "24:00", sentiment: 80 },
  ]

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} />
          <Tooltip
            content={<ChartTooltip />}
            formatter={(value) => {
              if (Number(value) >= 75) return ["Very Positive", "Sentiment"]
              if (Number(value) >= 60) return ["Positive", "Sentiment"]
              if (Number(value) >= 40) return ["Neutral", "Sentiment"]
              if (Number(value) >= 25) return ["Negative", "Sentiment"]
              return ["Very Negative", "Sentiment"]
            }}
          />
          <Area type="monotone" dataKey="sentiment" stroke="#3b82f6" fillOpacity={1} fill="url(#sentimentGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

