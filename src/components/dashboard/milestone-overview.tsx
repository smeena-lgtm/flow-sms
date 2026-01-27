import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

type MilestoneStatus = "pending" | "in_progress" | "completed" | "overdue"

interface Milestone {
  id: string
  name: string
  dueDate: Date
  status: MilestoneStatus
  project: {
    name: string
  }
}

interface MilestoneOverviewProps {
  milestones: Milestone[]
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-sunlight",
    bgColor: "bg-sunlight/20",
    label: "Pending",
  },
  in_progress: {
    icon: Clock,
    color: "text-ocean-swell",
    bgColor: "bg-ocean-swell/20",
    label: "In Progress",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    label: "Completed",
  },
  overdue: {
    icon: AlertCircle,
    color: "text-heart",
    bgColor: "bg-heart/20",
    label: "Overdue",
  },
}

export function MilestoneOverview({ milestones }: MilestoneOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Milestones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">
              No upcoming milestones
            </p>
          ) : (
            milestones.map((milestone) => {
              const config = statusConfig[milestone.status]
              const StatusIcon = config.icon

              return (
                <div
                  key={milestone.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-bg-hover transition-colors"
                >
                  <div className={`rounded-full p-2 ${config.bgColor}`}>
                    <StatusIcon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">
                      {milestone.name}
                    </p>
                    <p className="text-sm text-text-secondary">{milestone.project.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-secondary">
                      {new Date(milestone.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <Badge
                      variant={
                        milestone.status === "completed"
                          ? "success"
                          : milestone.status === "overdue"
                          ? "destructive"
                          : "warning"
                      }
                      className="mt-1"
                    >
                      {config.label}
                    </Badge>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
