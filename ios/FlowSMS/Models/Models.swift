import Foundation

// MARK: - Project Types & Status

enum ProjectType: String, Codable, CaseIterable {
    case architecture
    case interior
    case engineering
    case mixed

    var displayName: String {
        rawValue.capitalized
    }

    var color: String {
        switch self {
        case .architecture: return "oceanSwell"
        case .interior: return "heart"
        case .engineering: return "sunlight"
        case .mixed: return "olive"
        }
    }
}

enum ProjectStatus: String, Codable, CaseIterable {
    case planning
    case active
    case on_hold
    case completed
    case archived

    var displayName: String {
        rawValue.replacingOccurrences(of: "_", with: " ").capitalized
    }
}

// MARK: - Team Member (used in project.team array)

struct TeamMember: Codable, Identifiable {
    let id: String
    let name: String
    let role: String?
    let avatar: String?
}

// MARK: - Dashboard Project (client is a string)

struct DashboardProject: Codable, Identifiable {
    let id: String
    let name: String
    let client: String  // API returns client name as string
    let type: ProjectType
    let status: ProjectStatus
    let progress: Int
    let location: String?
    let startDate: String?
    let endDate: String?
    let team: [TeamMember]
}

// MARK: - Full Project (from /api/projects)

struct Project: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let client: String  // API returns client name as string
    let clientId: String?
    let type: ProjectType
    let status: ProjectStatus
    let progress: Int
    let location: String?
    let startDate: String?
    let endDate: String?
    let budget: String?
    let team: [TeamMember]
    let counts: ProjectCounts?
}

struct ProjectCounts: Codable {
    let tasks: Int
    let documents: Int
    let milestones: Int
}

// MARK: - Milestone Models

enum MilestoneStatus: String, Codable {
    case pending
    case in_progress
    case completed
    case overdue

    var displayName: String {
        rawValue.replacingOccurrences(of: "_", with: " ").capitalized
    }
}

struct DashboardMilestone: Codable, Identifiable {
    let id: String
    let name: String
    let project: String  // Dashboard returns project name as string
    let dueDate: String
    let status: MilestoneStatus
}

// MARK: - Activity Models

struct DashboardActivity: Codable, Identifiable {
    let id: String
    let user: String  // Dashboard returns user name as string
    let action: String
    let target: String
    let time: String

    var formattedAction: String {
        action.replacingOccurrences(of: "_", with: " ")
    }
}

// MARK: - Dashboard Response

struct DashboardStats: Codable {
    let activeProjects: Int
    let totalMembers: Int
    let pendingTasks: Int
    let completedThisMonth: Int
}

struct DashboardResponse: Codable {
    let stats: DashboardStats
    let recentProjects: [DashboardProject]
    let upcomingMilestones: [DashboardMilestone]
    let recentActivities: [DashboardActivity]
}
