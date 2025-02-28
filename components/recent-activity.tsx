import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BarChart3, MessageSquare, Mic, ScrollText } from "lucide-react"

interface RecentActivityProps {
  extended?: boolean
}

export function RecentActivity({ extended = false }: RecentActivityProps) {
  const activities = [
    {
      id: 1,
      type: "conversation",
      title: "Sales Call with Acme Corp",
      time: "Today, 10:30 AM",
      score: 85,
      icon: Mic,
    },
    {
      id: 2,
      type: "simulation",
      title: "Enterprise Objection Handling",
      time: "Yesterday, 2:15 PM",
      score: 78,
      icon: MessageSquare,
    },
    {
      id: 3,
      type: "script",
      title: "Product Demo Script",
      time: "Yesterday, 11:45 AM",
      score: 92,
      icon: ScrollText,
    },
    {
      id: 4,
      type: "analysis",
      title: "Team Meeting Analysis",
      time: "Feb 20, 3:30 PM",
      score: 76,
      icon: BarChart3,
    },
    {
      id: 5,
      type: "conversation",
      title: "Discovery Call with TechStart",
      time: "Feb 19, 9:15 AM",
      score: 88,
      icon: Mic,
    },
  ]

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

