"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BarChart3, ClipboardList, MessageSquare, Mic, ScrollText } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ActivityData {
  id: string;
  user_id: string;
  type: string;
  title: string;
  score: number;
  created_at: string;
  icon?: any;
  time?: string;
}

interface RecentActivityProps {
  extended?: boolean
}

// Format relative time function
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function RecentActivity({ extended = false }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Activity type icons
  const iconMap: Record<string, any> = {
    conversation: Mic,
    simulation: MessageSquare,
    script: ScrollText,
    analysis: BarChart3,
  }

  // Load activities
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get session
        const { data } = await supabase.auth.getSession()
        
        // If no session, use demo data
        if (!data.session || !data.session.user) {
          console.log("No active session, using demo data")
          setActivities(getDemoActivities())
          setLoading(false)
          return
        }
        
        const userId = data.session.user.id
        console.log("Loading activities for user:", userId)
        
        // Limit based on extended prop
        const limit = extended ? 10 : 5
        
        // Directly query analysis_results table
        const { data: analysisData, error } = await supabase
          .from('analysis_results')
          .select('id, user_id, created_at, score, overall')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
        
        if (error) {
          console.error("Error fetching activities:", error)
          setError("Could not load activities")
          setActivities(getDemoActivities()) // Use demo data on error
          return
        }
        
        if (!analysisData || analysisData.length === 0) {
          console.log("No activities found")
          setActivities([])
          return
        }
        
        console.log(`Found ${analysisData.length} activities`)
        
        // Process activities
        const processedActivities = analysisData.map(item => ({
          id: item.id,
          user_id: item.user_id,
          type: 'analysis',
          title: item.overall 
            ? `Analysis: ${item.overall.substring(0, 30)}...` 
            : "Conversation Analysis",
          score: Math.round((item.score || 5) * 10), // Convert score to percentage
          created_at: item.created_at,
          icon: iconMap['analysis'],
          time: formatRelativeTime(item.created_at)
        }))
        
        setActivities(processedActivities)
      } catch (err: any) {
        console.error("Error loading activities:", err.message)
        setError("Could not load activities")
        setActivities(getDemoActivities()) // Use demo data on error
      } finally {
        setLoading(false)
      }
    }
    
    loadActivities()
  }, [extended, supabase])

  // Demo data function
  const getDemoActivities = (): ActivityData[] => {
    const now = new Date();
    return [
      {
        id: "demo-1",
        user_id: "demo",
        type: "analysis",
        title: "Demo: Sales pitch for enterprise client",
        score: 78,
        created_at: new Date(now.getTime() - 172800000).toISOString(), // 2 days ago
        icon: BarChart3,
        time: "2 days ago"
      },
      {
        id: "demo-2",
        user_id: "demo",
        type: "analysis",
        title: "Demo: Product demonstration call",
        score: 85,
        created_at: new Date(now.getTime() - 86400000).toISOString(), // 1 day ago
        icon: BarChart3,
        time: "1 day ago"
      },
      {
        id: "demo-3",
        user_id: "demo",
        type: "analysis",
        title: "Demo: Follow-up conversation",
        score: 92,
        created_at: new Date(now.getTime() - 43200000).toISOString(), // 12 hours ago
        icon: BarChart3,
        time: "12 hours ago"
      }
    ];
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading activities...
          </p>
        </div>
      </div>
    )
  }

  // Empty state
  if (error || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">
          {error ? "Could not load activities" : "No recent activities"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {error ? "Please try again later" : "Your recent activities will appear here when you start using the platform."}
        </p>
      </div>
    )
  }

  // Limit activities based on extended prop
  const displayActivities = extended ? activities : activities.slice(0, 3)

  return (
    <div className="space-y-4">
      {displayActivities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10">
              <activity.icon className="h-4 w-4 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{activity.title}</p>
              <div className="flex h-6 items-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
                {activity.score}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

