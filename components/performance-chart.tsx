"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ChartTooltip } from "@/components/ui/chart"

// Simple tooltip component that doesn't cause any warnings
const CustomTooltip = (props: any) => {
  const { active, payload, label } = props;
  
  if (!active || !payload || !payload.length) {
    return null;
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
  );
};

export function PerformanceChart() {
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Simple function to load directly from analysis_results
    const loadPerformanceData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get user session
        const { data } = await supabase.auth.getSession()
        
        if (!data.session || !data.session.user) {
          // If no session, use demo data
          console.log("No active session, using demo data")
          setPerformanceData(getDemoData())
          return
        }
        
        const userId = data.session.user.id
        console.log("Getting performance data for user:", userId)
        
        // Direct query from analysis_results
        const { data: analysisData, error } = await supabase
          .from('analysis_results')
          .select('created_at, objection_handling, active_listening, value_proposition, closing_techniques')
          .eq('user_id', userId)
        
        if (error) {
          console.error("Error fetching analysis data:", error)
          setError("Could not load performance data")
          setPerformanceData(getDemoData())
          return
        }
        
        if (!analysisData || analysisData.length === 0) {
          console.log("No analysis data found")
          setPerformanceData(getDemoData())
          return
        }
        
        console.log(`Found ${analysisData.length} records`)
        
        // Process by month
        const monthlyData: Record<string, any> = {}
        
        analysisData.forEach(item => {
          if (!item.created_at) return
          
          const date = new Date(item.created_at)
          const monthKey = date.toLocaleString('en-us', { month: 'short' })
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              count: 0,
              objectionHandling: 0,
              activeListing: 0,
              valueProposition: 0,
              closingTechniques: 0
            }
          }
          
          const data = monthlyData[monthKey]
          data.count++
          
          // Handle nulls
          if (item.objection_handling != null) data.objectionHandling += item.objection_handling * 10
          if (item.active_listening != null) data.activeListing += item.active_listening * 10
          if (item.value_proposition != null) data.valueProposition += item.value_proposition * 10
          if (item.closing_techniques != null) data.closingTechniques += item.closing_techniques * 10
        })
        
        // Month order for sorting
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        // Convert to chart format with averages
        const chartData = Object.entries(monthlyData).map(([month, data]: [string, any]) => {
          return {
            name: month,
            "Objection Handling": Math.round(data.objectionHandling / data.count) || 0,
            "Active Listening": Math.round(data.activeListing / data.count) || 0,
            "Value Proposition": Math.round(data.valueProposition / data.count) || 0,
            "Closing Techniques": Math.round(data.closingTechniques / data.count) || 0,
            "Rapport Building": Math.round((data.objectionHandling + data.activeListing) / (2 * data.count)) || 0
          }
        })
        .sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name))
        
        console.log("Chart data prepared:", chartData)
        setPerformanceData(chartData)
      } catch (err) {
        console.error("Error processing performance data:", err)
        setError("Error processing data")
        setPerformanceData(getDemoData())
      } finally {
        setLoading(false)
      }
    }
    
    loadPerformanceData()
  }, [supabase])

  // Demo data for when there's no real data
  const getDemoData = () => [
    {
      name: "Feb",
      "Objection Handling": 65,
      "Active Listening": 70,
      "Value Proposition": 62,
      "Closing Techniques": 58,
      "Rapport Building": 67
    },
    {
      name: "Mar",
      "Objection Handling": 72,
      "Active Listening": 78,
      "Value Proposition": 68,
      "Closing Techniques": 65,
      "Rapport Building": 75
    },
    {
      name: "Apr",
      "Objection Handling": 81,
      "Active Listening": 84,
      "Value Proposition": 75,
      "Closing Techniques": 70,
      "Rapport Building": 82
    }
  ]

  // Loading indicator
  if (loading) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <p className="mt-2 text-sm text-muted-foreground">Using demo data.</p>
        </div>
      </div>
    )
  }

  // Render chart
  return (
    <div className="h-[350px] w-full">
      <div aria-label="Performance metrics chart" className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={performanceData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorObjHandling" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorActiveListen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorValueProp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorClosing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorRapport" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="Objection Handling"
              stroke="#3b82f6"
              fillOpacity={0.6}
              fill="url(#colorObjHandling)"
            />
            <Area
              type="monotone"
              dataKey="Active Listening"
              stroke="#10b981"
              fillOpacity={0.6}
              fill="url(#colorActiveListen)"
            />
            <Area
              type="monotone"
              dataKey="Value Proposition"
              stroke="#f59e0b"
              fillOpacity={0.6}
              fill="url(#colorValueProp)"
            />
            <Area
              type="monotone"
              dataKey="Closing Techniques"
              stroke="#8b5cf6"
              fillOpacity={0.6}
              fill="url(#colorClosing)"
            />
            <Area
              type="monotone"
              dataKey="Rapport Building"
              stroke="#ec4899"
              fillOpacity={0.6}
              fill="url(#colorRapport)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

