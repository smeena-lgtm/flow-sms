"use client"

import { useState } from "react"
import { LayoutGrid, List, Kanban, Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProjectCard } from "@/components/projects/project-card"
import { projects, type Project } from "@/lib/data"

type ViewMode = "grid" | "table" | "kanban"

const statusColumns = ["Planning", "Active", "On Hold", "Completed"] as const

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [filterType, setFilterType] = useState<string>("all")

  const filteredProjects = filterType === "all"
    ? projects
    : projects.filter((p) => p.type === filterType)

  const projectsByStatus = statusColumns.reduce((acc, status) => {
    acc[status] = filteredProjects.filter((p) => p.status === status)
    return acc
  }, {} as Record<string, Project[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary">Projects</h2>
          <p className="text-text-secondary">Manage and track all your projects</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Type Filter */}
        <Tabs value={filterType} onValueChange={setFilterType}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Architecture">Architecture</TabsTrigger>
            <TabsTrigger value="Interior">Interior</TabsTrigger>
            <TabsTrigger value="Engineering">Engineering</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-bg-dark p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-bg-card text-text-primary" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "table" ? "bg-bg-card text-text-primary" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "kanban" ? "bg-bg-card text-text-primary" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Kanban className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {viewMode === "table" && (
        <div className="bg-bg-card border border-border-color rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-bg-dark">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-secondary">Project</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-secondary">Type</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-secondary">Progress</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-secondary">End Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-bg-hover">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-text-primary">{project.name}</p>
                      <p className="text-sm text-text-secondary">{project.client}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={project.type === "Architecture" ? "type1" : project.type === "Interior" ? "type2" : "type3"}>
                      {project.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${
                      project.status === "Active" ? "text-ocean-swell" :
                      project.status === "Completed" ? "text-green-400" :
                      project.status === "On Hold" ? "text-sunlight" : "text-text-secondary"
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-bg-hover rounded-full overflow-hidden">
                        <div
                          className="h-full bg-ocean-swell"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-text-secondary">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {new Date(project.endDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statusColumns.map((status) => (
            <div key={status} className="bg-bg-dark rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-text-primary">{status}</h3>
                <Badge variant="secondary">{projectsByStatus[status].length}</Badge>
              </div>
              <div className="space-y-3">
                {projectsByStatus[status].map((project) => (
                  <div
                    key={project.id}
                    className="bg-bg-card border border-border-color rounded-lg p-4 hover:border-ocean-swell/50 transition-colors cursor-pointer"
                  >
                    <Badge variant={project.type === "Architecture" ? "type1" : project.type === "Interior" ? "type2" : "type3"} className="mb-2">
                      {project.type}
                    </Badge>
                    <h4 className="font-medium text-text-primary text-sm">{project.name}</h4>
                    <p className="text-xs text-text-secondary mt-1">{project.client}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 h-1.5 bg-bg-hover rounded-full overflow-hidden">
                        <div
                          className="h-full bg-ocean-swell"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary">{project.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
