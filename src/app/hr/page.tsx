"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, Building2, MapPin } from "lucide-react"

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
  }
  officeSummaries: OfficeSummary[]
}

const officeColors: Record<string, string> = {
  MIA: "bg-accent-cyan",
  KSA: "bg-accent-yellow",
  DXB: "bg-accent-purple",
}

const officeNames: Record<string, string> = {
  MIA: "Miami",
  KSA: "Riyadh",
  DXB: "Dubai",
}

export default function HRPage() {
  const [data, setData] = useState<HRData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"team" | "tbj">("team")

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch("/api/hr")
        if (!res.ok) throw new Error("Failed to fetch")
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError("Failed to load HR data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const employees = activeTab === "team" ? data?.team : data?.tbj

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">HR</h1>
          <p className="text-sm text-text-muted mt-1">
            Team members across all offices
          </p>
        </div>
      </div>

      {/* Office Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {data.officeSummaries.map((summary) => (
            <div
              key={summary.office}
              className="rounded-xl bg-bg-card border border-border-color p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-text-muted" />
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  {summary.office}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">On-Board</span>
                  <span className="text-lg font-bold text-text-primary">
                    {summary.onBoard}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">TBJ</span>
                  <span className="text-lg font-bold text-accent-yellow">
                    {summary.toBeJoined}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "team"
              ? "bg-accent-blue text-white"
              : "bg-bg-card text-text-secondary hover:bg-bg-card-hover"
          }`}
        >
          <Users className="h-4 w-4" />
          On-Board
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === "team" ? "bg-white/20" : "bg-bg-hover"
            }`}
          >
            {data?.stats.totalEmployees || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("tbj")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "tbj"
              ? "bg-accent-yellow text-white"
              : "bg-bg-card text-text-secondary hover:bg-bg-card-hover"
          }`}
        >
          <UserPlus className="h-4 w-4" />
          To Be Joined
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === "tbj" ? "bg-white/20" : "bg-bg-hover"
            }`}
          >
            {data?.stats.totalTBJ || 0}
          </span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-20 text-accent-red">{error}</div>
      )}

      {/* Employee Table */}
      {!loading && !error && employees && (
        <div className="rounded-2xl bg-bg-card border border-border-color overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-surface">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Employee
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Title
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Office
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Reports To
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {employees.map((employee, index) => (
                  <tr
                    key={employee.srNo || index}
                    className="hover:bg-bg-card-hover transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                            officeColors[employee.office] || "bg-accent-blue"
                          }`}
                        >
                          {getInitials(employee.name)}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">
                            {employee.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            #{employee.srNo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-text-secondary">
                        {employee.title || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            employee.office === "MIA"
                              ? "bg-accent-cyan/15 text-accent-cyan"
                              : employee.office === "KSA"
                              ? "bg-accent-yellow/15 text-accent-yellow"
                              : "bg-accent-purple/15 text-accent-purple"
                          }`}
                        >
                          {employee.office}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-text-secondary">
                        {employee.reportsTo || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {employees.length === 0 && (
            <div className="text-center py-12 text-text-muted">
              No employees found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
