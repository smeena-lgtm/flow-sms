"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { projects, type Project } from "@/lib/data"

const getTypeBadgeVariant = (type: Project["type"]) => {
  switch (type) {
    case "Architecture":
      return "type1"
    case "Interior":
      return "type2"
    case "Engineering":
      return "type3"
    default:
      return "default"
  }
}

const getStatusColor = (status: Project["status"]) => {
  switch (status) {
    case "Active":
      return "text-ocean-swell"
    case "On Hold":
      return "text-sunlight"
    case "Completed":
      return "text-green-400"
    case "Planning":
      return "text-text-secondary"
    default:
      return "text-text-secondary"
  }
}

export function ProjectsTable() {
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
              {projects.slice(0, 5).map((project) => (
                <tr key={project.id} className="group">
                  <td className="py-4">
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium text-text-primary group-hover:text-ocean-swell transition-colors"
                    >
                      {project.name}
                    </Link>
                    <p className="text-sm text-text-secondary">{project.client}</p>
                  </td>
                  <td className="py-4">
                    <Badge variant={getTypeBadgeVariant(project.type)}>
                      {project.type}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <span className={getStatusColor(project.status)}>
                      {project.status}
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
                      {project.team.slice(0, 3).map((member) => (
                        <Avatar key={member.id} className="h-8 w-8 border-2 border-bg-card">
                          <AvatarFallback className="text-xs">
                            {member.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.team.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-bg-hover border-2 border-bg-card flex items-center justify-center">
                          <span className="text-xs text-text-secondary">
                            +{project.team.length - 3}
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
