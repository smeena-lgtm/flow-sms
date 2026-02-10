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
    var plotNo: String = ""
    var marketingName: String = ""
    var designManager: String = ""
    var location: String = ""
    var status: String = ""
    var numberOfBuildings: Double = 0
    var plotAreaFt2: Double = 0
    var far: Double = 0

    init() {}

    var locationEnum: BuildingLocation {
        BuildingLocation(rawValue: location) ?? .unknown
    }

    var statusEnum: BuildingStatus {
        BuildingStatus(rawValue: status) ?? .unknown
    }

    var displayName: String {
        marketingName.isEmpty ? (plotNo.isEmpty ? "Unknown" : plotNo) : marketingName
    }

    var projectId: String {
        plotNo.isEmpty ? marketingName : plotNo
    }
}

struct BuildingGFA: Codable {
    var resProposedGfaFt2: Double = 0
    var resProposedGfaPct: Double = 0
    var comProposedGfaFt2: Double = 0
    var comProposedGfaPct: Double = 0
    var totalProposedGfaFt2: Double = 0
    init() {}
}

struct BuildingSellable: Codable {
    var suiteSellableFt2: Double?
    var suiteSelableFt2: Double?  // API has typo for residential
    var suiteSellableRatio: Double = 0
    var balconySaFt2: Double = 0
    var leasableFt2: Double?
    var balconyRatio: Double = 0
    var totalSellableFt2: Double = 0
    var nonSellableFt2: Double = 0
    var nonSellableRatio: Double = 0
    var efficiencySaGfa: Double = 0

    var actualSuiteSellable: Double {
        suiteSellableFt2 ?? suiteSelableFt2 ?? 0
    }

    // Default initializer for use in BuildingInfo defaults
    init() {
        suiteSellableFt2 = nil
        suiteSelableFt2 = nil
        suiteSellableRatio = 0
        balconySaFt2 = 0
        leasableFt2 = nil
        balconyRatio = 0
        totalSellableFt2 = 0
        nonSellableFt2 = 0
        nonSellableRatio = 0
        efficiencySaGfa = 0
    }

    // Custom decoder to handle missing keys gracefully
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        suiteSellableFt2 = try container.decodeIfPresent(Double.self, forKey: .suiteSellableFt2)
        suiteSelableFt2 = try container.decodeIfPresent(Double.self, forKey: .suiteSelableFt2)
        suiteSellableRatio = try container.decodeIfPresent(Double.self, forKey: .suiteSellableRatio) ?? 0
        balconySaFt2 = try container.decodeIfPresent(Double.self, forKey: .balconySaFt2) ?? 0
        leasableFt2 = try container.decodeIfPresent(Double.self, forKey: .leasableFt2)
        balconyRatio = try container.decodeIfPresent(Double.self, forKey: .balconyRatio) ?? 0
        totalSellableFt2 = try container.decodeIfPresent(Double.self, forKey: .totalSellableFt2) ?? 0
        nonSellableFt2 = try container.decodeIfPresent(Double.self, forKey: .nonSellableFt2) ?? 0
        nonSellableRatio = try container.decodeIfPresent(Double.self, forKey: .nonSellableRatio) ?? 0
        efficiencySaGfa = try container.decodeIfPresent(Double.self, forKey: .efficiencySaGfa) ?? 0
    }

    private enum CodingKeys: String, CodingKey {
        case suiteSellableFt2, suiteSelableFt2, suiteSellableRatio
        case balconySaFt2, leasableFt2, balconyRatio
        case totalSellableFt2, nonSellableFt2, nonSellableRatio, efficiencySaGfa
    }
}

struct BuildingAMI: Codable {
    var areaFt2: Double = 0
    var pct: Double = 0
    init() {}
}

struct BuildingUnitCounts: Codable {
    var studio: Double = 0
    var oneBed: Double = 0
    var twoBed: Double = 0
    var threeBed: Double = 0
    var fourBed: Double = 0
    var liner: Double = 0
    var total: Double = 0
    init() {}
}

struct BuildingUnitMixPct: Codable {
    var studio: Double = 0
    var oneBed: Double = 0
    var twoBed: Double = 0
    var threeBed: Double = 0
    var fourBed: Double = 0
    var liner: Double = 0
    init() {}
}

struct BuildingBalconyPct: Codable {
    var studio: Double = 0
    var oneBed: Double = 0
    var twoBed: Double = 0
    var threeBed: Double = 0
    var fourBed: Double = 0
    var liner: Double = 0
    init() {}
}

struct RentalCondoSplit: Codable {
    var rental: Double = 0
    var condo: Double = 0
    init() {}
}

struct BuildingRentalCondoSplit: Codable {
    var studio: RentalCondoSplit = RentalCondoSplit()
    var oneBed: RentalCondoSplit = RentalCondoSplit()
    var twoBed: RentalCondoSplit = RentalCondoSplit()
    var threeBed: RentalCondoSplit = RentalCondoSplit()
    var fourBed: RentalCondoSplit = RentalCondoSplit()
    var liner: RentalCondoSplit = RentalCondoSplit()
    init() {}
}

struct BuildingRetailGrid: Codable {
    var gridFt: Double = 0
    var retailSmallQty: Double = 0
    var retailCornerQty: Double = 0
    var retailRegularQty: Double = 0
    init() {}
}

struct BuildingMEP: Codable {
    var electricalLoadKw: Double = 0
    var coolingLoadTr: Double = 0
    var waterDemandFt3Day: Double = 0
    var sewerageDemandFt3Day: Double = 0
    var gasDemandFt3Hr: Double = 0
    init() {}
}

struct BuildingParkingFacade: Codable {
    var parkingRequired: Double = 0
    var parkingProposed: Double = 0
    var parkingEfficiencyFt2Car: Double = 0
    var additionalParking: Double = 0
    var evParkingLots: Double = 0
    var facadeGlazingPct: Double = 0
    var facadeSpandrelPct: Double = 0
    var facadeSolidPct: Double = 0
    init() {}
}

struct BuildingLiftsHeight: Codable {
    var passengerCount: Double = 0
    var passengerCapacity: Double = 0
    var serviceCount: Double = 0
    var serviceCapacity: Double = 0
    var totalLifts: Double = 0
    var heightFt: Double = 0
    var buildingConfiguration: String = ""
    init() {}
}

struct BuildingBUA: Codable {
    var buaFt2: Double = 0
    var gfaOverBua: Double = 0
    init() {}
}

struct BuildingInfo: Codable, Identifiable {
    var identity: BuildingIdentity = BuildingIdentity()
    var gfa: BuildingGFA = BuildingGFA()
    var residentialSellable: BuildingSellable = BuildingSellable()
    var commercialSellable: BuildingSellable = BuildingSellable()
    var totalSellable: BuildingSellable = BuildingSellable()
    var ami: BuildingAMI = BuildingAMI()
    var unitCounts: BuildingUnitCounts = BuildingUnitCounts()
    var unitMixPct: BuildingUnitMixPct = BuildingUnitMixPct()
    var balconyPct: BuildingBalconyPct = BuildingBalconyPct()
    var rentalCondoSplit: BuildingRentalCondoSplit = BuildingRentalCondoSplit()
    var retailGrid: BuildingRetailGrid = BuildingRetailGrid()
    var mep: BuildingMEP = BuildingMEP()
    var parkingFacade: BuildingParkingFacade = BuildingParkingFacade()
    var liftsHeight: BuildingLiftsHeight = BuildingLiftsHeight()
    var bua: BuildingBUA = BuildingBUA()

    var id: String { identity.projectId }

    init() {}

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        identity = (try? container.decode(BuildingIdentity.self, forKey: .identity)) ?? BuildingIdentity()
        gfa = (try? container.decode(BuildingGFA.self, forKey: .gfa)) ?? BuildingGFA()
        residentialSellable = (try? container.decode(BuildingSellable.self, forKey: .residentialSellable)) ?? BuildingSellable()
        commercialSellable = (try? container.decode(BuildingSellable.self, forKey: .commercialSellable)) ?? BuildingSellable()
        totalSellable = (try? container.decode(BuildingSellable.self, forKey: .totalSellable)) ?? BuildingSellable()
        ami = (try? container.decode(BuildingAMI.self, forKey: .ami)) ?? BuildingAMI()
        unitCounts = (try? container.decode(BuildingUnitCounts.self, forKey: .unitCounts)) ?? BuildingUnitCounts()
        unitMixPct = (try? container.decode(BuildingUnitMixPct.self, forKey: .unitMixPct)) ?? BuildingUnitMixPct()
        balconyPct = (try? container.decode(BuildingBalconyPct.self, forKey: .balconyPct)) ?? BuildingBalconyPct()
        rentalCondoSplit = (try? container.decode(BuildingRentalCondoSplit.self, forKey: .rentalCondoSplit)) ?? BuildingRentalCondoSplit()
        retailGrid = (try? container.decode(BuildingRetailGrid.self, forKey: .retailGrid)) ?? BuildingRetailGrid()
        mep = (try? container.decode(BuildingMEP.self, forKey: .mep)) ?? BuildingMEP()
        parkingFacade = (try? container.decode(BuildingParkingFacade.self, forKey: .parkingFacade)) ?? BuildingParkingFacade()
        liftsHeight = (try? container.decode(BuildingLiftsHeight.self, forKey: .liftsHeight)) ?? BuildingLiftsHeight()
        bua = (try? container.decode(BuildingBUA.self, forKey: .bua)) ?? BuildingBUA()
    }

    private enum CodingKeys: String, CodingKey {
        case identity, gfa, residentialSellable, commercialSellable, totalSellable
        case ami, unitCounts, unitMixPct, balconyPct, rentalCondoSplit
        case retailGrid, mep, parkingFacade, liftsHeight, bua
    }
}

struct BuildingInfoStats: Codable {
    var totalBuildings: Int = 0
    var totalUnits: Double = 0
    var totalGfaFt2: Double = 0
    var totalSellableFt2: Double = 0
    var avgEfficiency: Double = 0
    var avgFar: Double = 0
    var totalParking: Double = 0
    var byDesignManager: [String: Int] = [:]
    var byLocation: ByLocation = ByLocation()
    var byStatus: ByStatus = ByStatus()

    init() {}

    struct ByLocation: Codable {
        var miami: Int = 0
        var riyadh: Int = 0

        init(miami: Int = 0, riyadh: Int = 0) {
            self.miami = miami
            self.riyadh = riyadh
        }
    }

    struct ByStatus: Codable {
        var pit: Int = 0
        var pot: Int = 0
        var pht: Int = 0

        init(pit: Int = 0, pot: Int = 0, pht: Int = 0) {
            self.pit = pit
            self.pot = pot
            self.pht = pht
        }
    }
}

struct BuildingInfoGrouped: Codable {
    var pit: [BuildingInfo] = []
    var pot: [BuildingInfo] = []
    var pht: [BuildingInfo] = []

    init() {}

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        pit = (try? container.decode([BuildingInfo].self, forKey: .pit)) ?? []
        pot = (try? container.decode([BuildingInfo].self, forKey: .pot)) ?? []
        pht = (try? container.decode([BuildingInfo].self, forKey: .pht)) ?? []
    }

    private enum CodingKeys: String, CodingKey {
        case pit, pot, pht
    }
}

struct BuildingInfoResponse: Codable {
    // VERSION MARKER: v2.0 - 2026-02-06 - If you don't see this in logs, Xcode is using cached code!
    static let modelVersion = "v2.0-2026-02-06"

    var buildings: [BuildingInfo] = []
    var grouped: BuildingInfoGrouped = BuildingInfoGrouped()
    var stats: BuildingInfoStats = BuildingInfoStats()
    var lastUpdated: String = ""

    private enum CodingKeys: String, CodingKey {
        case buildings, grouped, stats, lastUpdated
    }

    init() {}

    init(from decoder: Decoder) throws {
        // CRITICAL: If you see the old print statements but NOT this one, Xcode has cached code
        print("🚀🚀🚀 BuildingInfoResponse \(Self.modelVersion) DECODER CALLED 🚀🚀🚀")

        let container = try decoder.container(keyedBy: CodingKeys.self)

        // Log available keys for debugging
        let availableKeys = container.allKeys.map { $0.stringValue }
        print("🔍 BuildingInfoResponse \(Self.modelVersion) available keys: \(availableKeys)")

        buildings = (try? container.decode([BuildingInfo].self, forKey: .buildings)) ?? []
        grouped = (try? container.decode(BuildingInfoGrouped.self, forKey: .grouped)) ?? BuildingInfoGrouped()
        stats = (try? container.decode(BuildingInfoStats.self, forKey: .stats)) ?? BuildingInfoStats()
        lastUpdated = (try? container.decode(String.self, forKey: .lastUpdated)) ?? ""

        print("✅ BuildingInfoResponse \(Self.modelVersion): Decoded \(buildings.count) buildings")
    }
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
