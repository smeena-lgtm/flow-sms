"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, Building2, RefreshCw, MapPin, Briefcase } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Employee {
  srNo: string
  name: string
  title: string
  status: string  // "On-Board" or "TBJ"
  office: string  // "MIA", "KSA", "DXB"
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
    if (!name || name === "TBD") return "?"
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
                <p className="text-sm text-text-secondary">To Be Joined</p>
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
                <p className="text-sm text-text-secondary">Total Headcount</p>
                <p className="text-2xl font-bold text-text-primary">{data.stats.totalEmployees + data.stats.totalTBJ}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="team">Current Team ({data.stats.totalEmployees})</TabsTrigger>
          <TabsTrigger value="tbj">To Be Joined ({data.stats.totalTBJ})</TabsTrigger>
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
                          <Badge variant="type1">
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

        {/* TBJ Tab */}
        <TabsContent value="tbj" className="mt-6">
          {/* TBJ Table */}
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
                    {data.tbj.map((person, index) => (
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
                          <Badge variant="type2">
                            {person.status}
                          </Badge>
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
    </div>
  )
}
