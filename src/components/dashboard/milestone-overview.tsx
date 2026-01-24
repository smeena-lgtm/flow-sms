import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

const milestones = [
  {
    id: 1,
    name: "Schematic Design Review",
    project: "Al-Mamlaka Tower",
    dueDate: "2024-01-28",
    status: "upcoming" as const,
  },
  {
    id: 2,
    name: "Client Presentation",
    project: "Riyadh Cultural Center",
    dueDate: "2024-01-30",
    status: "upcoming" as const,
  },
  {
    id: 3,
    name: "Structural Analysis Complete",
    project: "Desert Bloom Villas",
    dueDate: "2024-01-25",
    status: "completed" as const,
  },
  {
    id: 4,
    name: "MEP Coordination",
    project: "Al-Mamlaka Tower",
    dueDate: "2024-01-24",
    status: "overdue" as const,
  },
  {
    id: 5,
    name: "Interior Material Selection",
    project: "Jeddah Office Complex",
    dueDate: "2024-02-01",
    status: "upcoming" as const,
  },
]

const statusConfig = {
  upcoming: {
    icon: Clock,
    color: "text-sunlight",
    bgColor: "bg-sunlight/20",
    label: "Upcoming",
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

export function MilestoneOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Milestones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.map((milestone) => {
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
                  <p className="text-sm text-text-secondary">{milestone.project}</p>
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
          })}
        </div>
      </CardContent>
    </Card>
  )
}
