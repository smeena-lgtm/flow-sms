import {
  FolderKanban,
  Users,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowUpRight,
} from "lucide-react"
import Link from "next/link"
import { StatCard } from "@/components/dashboard/stat-card"
import { DonutChart } from "@/components/charts/donut-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { LineChart } from "@/components/charts/line-chart"
import { prisma } from "@/lib/db"

async function getDashboardData() {
  const [
    activeProjects,
    totalMembers,
    pendingTasks,
    completedThisMonth,
    recentProjects,
    recentActivities,
  ] = await Promise.all([
    prisma.project.count({ where: { status: "active" } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.task.count({ where: { status: { in: ["todo", "in_progress"] } } }),
    prisma.task.count({
      where: {
        status: "completed",
        completedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.project.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        client: true,
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    }),
    prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        project: { select: { name: true } },
      },
    }),
  ])

  return {
    stats: { activeProjects, totalMembers, pendingTasks, completedThisMonth },
    recentProjects,
    recentActivities,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  // Sample data for charts
  const monthlyData = [
    { label: "Jan", value: 120 },
    { label: "Feb", value: 180 },
    { label: "Mar", value: 150 },
    { label: "Apr", value: 220 },
    { label: "May", value: 280 },
    { label: "Jun", value: 250 },
    { label: "Jul", value: 320 },
    { label: "Aug", value: 290 },
    { label: "Sep", value: 380 },
    { label: "Oct", value: 420 },
    { label: "Nov", value: 350 },
    { label: "Dec", value: 400 },
  ]

  const activityData = [
    { label: "W1", value: 45 },
    { label: "W2", value: 62 },
    { label: "W3", value: 58 },
    { label: "W4", value: 71 },
    { label: "W5", value: 85 },
    { label: "W6", value: 92 },
  ]

  const projectStatusData = [
    { label: "Active", value: data.stats.activeProjects || 8, color: "var(--accent-green)" },
    { label: "On Hold", value: 3, color: "var(--accent-yellow)" },
    { label: "Completed", value: 12, color: "var(--accent-blue)" },
  ]

  const recentOrders = [
    { name: "Olaya Tower", location: "Riyadh", date: "22.01.2026", status: "Active", value: "$920K" },
    { name: "Brickell Heights", location: "Miami", date: "24.01.2026", status: "Planning", value: "$452K" },
    { name: "Aventura Bay", location: "Miami", date: "18.01.2026", status: "On Hold", value: "$1,200K" },
    { name: "KSA Villa", location: "Jeddah", date: "03.01.2026", status: "Active", value: "$1,235K" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-sm text-text-muted mt-1">
            01.01.2026 - 31.01.2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-text-secondary bg-bg-card border border-border-color rounded-xl hover:bg-bg-card-hover transition-colors">
            <Calendar className="h-4 w-4 inline-block mr-2" />
            This Month
          </button>
        </div>
      </div>

      {/* Stats Grid - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <StatCard
            title="Active Projects"
            value={data.stats.activeProjects}
            icon={FolderKanban}
            trend={{ value: 8.2, isPositive: true }}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <StatCard
            title="Approved"
            value={36}
            icon={CheckCircle2}
            trend={{ value: 3.4, isPositive: true }}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <StatCard
            title="Team Members"
            value={data.stats.totalMembers || 46}
            icon={Users}
            subtitle="across 3 offices"
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <StatCard
            title="Tasks Completed"
            value={data.stats.completedThisMonth || 1201}
            icon={CheckCircle2}
            subtitle="this month"
          />
        </div>
      </div>

      {/* Stats Grid - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="rounded-2xl bg-bg-card border border-border-color p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-text-muted font-medium">Month Total</p>
              <DollarSign className="h-5 w-5 text-accent-yellow" />
            </div>
            <p className="text-3xl font-bold text-text-primary">25,410</p>
            <p className="text-xs text-accent-green mt-1">↑ 0.2% since last month</p>
          </div>
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.35s" }}>
          <div className="rounded-2xl bg-bg-card border border-border-color p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-text-muted font-medium">Revenue</p>
              <TrendingUp className="h-5 w-5 text-accent-blue" />
            </div>
            <p className="text-3xl font-bold text-text-primary">1,352</p>
            <p className="text-xs text-accent-red mt-1">↓ 1.2% since last month</p>
          </div>
        </div>
        <div className="animate-fade-in lg:col-span-2" style={{ animationDelay: "0.4s" }}>
          <div className="rounded-2xl bg-bg-card border border-border-color p-5 h-full">
            <DonutChart data={projectStatusData} size={100} strokeWidth={16} />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Bar Chart */}
        <div className="animate-fade-in" style={{ animationDelay: "0.45s" }}>
          <div className="rounded-2xl bg-bg-card border border-border-color p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Project Progress</h3>
              <select className="text-sm text-text-muted bg-bg-surface border border-border-color rounded-lg px-3 py-1.5">
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>
            <BarChart data={monthlyData} height={180} color="var(--chart-1)" />
          </div>
        </div>

        {/* Finance Cards */}
        <div className="animate-fade-in space-y-4" style={{ animationDelay: "0.5s" }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-bg-card border border-border-color p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-xl bg-accent-blue/15 p-2">
                  <DollarSign className="h-5 w-5 text-accent-blue" />
                </div>
                <span className="text-xs text-accent-green bg-accent-green/15 px-2 py-0.5 rounded-full">+15%</span>
              </div>
              <p className="text-sm text-text-muted">Paid Invoices</p>
              <p className="text-2xl font-bold text-text-primary">$30,256.23</p>
              <p className="text-xs text-text-muted mt-1">Current Financial Year</p>
            </div>
            <div className="rounded-2xl bg-bg-card border border-border-color p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-xl bg-accent-green/15 p-2">
                  <TrendingUp className="h-5 w-5 text-accent-green" />
                </div>
                <span className="text-xs text-accent-green bg-accent-green/15 px-2 py-0.5 rounded-full">+59%</span>
              </div>
              <p className="text-sm text-text-muted">Funds Received</p>
              <p className="text-2xl font-bold text-text-primary">$150,256.23</p>
              <p className="text-xs text-text-muted mt-1">Current Financial Year</p>
            </div>
          </div>

          {/* Activity Line Chart */}
          <div className="rounded-2xl bg-bg-card border border-border-color p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary">Overall User Activity</h3>
              <select className="text-xs text-text-muted bg-bg-surface border border-border-color rounded-lg px-2 py-1">
                <option>2026</option>
              </select>
            </div>
            <LineChart data={activityData} height={120} color="var(--accent-blue)" />
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="animate-fade-in" style={{ animationDelay: "0.55s" }}>
        <div className="rounded-2xl bg-bg-card border border-border-color overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-border-color">
            <h3 className="text-lg font-semibold text-text-primary">Recent Projects</h3>
            <Link
              href="/projects"
              className="flex items-center gap-1 text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
            >
              View all
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-surface">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                    Project
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                    Location
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {recentOrders.map((order, index) => (
                  <tr
                    key={index}
                    className="hover:bg-bg-card-hover transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-xs font-semibold">
                          {order.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-text-primary">
                          {order.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {order.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {order.date}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.status === "Active"
                            ? "bg-accent-green/15 text-accent-green"
                            : order.status === "Planning"
                            ? "bg-accent-blue/15 text-accent-blue"
                            : "bg-accent-yellow/15 text-accent-yellow"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-text-primary">
                      {order.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
