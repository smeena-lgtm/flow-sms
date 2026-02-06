import Foundation
import SwiftUI

// MARK: - Building Status (PIT/POT/PHT)

enum BuildingStatus: String, Codable, CaseIterable {
    case PIT
    case POT
    case PHT
    case unknown = ""

    var displayName: String {
        switch self {
        case .PIT: return "PIT - Initiation"
        case .POT: return "POT - Onboard"
        case .PHT: return "PHT - Handover"
        case .unknown: return "Unknown"
        }
    }

    var shortName: String {
        switch self {
        case .PIT: return "PIT"
        case .POT: return "POT"
        case .PHT: return "PHT"
        case .unknown: return "-"
        }
    }

    var color: Color {
        switch self {
        case .PIT: return .sunlight
        case .POT: return .green
        case .PHT: return .purple
        case .unknown: return .textSecondary
        }
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        let rawValue = try container.decode(String.self)
        self = BuildingStatus(rawValue: rawValue) ?? .unknown
    }
}

// MARK: - Building Location

enum BuildingLocation: String, Codable {
    case MIA
    case RYD
    case unknown = ""

    var displayName: String {
        switch self {
        case .MIA: return "Miami"
        case .RYD: return "Riyadh"
        case .unknown: return "-"
        }
    }

    var color: Color {
        switch self {
        case .MIA: return .cyan
        case .RYD: return .sunlight
        case .unknown: return .textSecondary
        }
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        let rawValue = try container.decode(String.self)
        self = BuildingLocation(rawValue: rawValue) ?? .unknown
    }
}

// MARK: - Building Info Models

struct BuildingIdentity: Codable {
    let plotNo: String
    let marketingName: String
    let designManager: String
    let location: String
    let status: String
    let numberOfBuildings: Double
    let plotAreaFt2: Double
    let far: Double

    var locationEnum: BuildingLocation {
        BuildingLocation(rawValue: location) ?? .unknown
    }

    var statusEnum: BuildingStatus {
        BuildingStatus(rawValue: status) ?? .unknown
    }

    var displayName: String {
        marketingName.isEmpty ? plotNo : marketingName
    }

    var projectId: String {
        plotNo.isEmpty ? marketingName : plotNo
    }
}

struct BuildingGFA: Codable {
    let resProposedGfaFt2: Double
    let resProposedGfaPct: Double
    let comProposedGfaFt2: Double
    let comProposedGfaPct: Double
    let totalProposedGfaFt2: Double
}

struct BuildingSellable: Codable {
    let suiteSellableFt2: Double?
    let suiteSelableFt2: Double?  // API has typo
    let suiteSellableRatio: Double
    let balconySaFt2: Double
    let leasableFt2: Double?
    let balconyRatio: Double
    let totalSellableFt2: Double
    let nonSellableFt2: Double
    let nonSellableRatio: Double
    let efficiencySaGfa: Double

    var actualSuiteSellable: Double {
        suiteSellableFt2 ?? suiteSelableFt2 ?? 0
    }
}

struct BuildingAMI: Codable {
    let areaFt2: Double
    let pct: Double
}

struct BuildingUnitCounts: Codable {
    let studio: Double
    let oneBed: Double
    let twoBed: Double
    let threeBed: Double
    let fourBed: Double
    let liner: Double
    let total: Double
}

struct BuildingUnitMixPct: Codable {
    let studio: Double
    let oneBed: Double
    let twoBed: Double
    let threeBed: Double
    let fourBed: Double
    let liner: Double
}

struct BuildingBalconyPct: Codable {
    let studio: Double
    let oneBed: Double
    let twoBed: Double
    let threeBed: Double
    let fourBed: Double
    let liner: Double
}

struct RentalCondoSplit: Codable {
    let rental: Double
    let condo: Double
}

struct BuildingRentalCondoSplit: Codable {
    let studio: RentalCondoSplit
    let oneBed: RentalCondoSplit
    let twoBed: RentalCondoSplit
    let threeBed: RentalCondoSplit
    let fourBed: RentalCondoSplit
    let liner: RentalCondoSplit
}

struct BuildingRetailGrid: Codable {
    let gridFt: Double
    let retailSmallQty: Double
    let retailCornerQty: Double
    let retailRegularQty: Double
}

struct BuildingMEP: Codable {
    let electricalLoadKw: Double
    let coolingLoadTr: Double
    let waterDemandFt3Day: Double
    let sewerageDemandFt3Day: Double
    let gasDemandFt3Hr: Double
}

struct BuildingParkingFacade: Codable {
    let parkingRequired: Double
    let parkingProposed: Double
    let parkingEfficiencyFt2Car: Double
    let additionalParking: Double
    let evParkingLots: Double
    let facadeGlazingPct: Double
    let facadeSpandrelPct: Double
    let facadeSolidPct: Double
}

struct BuildingLiftsHeight: Codable {
    let passengerCount: Double
    let passengerCapacity: Double
    let serviceCount: Double
    let serviceCapacity: Double
    let totalLifts: Double
    let heightFt: Double
    let buildingConfiguration: String
}

struct BuildingBUA: Codable {
    let buaFt2: Double
    let gfaOverBua: Double
}

struct BuildingInfo: Codable, Identifiable {
    let identity: BuildingIdentity
    let gfa: BuildingGFA
    let residentialSellable: BuildingSellable
    let commercialSellable: BuildingSellable
    let totalSellable: BuildingSellable
    let ami: BuildingAMI
    let unitCounts: BuildingUnitCounts
    let unitMixPct: BuildingUnitMixPct
    let balconyPct: BuildingBalconyPct
    let rentalCondoSplit: BuildingRentalCondoSplit
    let retailGrid: BuildingRetailGrid
    let mep: BuildingMEP
    let parkingFacade: BuildingParkingFacade
    let liftsHeight: BuildingLiftsHeight
    let bua: BuildingBUA

    var id: String { identity.projectId }
}

struct BuildingInfoStats: Codable {
    let totalBuildings: Int
    let totalUnits: Double
    let totalGfaFt2: Double
    let totalSellableFt2: Double
    let avgEfficiency: Double
    let avgFar: Double
    let totalParking: Double
    let byDesignManager: [String: Int]
    let byLocation: ByLocation
    let byStatus: ByStatus

    struct ByLocation: Codable {
        let miami: Int
        let riyadh: Int
    }

    struct ByStatus: Codable {
        let pit: Int
        let pot: Int
        let pht: Int
    }
}

struct BuildingInfoGrouped: Codable {
    let pit: [BuildingInfo]
    let pot: [BuildingInfo]
    let pht: [BuildingInfo]
}

struct BuildingInfoResponse: Codable {
    let buildings: [BuildingInfo]
    let grouped: BuildingInfoGrouped
    let stats: BuildingInfoStats
    let lastUpdated: String
}

// MARK: - Legacy Project Types & Status (kept for compatibility)

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
