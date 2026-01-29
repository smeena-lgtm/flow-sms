"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, Building2, RefreshCw, MapPin, Briefcase, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TeamMember {
  srNo: string
  name: string
  title: string
  status: string
  office: string
  reportsTo: string
  remarks: string
}

interface TBJCandidate {
  srNo: string
  name: string
  position: string
  stage: string
  office: string
  expectedJoinDate: string
  source: string
  remarks: string
}

interface OfficeSummary {
  office: string
  totalEmployees: number
  onBoard: number
  toBeJoined: number
}

interface HRData {
  team: TeamMember[]
  tbj: TBJCandidate[]
  pipeline: { stage: string; candidates: TBJCandidate[] }[]
  stats: {
    totalEmployees: number
    totalTBJ: number
    byOffice: Record<string, number>
    byStage: Record<string, number>
  }
  stages: string[]
  officeSummaries: OfficeSummary[]
}

const stageColors: Record<string, string> = {
  "Lead": "bg-text-secondary",
  "Screening": "bg-sunlight",
  "Interview": "bg-ocean-swell",
  "Offer": "bg-heart",
  "Onboarding": "bg-green-500"
}

const stageBadgeColors: Record<string, string> = {
  "Lead": "secondary",
  "Screening": "type3",
  "Interview": "type1",
  "Offer": "type2",
  "Onboarding": "default"
}

export default function HRReportsPage() {
  const [data, setData] = useState<HRData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("team")

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/hr")
      if (!response.ok) throw new Error("Failed to fetch HR data")
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-ocean-swell" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-text-secondary">Failed to load HR data</p>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary">HR Reports</h2>
          <p className="text-text-secondary">Team overview and hiring pipeline</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

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
                {data.officeSummaries?.map((summary, index) => (
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
                <p className="text-2xl font-bold text-text-primary">{data.stats.totalEmployees}</p>
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
                <p className="text-sm text-text-secondary">TBJ Pipeline</p>
                <p className="text-2xl font-bold text-text-primary">{data.stats.totalTBJ}</p>
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
                <p className="text-2xl font-bold text-text-primary">{Object.keys(data.stats.byOffice).length}</p>
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
                <p className="text-sm text-text-secondary">In Onboarding</p>
                <p className="text-2xl font-bold text-text-primary">{data.stats.byStage["Onboarding"] || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="team">Current Team ({data.stats.totalEmployees})</TabsTrigger>
          <TabsTrigger value="tbj">TBJ Pipeline ({data.stats.totalTBJ})</TabsTrigger>
        </TabsList>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-6">
          {/* Office Filter Summary */}
          {Object.keys(data.stats.byOffice).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(data.stats.byOffice).map(([office, count]) => (
                <Badge key={office} variant="secondary" className="text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  {office}: {count}
                </Badge>
              ))}
            </div>
          )}

          {/* Team Table */}
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
                    {data.team.map((member, index) => (
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
                          <Badge variant={member.status.toLowerCase() === "on-board" ? "type1" : "secondary"}>
                            {member.status}
                          </Badge>
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

        {/* TBJ Pipeline Tab */}
        <TabsContent value="tbj" className="mt-6">
          {/* Pipeline Kanban View */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {data.pipeline.map(({ stage, candidates }) => (
              <div key={stage} className="bg-bg-dark rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${stageColors[stage]}`} />
                    <h3 className="font-medium text-text-primary">{stage}</h3>
                  </div>
                  <Badge variant="secondary">{candidates.length}</Badge>
                </div>

                <div className="space-y-3">
                  {candidates.length === 0 ? (
                    <p className="text-sm text-text-secondary text-center py-4">No candidates</p>
                  ) : (
                    candidates.map((candidate, index) => (
                      <Card key={index} className="hover:border-ocean-swell/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-heart/20 text-heart">
                                {getInitials(candidate.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-text-primary text-sm truncate">
                                {candidate.name}
                              </p>
                              <p className="text-xs text-text-secondary truncate">
                                {candidate.position}
                              </p>
                            </div>
                          </div>

                          {(candidate.office || candidate.expectedJoinDate) && (
                            <div className="mt-3 space-y-1">
                              {candidate.office && (
                                <div className="flex items-center gap-1 text-xs text-text-secondary">
                                  <MapPin className="h-3 w-3" />
                                  {candidate.office}
                                </div>
                              )}
                              {candidate.expectedJoinDate && (
                                <div className="flex items-center gap-1 text-xs text-text-secondary">
                                  <Calendar className="h-3 w-3" />
                                  {candidate.expectedJoinDate}
                                </div>
                              )}
                            </div>
                          )}

                          {candidate.source && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              {candidate.source}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
