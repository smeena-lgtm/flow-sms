import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const activities = [
  {
    id: 1,
    user: "Ahmed Al-Rashid",
    action: "uploaded new drawings",
    target: "Al-Mamlaka Tower",
    time: "2 hours ago",
  },
  {
    id: 2,
    user: "Sarah Hassan",
    action: "completed milestone",
    target: "Structural Analysis",
    time: "4 hours ago",
  },
  {
    id: 3,
    user: "Mohammed Khalid",
    action: "added comment on",
    target: "Desert Bloom Villas",
    time: "5 hours ago",
  },
  {
    id: 4,
    user: "Fatima Al-Saud",
    action: "updated status of",
    target: "Riyadh Cultural Center",
    time: "Yesterday",
  },
  {
    id: 5,
    user: "Omar Faisal",
    action: "created new task in",
    target: "Jeddah Office Complex",
    time: "Yesterday",
  },
]

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs">
                  {activity.user.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-text-secondary">{activity.action}</span>{" "}
                  <span className="font-medium text-ocean-swell">{activity.target}</span>
                </p>
                <p className="text-xs text-text-secondary mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
