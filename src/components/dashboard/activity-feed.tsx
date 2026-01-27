import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Activity {
  id: string
  user: {
    id: string
    name: string
    avatar: string | null
  }
  action: string
  target: string
  createdAt: Date
  project: {
    name: string
  } | null
}

interface ActivityFeedProps {
  activities: Activity[]
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 172800) return "Yesterday"
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

function formatAction(action: string): string {
  return action.replace(/_/g, " ")
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs">
                    {activity.user.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{activity.user.name}</span>{" "}
                    <span className="text-text-secondary">{formatAction(activity.action)}</span>{" "}
                    <span className="font-medium text-ocean-swell">{activity.target}</span>
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {formatTimeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
