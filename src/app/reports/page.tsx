"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, Building2, RefreshCw, MapPin, Briefcase, BarChart3, DollarSign, TrendingUp, Home, Car, Ruler, PieChart, Maximize2, ArrowUpDown, Building } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

// HR Data Types
interface Employee {
  srNo: string
  name: string
  title: string
  status: string
  office: string
  reportsTo: string
  remarks: string
}

interface OfficeSummary {
  office: string
  totalEmployees: number
  onBoard: number
  toBeJoined: number
}

interface HRData {
  team: Employee[]
  tbj: Employee[]
  stats: {
    totalEmployees: number
    totalTBJ: number
    byOffice: Record<string, number>
    byStage: Record<string, number>
  }
  officeSummaries: OfficeSummary[]
}

// Project Stats Types
interface ProjectStats {
  plotNumber: string
  project: string
  plotArea: number
  far: number
  configuration: string
  residentialGFAAllowed: number
  commercialGFAAllowed: number
  totalGFAAllowed: number
  residentialGFAAchieved: number
  commercialGFAAchieved: number
  totalGFAAchieved: number
  suiteSellable: number
  balconySellable: number
  totalSellable: number
  sellableEfficiency: number
  amenities: number
  efficiencyAmenities: number
  units1BD: number
  units2BD: number
  units3BD: number
  units4BD: number
  totalUnits: number
  parkingRequired: number
  parkingProposed: number
  parkingEfficiency: number
  passengerLifts: number
  serviceLifts: number
  totalLifts: number
  bua: number
  gfaBuaRatio: number
  dmd: number
  ols: number
  height: number
}

interface AggregatedStats {
  totalProjects: number
  totalPlotArea: number
  totalGFAAllowed: number
  totalGFAAchieved: number
  gfaUtilization: number
  totalSellable: number
  avgSellableEfficiency: number
  totalUnits: number
  unitMix: {
    bd1: number
    bd2: number
    bd3: number
    bd4: number
  }
  totalParkingRequired: number
  totalParkingProposed: number
  avgParkingEfficiency: number
  totalLifts: number
}

interface ProjectStatsData {
  projects: ProjectStats[]
  aggregated: AggregatedStats
  lastUpdated: string
}

// Report type tabs
const reportTabs = [
  { id: "hr", name: "HR", icon: Users, description: "Human Resources" },
  { id: "projects", name: "Projects", icon: TrendingUp, description: "Project Statistics" },
  { id: "finance", name: "Finance", icon: DollarSign, description: "Financial Reports", comingSoon: true },
]

// Format number with commas
function formatNumber(num: number): string {
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 })
}

// Format percentage
function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState("hr")

  // HR State
  const [hrData, setHrData] = useState<HRData | null>(null)
  const [hrLoading, setHrLoading] = useState(true)
  const [hrError, setHrError] = useState<string | null>(null)
  const [hrActiveTab, setHrActiveTab] = useState("team")

  // Project Stats State
  const [projectData, setProjectData] = useState<ProjectStatsData | null>(null)
  const [projectLoading, setProjectLoading] = useState(false)
  const [projectError, setProjectError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const fetchHRData = async () => {
    setHrLoading(true)
    setHrError(null)
    try {
      const response = await fetch("/api/hr")
      if (!response.ok) throw new Error("Failed to fetch HR data")
      const result = await response.json()
      setHrData(result)
    } catch (err) {
      setHrError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setHrLoading(false)
    }
  }

  const fetchProjectData = async () => {
    setProjectLoading(true)
    setProjectError(null)
    try {
      const response = await fetch("/api/project-stats")
      if (!response.ok) throw new Error("Failed to fetch project data")
      const result = await response.json()
      setProjectData(result)
      if (result.projects?.length > 0) {
        setSelectedProject(result.projects[0].plotNumber)
      }
    } catch (err) {
      setProjectError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setProjectLoading(false)
    }
  }

  useEffect(() => {
    if (activeReport === "hr") {
      fetchHRData()
    } else if (activeReport === "projects") {
      fetchProjectData()
    }
  }, [activeReport])

  const getInitials = (name: string) => {
    if (!name || name === "TBD") return "?"
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const currentProject = projectData?.projects.find(p => p.plotNumber === selectedProject)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-ocean-swell" />
            Reports
          </h2>
          <p className="text-text-secondary">Mandatory reporting and analytics</p>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-3 border-b border-border-color pb-4">
        {reportTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.comingSoon && setActiveReport(tab.id)}
            disabled={tab.comingSoon}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-lg transition-all
              ${activeReport === tab.id
                ? "bg-ocean-swell/20 text-ocean-swell border border-ocean-swell/30"
                : tab.comingSoon
                  ? "bg-bg-dark text-text-secondary opacity-50 cursor-not-allowed"
                  : "bg-bg-dark text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              }
            `}
          >
            <tab.icon className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">{tab.name}</div>
              <div className="text-xs opacity-70">{tab.description}</div>
            </div>
            {tab.comingSoon && (
              <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
            )}
          </button>
        ))}
      </div>

      {/* HR Report Content */}
      {activeReport === "hr" && (
        <div className="space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button onClick={fetchHRData} variant="outline" size="sm" disabled={hrLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${hrLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {hrLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-ocean-swell" />
            </div>
          ) : hrError ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <p className="text-text-secondary">Failed to load HR data</p>
              <Button onClick={fetchHRData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : hrData ? (
            <>
              {/* Office Summary Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-ocean-swell" />
                    Headcount Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-bg-dark border-b border-border-color">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Office</th>
                          <th className="px-6 py-4 text-center text-sm font-medium text-text-secondary">Total Employees</th>
                          <th className="px-6 py-4 text-center text-sm font-medium text-text-secondary">Total On-Board</th>
                          <th className="px-6 py-4 text-center text-sm font-medium text-text-secondary">To be Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-color">
                        {hrData.officeSummaries?.map((summary, index) => (
                          <tr
                            key={summary.office}
                            className={index === 0 ? "bg-ocean-swell/10 font-semibold" : "hover:bg-bg-hover"}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {index === 0 ? (
                                  <Users className="h-4 w-4 text-ocean-swell" />
                                ) : (
                                  <MapPin className="h-4 w-4 text-text-secondary" />
                                )}
                                <span className={index === 0 ? "text-ocean-swell" : "text-text-primary"}>
                                  {summary.office}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`text-lg ${index === 0 ? "text-ocean-swell font-bold" : "text-text-primary"}`}>
                                {summary.totalEmployees}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Badge variant={index === 0 ? "type1" : "secondary"} className="min-w-[3rem]">
                                {summary.onBoard}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Badge variant={index === 0 ? "type2" : "secondary"} className="min-w-[3rem]">
                                {summary.toBeJoined}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-ocean-swell/20 p-3">
                        <Users className="h-6 w-6 text-ocean-swell" />
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">Total On-Board</p>
                        <p className="text-2xl font-bold text-text-primary">{hrData.stats.totalEmployees}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-heart/20 p-3">
                        <UserPlus className="h-6 w-6 text-heart" />
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">To Be Joined</p>
                        <p className="text-2xl font-bold text-text-primary">{hrData.stats.totalTBJ}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-sunlight/20 p-3">
                        <Building2 className="h-6 w-6 text-sunlight" />
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">Offices</p>
                        <p className="text-2xl font-bold text-text-primary">{Object.keys(hrData.stats.byOffice).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-green-500/20 p-3">
                        <Briefcase className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">Total Headcount</p>
                        <p className="text-2xl font-bold text-text-primary">{hrData.stats.totalEmployees + hrData.stats.totalTBJ}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Team/TBJ Tabs */}
              <Tabs value={hrActiveTab} onValueChange={setHrActiveTab}>
                <TabsList>
                  <TabsTrigger value="team">Current Team ({hrData.stats.totalEmployees})</TabsTrigger>
                  <TabsTrigger value="tbj">To Be Joined ({hrData.stats.totalTBJ})</TabsTrigger>
                </TabsList>

                {/* Team Tab */}
                <TabsContent value="team" className="mt-6">
                  {Object.keys(hrData.stats.byOffice).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {Object.entries(hrData.stats.byOffice).map(([office, count]) => (
                        <Badge key={office} variant="secondary" className="text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          {office}: {count}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-bg-dark border-b border-border-color">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Employee</th>
                              <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Title</th>
                              <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Status</th>
                              <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Office</th>
                              <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Reports To</th>
                              <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-color">
                            {hrData.team.map((member, index) => (
                              <tr key={index} className="hover:bg-bg-hover">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarFallback className="text-xs bg-ocean-swell/20 text-ocean-swell">
                                        {getInitials(member.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-text-primary">{member.name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-text-secondary">{member.title}</td>
                                <td className="px-6 py-4">
                                  <Badge variant="type1">{member.status}</Badge>
                                </td>
                                <td className="px-6 py-4 text-text-secondary">{member.office}</td>
                                <td className="px-6 py-4 text-text-secondary">{member.reportsTo}</td>
                                <td className="px-6 py-4 text-text-secondary text-sm">{member.remarks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TBJ Tab */}
                <TabsContent value="tbj" className="mt-6">
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-bg-dark border-b border-border-color">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Sr. No.</th>
                              <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Name</th>
                              <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Position</th>
                              <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Status</th>
                              <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Office</th>
                              <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Reports To</th>
                              <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-color">
                            {hrData.tbj.map((person, index) => (
                              <tr key={index} className="hover:bg-bg-hover">
                                <td className="px-6 py-4 text-text-secondary">{person.srNo}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarFallback className="text-xs bg-heart/20 text-heart">
                                        {getInitials(person.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-text-primary">
                                      {person.name === "TBD" ? "To Be Determined" : person.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-text-secondary">{person.title}</td>
                                <td className="px-6 py-4">
                                  <Badge variant="type2">{person.status}</Badge>
                                </td>
                                <td className="px-6 py-4 text-text-secondary">{person.office}</td>
                                <td className="px-6 py-4 text-text-secondary">{person.reportsTo}</td>
                                <td className="px-6 py-4 text-text-secondary text-sm">{person.remarks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </div>
      )}

      {/* Project Statistics Content */}
      {activeReport === "projects" && (
        <div className="space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button onClick={fetchProjectData} variant="outline" size="sm" disabled={projectLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${projectLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {projectLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-ocean-swell" />
            </div>
          ) : projectError ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <p className="text-text-secondary">Failed to load project data</p>
              <Button onClick={fetchProjectData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : projectData && projectData.projects.length > 0 ? (
            <>
              {/* Aggregated Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-ocean-swell/20 p-2.5">
                        <Building className="h-5 w-5 text-ocean-swell" />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Total Projects</p>
                        <p className="text-xl font-bold text-text-primary">{projectData.aggregated.totalProjects}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-heart/20 p-2.5">
                        <Maximize2 className="h-5 w-5 text-heart" />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Total GFA</p>
                        <p className="text-xl font-bold text-text-primary">{formatNumber(projectData.aggregated.totalGFAAchieved)} m²</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-sunlight/20 p-2.5">
                        <Home className="h-5 w-5 text-sunlight" />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Total Units</p>
                        <p className="text-xl font-bold text-text-primary">{formatNumber(projectData.aggregated.totalUnits)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-green-500/20 p-2.5">
                        <Car className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Total Parking</p>
                        <p className="text-xl font-bold text-text-primary">{formatNumber(projectData.aggregated.totalParkingProposed)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-500/20 p-2.5">
                        <ArrowUpDown className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Total Lifts</p>
                        <p className="text-xl font-bold text-text-primary">{projectData.aggregated.totalLifts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Project Selector */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <Building className="h-5 w-5 text-ocean-swell" />
                    Select Project
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {projectData.projects.map((project) => (
                      <button
                        key={project.plotNumber}
                        onClick={() => setSelectedProject(project.plotNumber)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${selectedProject === project.plotNumber
                            ? "bg-ocean-swell text-white"
                            : "bg-bg-dark text-text-secondary hover:bg-bg-hover hover:text-text-primary border border-border-color"
                          }
                        `}
                      >
                        {project.project || `Plot ${project.plotNumber}`}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Project Details */}
              {currentProject && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Area Overview Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <Maximize2 className="h-5 w-5 text-ocean-swell" />
                        Area Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-bg-dark rounded-lg p-4">
                          <p className="text-xs text-text-secondary">Plot Area</p>
                          <p className="text-xl font-bold text-text-primary">{formatNumber(currentProject.plotArea)} m²</p>
                        </div>
                        <div className="bg-bg-dark rounded-lg p-4">
                          <p className="text-xs text-text-secondary">FAR</p>
                          <p className="text-xl font-bold text-text-primary">{currentProject.far}</p>
                        </div>
                      </div>

                      {/* GFA Comparison */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">GFA Allowed vs Achieved</span>
                          <span className="font-medium text-text-primary">
                            {formatPercent(currentProject.totalGFAAllowed > 0 ? (currentProject.totalGFAAchieved / currentProject.totalGFAAllowed) * 100 : 0)}
                          </span>
                        </div>
                        <Progress
                          value={currentProject.totalGFAAllowed > 0 ? (currentProject.totalGFAAchieved / currentProject.totalGFAAllowed) * 100 : 0}
                          className="h-3"
                        />
                        <div className="flex justify-between text-xs text-text-secondary">
                          <span>Achieved: {formatNumber(currentProject.totalGFAAchieved)} m²</span>
                          <span>Allowed: {formatNumber(currentProject.totalGFAAllowed)} m²</span>
                        </div>
                      </div>

                      {/* Residential vs Commercial */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-text-secondary mb-2">Residential GFA</p>
                          <div className="flex items-end gap-2">
                            <span className="text-lg font-bold text-ocean-swell">{formatNumber(currentProject.residentialGFAAchieved)}</span>
                            <span className="text-xs text-text-secondary">/ {formatNumber(currentProject.residentialGFAAllowed)} m²</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary mb-2">Commercial GFA</p>
                          <div className="flex items-end gap-2">
                            <span className="text-lg font-bold text-heart">{formatNumber(currentProject.commercialGFAAchieved)}</span>
                            <span className="text-xs text-text-secondary">/ {formatNumber(currentProject.commercialGFAAllowed)} m²</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sellable Breakdown Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <Home className="h-5 w-5 text-sunlight" />
                        Sellable Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-bg-dark rounded-lg p-4 text-center">
                          <p className="text-xs text-text-secondary">Suite</p>
                          <p className="text-lg font-bold text-text-primary">{formatNumber(currentProject.suiteSellable)}</p>
                          <p className="text-xs text-text-secondary">m²</p>
                        </div>
                        <div className="bg-bg-dark rounded-lg p-4 text-center">
                          <p className="text-xs text-text-secondary">Balcony</p>
                          <p className="text-lg font-bold text-text-primary">{formatNumber(currentProject.balconySellable)}</p>
                          <p className="text-xs text-text-secondary">m²</p>
                        </div>
                        <div className="bg-ocean-swell/10 rounded-lg p-4 text-center border border-ocean-swell/30">
                          <p className="text-xs text-text-secondary">Total</p>
                          <p className="text-lg font-bold text-ocean-swell">{formatNumber(currentProject.totalSellable)}</p>
                          <p className="text-xs text-text-secondary">m²</p>
                        </div>
                      </div>

                      {/* Efficiency */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">Sellable Efficiency</span>
                          <span className="font-medium text-green-500">{formatPercent(currentProject.sellableEfficiency)}</span>
                        </div>
                        <Progress value={currentProject.sellableEfficiency} className="h-3" />
                      </div>

                      {/* Amenities */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-bg-dark rounded-lg p-4">
                          <p className="text-xs text-text-secondary">Amenities</p>
                          <p className="text-xl font-bold text-text-primary">{formatNumber(currentProject.amenities)} m²</p>
                        </div>
                        <div className="bg-bg-dark rounded-lg p-4">
                          <p className="text-xs text-text-secondary">Amenity Efficiency</p>
                          <p className="text-xl font-bold text-text-primary">{formatPercent(currentProject.efficiencyAmenities)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Unit Mix Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-heart" />
                        Unit Mix
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-5 gap-3">
                        <div className="bg-ocean-swell/10 rounded-lg p-4 text-center border border-ocean-swell/30">
                          <p className="text-xs text-text-secondary">1 BD</p>
                          <p className="text-2xl font-bold text-ocean-swell">{currentProject.units1BD}</p>
                        </div>
                        <div className="bg-heart/10 rounded-lg p-4 text-center border border-heart/30">
                          <p className="text-xs text-text-secondary">2 BD</p>
                          <p className="text-2xl font-bold text-heart">{currentProject.units2BD}</p>
                        </div>
                        <div className="bg-sunlight/10 rounded-lg p-4 text-center border border-sunlight/30">
                          <p className="text-xs text-text-secondary">3 BD</p>
                          <p className="text-2xl font-bold text-sunlight">{currentProject.units3BD}</p>
                        </div>
                        <div className="bg-green-500/10 rounded-lg p-4 text-center border border-green-500/30">
                          <p className="text-xs text-text-secondary">4 BD</p>
                          <p className="text-2xl font-bold text-green-500">{currentProject.units4BD}</p>
                        </div>
                        <div className="bg-purple-500/10 rounded-lg p-4 text-center border border-purple-500/30">
                          <p className="text-xs text-text-secondary">Total</p>
                          <p className="text-2xl font-bold text-purple-500">{currentProject.totalUnits}</p>
                        </div>
                      </div>

                      {/* Unit Mix Bar */}
                      {currentProject.totalUnits > 0 && (
                        <div className="mt-4">
                          <div className="flex h-6 rounded-full overflow-hidden">
                            {currentProject.units1BD > 0 && (
                              <div
                                className="bg-ocean-swell"
                                style={{ width: `${(currentProject.units1BD / currentProject.totalUnits) * 100}%` }}
                              />
                            )}
                            {currentProject.units2BD > 0 && (
                              <div
                                className="bg-heart"
                                style={{ width: `${(currentProject.units2BD / currentProject.totalUnits) * 100}%` }}
                              />
                            )}
                            {currentProject.units3BD > 0 && (
                              <div
                                className="bg-sunlight"
                                style={{ width: `${(currentProject.units3BD / currentProject.totalUnits) * 100}%` }}
                              />
                            )}
                            {currentProject.units4BD > 0 && (
                              <div
                                className="bg-green-500"
                                style={{ width: `${(currentProject.units4BD / currentProject.totalUnits) * 100}%` }}
                              />
                            )}
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-text-secondary">
                            <span>1BD: {formatPercent((currentProject.units1BD / currentProject.totalUnits) * 100)}</span>
                            <span>2BD: {formatPercent((currentProject.units2BD / currentProject.totalUnits) * 100)}</span>
                            <span>3BD: {formatPercent((currentProject.units3BD / currentProject.totalUnits) * 100)}</span>
                            <span>4BD: {formatPercent((currentProject.units4BD / currentProject.totalUnits) * 100)}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Parking & Lifts Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <Car className="h-5 w-5 text-green-500" />
                        Parking & Lifts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Parking */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-bg-dark rounded-lg p-4 text-center">
                          <p className="text-xs text-text-secondary">Required</p>
                          <p className="text-xl font-bold text-text-primary">{currentProject.parkingRequired}</p>
                        </div>
                        <div className="bg-bg-dark rounded-lg p-4 text-center">
                          <p className="text-xs text-text-secondary">Proposed</p>
                          <p className="text-xl font-bold text-text-primary">{currentProject.parkingProposed}</p>
                        </div>
                        <div className="bg-green-500/10 rounded-lg p-4 text-center border border-green-500/30">
                          <p className="text-xs text-text-secondary">Efficiency</p>
                          <p className="text-xl font-bold text-green-500">{formatPercent(currentProject.parkingEfficiency)}</p>
                        </div>
                      </div>

                      {/* Lifts */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-bg-dark rounded-lg p-4 text-center">
                          <p className="text-xs text-text-secondary">Passenger</p>
                          <p className="text-xl font-bold text-text-primary">{currentProject.passengerLifts}</p>
                        </div>
                        <div className="bg-bg-dark rounded-lg p-4 text-center">
                          <p className="text-xs text-text-secondary">Service</p>
                          <p className="text-xl font-bold text-text-primary">{currentProject.serviceLifts}</p>
                        </div>
                        <div className="bg-purple-500/10 rounded-lg p-4 text-center border border-purple-500/30">
                          <p className="text-xs text-text-secondary">Total Lifts</p>
                          <p className="text-xl font-bold text-purple-500">{currentProject.totalLifts}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Building Dimensions Card - Full Width */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <Ruler className="h-5 w-5 text-purple-500" />
                        Building Dimensions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-bg-dark rounded-lg p-4 text-center">
                          <p className="text-xs text-text-secondary">BUA</p>
                          <p className="text-xl font-bold text-text-primary">{formatNumber(currentProject.bua)}</p>
                          <p className="text-xs text-text-secondary">m²</p>
                        </div>
                        <div className="bg-bg-dark rounded-lg p-4 text-center">
                          <p className="text-xs text-text-secondary">GFA/BUA</p>
                          <p className="text-xl font-bold text-text-primary">{currentProject.gfaBuaRatio.toFixed(2)}</p>
                        </div>
                        <div className="bg-bg-dark rounded-lg p-4 text-center">
                          <p className="text-xs text-text-secondary">DMD</p>
                          <p className="text-xl font-bold text-text-primary">{currentProject.dmd}</p>
                          <p className="text-xs text-text-secondary">m</p>
                        </div>
                        <div className="bg-bg-dark rounded-lg p-4 text-center">
                          <p className="text-xs text-text-secondary">OLS</p>
                          <p className="text-xl font-bold text-text-primary">{currentProject.ols}</p>
                          <p className="text-xs text-text-secondary">m</p>
                        </div>
                        <div className="bg-ocean-swell/10 rounded-lg p-4 text-center border border-ocean-swell/30">
                          <p className="text-xs text-text-secondary">Height</p>
                          <p className="text-xl font-bold text-ocean-swell">{currentProject.height}</p>
                          <p className="text-xs text-text-secondary">m</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="rounded-full bg-bg-hover p-6">
                  <Building className="h-12 w-12 text-text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary">No Project Data</h3>
                <p className="text-text-secondary max-w-md">
                  Create a &quot;Project Stats&quot; tab in your Google Sheet with the required columns to see project statistics here.
                </p>
                <div className="text-left bg-bg-dark rounded-lg p-4 text-sm text-text-secondary max-w-lg">
                  <p className="font-medium text-text-primary mb-2">Required columns:</p>
                  <p>Plot #, Project, Plot Area, FAR, Configuration, GFA metrics, Sellable areas, Unit counts (1BD-4BD), Parking, Lifts, Building dimensions (BUA, Height, etc.)</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Coming Soon Placeholder for finance */}
      {activeReport === "finance" && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-bg-hover p-6">
              <DollarSign className="h-12 w-12 text-text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary">Coming Soon</h3>
            <p className="text-text-secondary max-w-md">
              Financial reports are currently under development. Check back soon for updates.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
