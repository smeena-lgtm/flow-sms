import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, MapPin, ArrowUpRight } from "lucide-react"
import { type Project } from "@/lib/data"

interface ProjectCardProps {
  project: Project
}

const getTypeBadgeVariant = (type: Project["type"]) => {
  switch (type) {
    case "Type 1":
      return "type1"
    case "Type 2":
      return "type2"
    case "Type 3":
      return "type3"
    default:
      return "default"
  }
}

const getStatusColor = (status: Project["status"]) => {
  switch (status) {
    case "active":
      return "bg-ocean-swell"
    case "on-hold":
      return "bg-sunlight"
    case "completed":
      return "bg-green-500"
    case "lead":
    case "feasibility":
      return "bg-text-secondary"
    default:
      return "bg-text-secondary"
  }
}

const statusLabels: Record<string, string> = {
  "lead": "Lead",
  "feasibility": "Feasibility",
  "active": "Active",
  "on-hold": "On Hold",
  "completed": "Completed"
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="group hover-lift hover-glow cursor-pointer h-full overflow-hidden">
        <CardContent className="p-5 relative">
          {/* Hover indicator */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ArrowUpRight className="h-5 w-5 text-ocean-swell" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-4 pr-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`h-2 w-2 rounded-full ${getStatusColor(project.status)} ${project.status === "active" ? "animate-pulse" : ""}`} />
                <span className="text-xs text-text-secondary font-medium">{statusLabels[project.status] || project.status}</span>
              </div>
              <h3 className="font-semibold text-text-primary group-hover:text-ocean-swell transition-colors duration-200 truncate">
                {project.name}
              </h3>
              <p className="text-sm text-text-secondary mt-0.5">{project.client}</p>
            </div>
          </div>

          {/* Badge */}
          <div className="mb-4">
            <Badge variant={getTypeBadgeVariant(project.type)}>
              {project.type}
            </Badge>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-text-secondary">Progress</span>
              <span className="text-text-primary font-semibold">{project.progress}%</span>
            </div>
            <div className="relative">
              <Progress value={project.progress} className="h-2" />
              {project.progress >= 75 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary mb-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate max-w-[100px]">{project.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {new Date(project.targetDate).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Team */}
          <div className="flex items-center justify-between pt-3 border-t border-border-color">
            <div className="flex -space-x-2">
              {project.team.slice(0, 4).map((member, index) => (
                <Avatar
                  key={member.id}
                  className="h-8 w-8 border-2 border-bg-card ring-0 transition-transform duration-200 hover:scale-110 hover:z-10"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <AvatarFallback className="text-xs">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.team.length > 4 && (
                <div className="h-8 w-8 rounded-full bg-bg-hover border-2 border-bg-card flex items-center justify-center">
                  <span className="text-xs text-text-secondary font-medium">
                    +{project.team.length - 4}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs text-text-secondary">
              {project.team.length} members
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
