import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type ProjectType = "architecture" | "interior" | "engineering" | "mixed"
type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "archived"

interface ProjectMember {
  id: string
  name: string
  avatar: string | null
}

interface Project {
  id: string
  name: string
  type: ProjectType
  status: ProjectStatus
  progress: number
  client: {
    name: string
  }
  members: {
    user: ProjectMember
  }[]
}

interface ProjectsTableProps {
  projects: Project[]
}

const getTypeBadgeVariant = (type: ProjectType) => {
  switch (type) {
    case "architecture":
      return "type1"
    case "interior":
      return "type2"
    case "engineering":
      return "type3"
    default:
      return "default"
  }
}

const formatType = (type: ProjectType) => {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case "active":
      return "text-ocean-swell"
    case "on_hold":
      return "text-sunlight"
    case "completed":
      return "text-green-400"
    case "planning":
      return "text-text-secondary"
    default:
      return "text-text-secondary"
  }
}

const formatStatus = (status: ProjectStatus) => {
  return status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Active Projects</CardTitle>
        <Link
          href="/projects"
          className="text-sm text-ocean-swell hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-color">
                <th className="pb-3 text-left text-sm font-medium text-text-secondary">
                  Project
                </th>
                <th className="pb-3 text-left text-sm font-medium text-text-secondary">
                  Type
                </th>
                <th className="pb-3 text-left text-sm font-medium text-text-secondary">
                  Status
                </th>
                <th className="pb-3 text-left text-sm font-medium text-text-secondary">
                  Progress
                </th>
                <th className="pb-3 text-left text-sm font-medium text-text-secondary">
                  Team
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {projects.map((project) => (
                <tr key={project.id} className="group">
                  <td className="py-4">
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium text-text-primary group-hover:text-ocean-swell transition-colors"
                    >
                      {project.name}
                    </Link>
                    <p className="text-sm text-text-secondary">{project.client.name}</p>
                  </td>
                  <td className="py-4">
                    <Badge variant={getTypeBadgeVariant(project.type)}>
                      {formatType(project.type)}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <span className={getStatusColor(project.status)}>
                      {formatStatus(project.status)}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <Progress value={project.progress} className="w-24" />
                      <span className="text-sm text-text-secondary">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 3).map((member) => (
                        <Avatar key={member.user.id} className="h-8 w-8 border-2 border-bg-card">
                          <AvatarFallback className="text-xs">
                            {member.user.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.members.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-bg-hover border-2 border-bg-card flex items-center justify-center">
                          <span className="text-xs text-text-secondary">
                            +{project.members.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
