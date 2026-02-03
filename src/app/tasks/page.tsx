"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  RefreshCw,
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  Ban,
  Filter,
  MoreHorizontal,
  Calendar,
  User,
  Flag,
  MessageSquare,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Types
interface Task {
  id: string
  title: string
  description: string | null
  status: "todo" | "in_progress" | "review" | "completed" | "blocked"
  priority: "low" | "medium" | "high" | "urgent"
  dueDate: string | null
  order: number
  project: {
    id: string
    name: string
  }
  assignee: {
    id: string
    name: string
    avatar: string | null
  } | null
  creator: {
    id: string
    name: string
  }
  _count: {
    comments: number
    subtasks: number
  }
}

interface TasksData {
  tasks: Task[]
  grouped: {
    todo: Task[]
    in_progress: Task[]
    review: Task[]
    completed: Task[]
    blocked: Task[]
  }
  stats: {
    total: number
    todo: number
    inProgress: number
    review: number
    completed: number
    blocked: number
    highPriority: number
  }
}

interface Project {
  id: string
  name: string
}

interface User {
  id: string
  name: string
  avatar: string | null
}

// Status configuration
const statusConfig = {
  todo: {
    label: "To Do",
    icon: ListTodo,
    color: "text-text-secondary",
    bgColor: "bg-bg-hover",
    borderColor: "border-border-color",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "text-ocean-swell",
    bgColor: "bg-ocean-swell/10",
    borderColor: "border-ocean-swell/30",
  },
  review: {
    label: "Review",
    icon: AlertCircle,
    color: "text-sunlight",
    bgColor: "bg-sunlight/10",
    borderColor: "border-sunlight/30",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  blocked: {
    label: "Blocked",
    icon: Ban,
    color: "text-heart",
    bgColor: "bg-heart/10",
    borderColor: "border-heart/30",
  },
}

// Priority configuration
const priorityConfig = {
  low: { label: "Low", color: "text-text-secondary", bgColor: "bg-bg-hover" },
  medium: { label: "Medium", color: "text-ocean-swell", bgColor: "bg-ocean-swell/10" },
  high: { label: "High", color: "text-sunlight", bgColor: "bg-sunlight/10" },
  urgent: { label: "Urgent", color: "text-heart", bgColor: "bg-heart/10" },
}

export default function TasksPage() {
  const [tasksData, setTasksData] = useState<TasksData | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [filterProject, setFilterProject] = useState<string | null>(null)
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null)

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // New task form
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    projectId: "",
    priority: "medium",
    assigneeId: "",
    dueDate: "",
  })

  const fetchTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filterProject) params.append("projectId", filterProject)
      if (filterAssignee) params.append("assigneeId", filterAssignee)

      const response = await fetch(`/api/tasks?${params}`)
      if (!response.ok) throw new Error("Failed to fetch tasks")
      const data = await response.json()
      setTasksData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || data || [])
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/hr")
      if (response.ok) {
        const data = await response.json()
        // Map team data to users format
        const teamUsers = data.team?.map((member: { name: string; title: string }) => ({
          id: member.name, // Using name as ID for now
          name: member.name,
          avatar: null,
        })) || []
        setUsers(teamUsers)
      }
    } catch (err) {
      console.error("Failed to fetch users:", err)
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchProjects()
    fetchUsers()
  }, [filterProject, filterAssignee])

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.projectId) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          assigneeId: newTask.assigneeId || undefined,
          dueDate: newTask.dueDate || undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to create task")

      // Refresh tasks
      await fetchTasks()

      // Reset form and close modal
      setNewTask({
        title: "",
        description: "",
        projectId: "",
        priority: "medium",
        assigneeId: "",
        dueDate: "",
      })
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error("Failed to create task:", err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update task")

      // Refresh tasks
      await fetchTasks()
    } catch (err) {
      console.error("Failed to update task:", err)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete task")

      // Refresh tasks
      await fetchTasks()
    } catch (err) {
      console.error("Failed to delete task:", err)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return { text: `${Math.abs(days)}d overdue`, isOverdue: true }
    if (days === 0) return { text: "Today", isOverdue: false }
    if (days === 1) return { text: "Tomorrow", isOverdue: false }
    return { text: `${days}d`, isOverdue: false }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary flex items-center gap-2">
            <ListTodo className="h-7 w-7 text-ocean-swell" />
            Tasks
          </h2>
          <p className="text-text-secondary">Manage and track all tasks across projects</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchTasks} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-ocean-swell hover:bg-ocean-swell/90">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-bg-card border-border-color">
              <DialogHeader>
                <DialogTitle className="text-text-primary">Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-text-primary">Title *</label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Task title"
                    className="mt-1 bg-bg-dark border-border-color"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary">Description</label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Task description"
                    className="mt-1 bg-bg-dark border-border-color"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-primary">Project *</label>
                    <Select
                      value={newTask.projectId}
                      onValueChange={(value) => setNewTask({ ...newTask, projectId: value })}
                    >
                      <SelectTrigger className="mt-1 bg-bg-dark border-border-color">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-primary">Priority</label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger className="mt-1 bg-bg-dark border-border-color">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary">Due Date</label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="mt-1 bg-bg-dark border-border-color"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTask}
                    disabled={!newTask.title || !newTask.projectId || isCreating}
                    className="bg-ocean-swell hover:bg-ocean-swell/90"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Task"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats - Compact horizontal scroll on mobile */}
      {tasksData && (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-6 lg:overflow-visible">
          <div className="flex-shrink-0 w-24 lg:w-auto rounded-xl bg-bg-card border border-border-color p-3">
            <div className="text-xl font-bold text-text-primary">{tasksData.stats.total}</div>
            <div className="text-xs text-text-secondary">Total</div>
          </div>
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon
            const count = tasksData.stats[status === "in_progress" ? "inProgress" : status as keyof typeof tasksData.stats] || 0
            return (
              <div key={status} className={`flex-shrink-0 w-28 lg:w-auto rounded-xl bg-bg-card border ${config.borderColor} p-3`}>
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <span className={`text-xl font-bold ${config.color}`}>{count}</span>
                </div>
                <div className="text-xs text-text-secondary truncate">{config.label}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-secondary" />
          <span className="text-sm text-text-secondary">Filters:</span>
        </div>
        <Select value={filterProject || ""} onValueChange={(v) => setFilterProject(v || null)}>
          <SelectTrigger className="w-[180px] bg-bg-dark border-border-color">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(filterProject || filterAssignee) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterProject(null)
              setFilterAssignee(null)
            }}
            className="text-text-secondary"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-ocean-swell" />
        </div>
      ) : error ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-heart" />
            <p className="text-text-secondary">{error}</p>
            <Button onClick={fetchTasks} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      ) : tasksData && tasksData.stats.total === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-bg-hover p-6">
              <ListTodo className="h-12 w-12 text-text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary">No Tasks Yet</h3>
            <p className="text-text-secondary max-w-md">
              Create your first task to start tracking work across projects.
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-ocean-swell hover:bg-ocean-swell/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          </div>
        </Card>
      ) : (
        <div className="relative -mx-4 lg:mx-0">
          {/* Horizontal scroll container */}
          <div className="flex gap-4 overflow-x-auto px-4 lg:px-0 pb-4 snap-x snap-mandatory">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon
              const tasks = tasksData?.grouped[status as keyof typeof tasksData.grouped] || []

              return (
                <div key={status} className="flex-shrink-0 w-72 snap-start">
                  {/* Column Header */}
                  <div className={`flex items-center gap-2 px-3 py-2.5 rounded-t-xl ${config.bgColor} border-b-2 ${config.borderColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <span className={`font-medium text-sm ${config.color}`}>{config.label}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {tasks.length}
                    </Badge>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-2 p-2 bg-bg-dark/50 rounded-b-xl min-h-[50vh] max-h-[65vh] overflow-y-auto">
                    {tasks.length === 0 ? (
                      <div className="text-center py-8 text-text-muted text-sm">
                        No tasks
                      </div>
                    ) : (
                      tasks.map((task) => {
                        const dueInfo = formatDate(task.dueDate)
                        const priorityInfo = priorityConfig[task.priority]

                        return (
                          <div
                            key={task.id}
                            className="rounded-xl bg-bg-card border border-border-color hover:border-ocean-swell/30 transition-all p-3 space-y-2"
                          >
                            {/* Title and Menu */}
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-text-primary text-sm leading-snug line-clamp-2">
                                {task.title}
                              </h4>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {Object.entries(statusConfig).map(([s, c]) => (
                                    <DropdownMenuItem
                                      key={s}
                                      onClick={() => handleStatusChange(task.id, s)}
                                      disabled={s === status}
                                    >
                                      <c.icon className={`h-4 w-4 mr-2 ${c.color}`} />
                                      Move to {c.label}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-heart"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Project */}
                            <Badge variant="secondary" className="text-xs truncate max-w-full">
                              {task.project.name}
                            </Badge>

                            {/* Meta Row */}
                            <div className="flex items-center gap-2 text-xs flex-wrap">
                              {/* Priority */}
                              <span className={`flex items-center gap-1 ${priorityInfo.color}`}>
                                <Flag className="h-3 w-3" />
                                {priorityInfo.label}
                              </span>

                              {/* Due Date */}
                              {dueInfo && (
                                <span className={`flex items-center gap-1 ${dueInfo.isOverdue ? "text-heart" : "text-text-muted"}`}>
                                  <Calendar className="h-3 w-3" />
                                  {dueInfo.text}
                                </span>
                              )}
                            </div>

                            {/* Assignee */}
                            {task.assignee && (
                              <div className="flex items-center gap-2 pt-2 border-t border-border-color/50">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-[10px] bg-ocean-swell/20 text-ocean-swell">
                                    {getInitials(task.assignee.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-text-muted truncate">{task.assignee.name}</span>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
