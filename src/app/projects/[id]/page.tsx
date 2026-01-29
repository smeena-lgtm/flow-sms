"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Calendar, MapPin, Users, MoreHorizontal, FileText, CheckSquare, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { projects } from "@/lib/data"

const getTypeBadgeVariant = (type: string) => {
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

export default function ProjectDetailPage() {
  const params = useParams()
  const project = projects.find((p) => p.id === params.id)

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary">Project not found</h2>
        <Link href="/projects">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button and title */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center text-sm text-text-secondary hover:text-text-primary mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-text-primary">{project.name}</h1>
            <Badge variant={getTypeBadgeVariant(project.type)}>{project.type}</Badge>
          </div>
          <p className="text-text-secondary mt-1">{project.client}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Edit Project</Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-ocean-swell/20 p-2">
                <Calendar className="h-5 w-5 text-ocean-swell" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Timeline</p>
                <p className="text-sm font-medium text-text-primary">
                  {new Date(project.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} - {new Date(project.targetDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-sunlight/20 p-2">
                <MapPin className="h-5 w-5 text-sunlight" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Location</p>
                <p className="text-sm font-medium text-text-primary">{project.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-heart/20 p-2">
                <Users className="h-5 w-5 text-heart" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Team Size</p>
                <p className="text-sm font-medium text-text-primary">{project.team.length} members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-text-secondary">Progress</p>
                <p className="text-sm font-medium text-text-primary">{project.progress}%</p>
              </div>
              <Progress value={project.progress} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Description */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">
                  This project involves the design and development of {project.name.toLowerCase()} for {project.client}.
                  Located in {project.location}, the project encompasses {project.type.toLowerCase()} design work
                  with a focus on innovative solutions and sustainable practices.
                </p>
                <p className="text-text-secondary mt-4">
                  The project timeline spans from {new Date(project.startDate).toLocaleDateString()} to {new Date(project.targetDate).toLocaleDateString()},
                  with key milestones including schematic design, design development, and construction documentation phases.
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-text-secondary" />
                    <span className="text-sm text-text-secondary">Tasks</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">24 / 36</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-text-secondary" />
                    <span className="text-sm text-text-secondary">Documents</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">18</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-text-secondary" />
                    <span className="text-sm text-text-secondary">Comments</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">47</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">Task management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">Document management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.team.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-4 rounded-lg bg-bg-dark"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-text-primary">{member.name}</p>
                      <p className="text-sm text-text-secondary">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
