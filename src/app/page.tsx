import { FolderKanban, Users, Clock, CheckCircle2 } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ProjectsTable } from "@/components/dashboard/projects-table"
import { MilestoneOverview } from "@/components/dashboard/milestone-overview"
import { ActivityFeed } from "@/components/dashboard/activity-feed"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <StatCard
            title="Active Projects"
            value={12}
            icon={FolderKanban}
            trend={{ value: 8, isPositive: true }}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <StatCard
            title="Team Members"
            value={24}
            icon={Users}
            trend={{ value: 4, isPositive: true }}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <StatCard
            title="Pending Tasks"
            value={47}
            icon={Clock}
            trend={{ value: 12, isPositive: false }}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <StatCard
            title="Completed This Month"
            value={8}
            icon={CheckCircle2}
            trend={{ value: 25, isPositive: true }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Projects Table - 2/3 width */}
        <div className="xl:col-span-2 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <ProjectsTable />
        </div>

        {/* Milestones - 1/3 width */}
        <div className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <MilestoneOverview />
        </div>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <div className="xl:col-span-2 animate-fade-in" style={{ animationDelay: "0.7s" }}>
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
