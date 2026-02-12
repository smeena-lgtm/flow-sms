import SwiftUI

// MARK: - Unit Study Data Models

struct UnitPrototype: Identifiable {
    let id: String           // "1BD-A", "LN-3BD-B", etc.
    let bedrooms: String     // "1 BD", "2 BD", etc.
    let bedroomCount: Int    // 1, 2, 3, 4, 5
    let gfaSf: Int           // gross floor area in sf
    let unitCount: Int
    let category: UnitCategory
    let towers: String       // "Rental & Condo", "Rental", "Condo", "Parking Garage"
    let levels: String       // "06-28", "02-05", etc.
    let notes: String
}

enum UnitCategory: String {
    case apartment = "Apartment"
    case liner = "Liner"

    var color: Color {
        switch self {
        case .apartment: return .oceanSwell
        case .liner: return .sunlight
        }
    }

    var icon: String {
        switch self {
        case .apartment: return "building.2"
        case .liner: return "rectangle.split.3x1"
        }
    }
}

struct FloorBreakdown: Identifiable {
    let id: String
    let level: Int
    let levelDisplay: String
    let classification: String
    let rental: Int
    let condo: Int
    let liner: Int
    let total: Int
    let notes: String
}

struct BedroomSummary: Identifiable {
    let id: String
    let label: String
    let bedroomCount: Int
    let rental: Int
    let condoApt: Int
    let condoLiner: Int
    let subtotal: Int
    let mixPct: Double
    let minApprovedSf: Int
    let minGfa: Int
    let maxGfa: Int
    let uniqueTypes: Int
    let color: Color
}

struct TowerInfo {
    let name: String
    let units: Int
    let levels: String
    let type: String
    let color: Color
    let icon: String
}

struct UnitStudyProject {
    let projectId: String
    let name: String
    let subtitle: String
    let address: String
    let maxHeightFt: Int
    let levels: Int
    let totalUnits: Int
    let towers: [TowerInfo]
    let parking: Int
    let bedroomSummaries: [BedroomSummary]
    let prototypes: [UnitPrototype]
    let floors: [FloorBreakdown]
}

// MARK: - Bedroom Colors

extension Int {
    var bedroomColor: Color {
        switch self {
        case 1: return .oceanSwell
        case 2: return .green
        case 3: return .sunlight
        case 4: return .purple
        case 5: return .pink
        default: return .textSecondary
        }
    }
}

// MARK: - Hardcoded Flow Aventura Data

enum UnitStudyDatabase {
    static func project(for buildingId: String) -> UnitStudyProject? {
        let normalizedId = buildingId.lowercased()
        if normalizedId.contains("aventura") || normalizedId.contains("acc") {
            return aventura
        }
        return nil
    }

    static let aventura = UnitStudyProject(
        projectId: "aventura",
        name: "Flow Aventura",
        subtitle: "Aventura Corporate Center (ACC)",
        address: "20801 Biscayne Blvd, Aventura FL 33180",
        maxHeightFt: 338,
        levels: 29,
        totalUnits: 735,
        towers: [
            TowerInfo(name: "Tower A", units: 369, levels: "06–28", type: "Rental", color: .oceanSwell, icon: "building.2.fill"),
            TowerInfo(name: "Tower B", units: 323, levels: "06–28", type: "Condo", color: .green, icon: "building.2"),
            TowerInfo(name: "Liner", units: 43, levels: "02–05", type: "Parking Liner", color: .sunlight, icon: "rectangle.split.3x1"),
        ],
        parking: 1037,
        bedroomSummaries: [
            BedroomSummary(id: "1bd", label: "1 BD", bedroomCount: 1, rental: 188, condoApt: 184, condoLiner: 28, subtotal: 400, mixPct: 0.5442, minApprovedSf: 500, minGfa: 541, maxGfa: 657, uniqueTypes: 3, color: .oceanSwell),
            BedroomSummary(id: "2bd", label: "2 BD", bedroomCount: 2, rental: 131, condoApt: 93, condoLiner: 0, subtotal: 224, mixPct: 0.3048, minApprovedSf: 800, minGfa: 865, maxGfa: 1026, uniqueTypes: 7, color: .green),
            BedroomSummary(id: "3bd", label: "3 BD", bedroomCount: 3, rental: 27, condoApt: 27, condoLiner: 15, subtotal: 69, mixPct: 0.0939, minApprovedSf: 1050, minGfa: 1115, maxGfa: 1510, uniqueTypes: 8, color: .sunlight),
            BedroomSummary(id: "4bd", label: "4 BD", bedroomCount: 4, rental: 13, condoApt: 11, condoLiner: 0, subtotal: 24, mixPct: 0.0327, minApprovedSf: 1250, minGfa: 1468, maxGfa: 1961, uniqueTypes: 4, color: .purple),
            BedroomSummary(id: "5bd", label: "5 BD", bedroomCount: 5, rental: 10, condoApt: 8, condoLiner: 0, subtotal: 18, mixPct: 0.0245, minApprovedSf: 1500, minGfa: 1724, maxGfa: 2685, uniqueTypes: 6, color: .pink),
        ],
        prototypes: [
            // 1 BD
            UnitPrototype(id: "1BD-A", bedrooms: "1 BD", bedroomCount: 1, gfaSf: 541, unitCount: 213, category: .apartment, towers: "Rental & Condo", levels: "06–28", notes: "Primary small 1BD; most common unit in project"),
            UnitPrototype(id: "1BD-B", bedrooms: "1 BD", bedroomCount: 1, gfaSf: 635, unitCount: 159, category: .apartment, towers: "Rental & Condo", levels: "06–28", notes: "Larger 1BD variant; appears on all residential floors"),
            UnitPrototype(id: "LN-1BD", bedrooms: "1 BD (Liner)", bedroomCount: 1, gfaSf: 657, unitCount: 28, category: .liner, towers: "Parking Garage", levels: "02–05", notes: "Liner unit wrapping parking structure"),
            // 2 BD
            UnitPrototype(id: "2BD-A", bedrooms: "2 BD", bedroomCount: 2, gfaSf: 865, unitCount: 130, category: .apartment, towers: "Rental & Condo", levels: "07–28", notes: "Primary 2BD type; most common 2BD across all tower floors"),
            UnitPrototype(id: "2BD-B", bedrooms: "2 BD", bedroomCount: 2, gfaSf: 894, unitCount: 38, category: .apartment, towers: "Rental & Condo", levels: "07–25", notes: "Corner position variant in both towers"),
            UnitPrototype(id: "2BD-C", bedrooms: "2 BD", bedroomCount: 2, gfaSf: 901, unitCount: 2, category: .apartment, towers: "Rental", levels: "12–13", notes: "Slight size increase vs 2BD-B on these levels"),
            UnitPrototype(id: "2BD-D", bedrooms: "2 BD", bedroomCount: 2, gfaSf: 945, unitCount: 10, category: .apartment, towers: "Rental & Condo", levels: "21–25", notes: "Upper-floor variant as building steps back"),
            UnitPrototype(id: "2BD-E", bedrooms: "2 BD", bedroomCount: 2, gfaSf: 990, unitCount: 2, category: .apartment, towers: "Rental", levels: "11", notes: "Single-level variant, larger 2BD"),
            UnitPrototype(id: "2BD-F", bedrooms: "2 BD", bedroomCount: 2, gfaSf: 995, unitCount: 38, category: .apartment, towers: "Rental & Condo", levels: "07–28", notes: "Premium 2BD; typically 1 per tower per floor"),
            UnitPrototype(id: "2BD-G", bedrooms: "2 BD", bedroomCount: 2, gfaSf: 1026, unitCount: 4, category: .apartment, towers: "Rental", levels: "17–20", notes: "Largest 2BD; appears on mid-upper levels only"),
            // 3 BD
            UnitPrototype(id: "3BD-A", bedrooms: "3 BD", bedroomCount: 3, gfaSf: 1137, unitCount: 38, category: .apartment, towers: "Rental & Condo", levels: "07–28", notes: "Primary 3BD; corner position on most floors"),
            UnitPrototype(id: "3BD-B", bedrooms: "3 BD", bedroomCount: 3, gfaSf: 1142, unitCount: 2, category: .apartment, towers: "Rental", levels: "11", notes: "Slight variant of 3BD-A on Level 11"),
            UnitPrototype(id: "3BD-C", bedrooms: "3 BD", bedroomCount: 3, gfaSf: 1257, unitCount: 8, category: .apartment, towers: "Rental", levels: "17–20", notes: "Larger 3BD on mid-upper Rental floors"),
            UnitPrototype(id: "3BD-D", bedrooms: "3 BD", bedroomCount: 3, gfaSf: 1276, unitCount: 6, category: .apartment, towers: "Rental", levels: "14–16", notes: "Larger 3BD on mid-level Rental floors"),
            UnitPrototype(id: "LN-3BD-A", bedrooms: "3 BD (Liner)", bedroomCount: 3, gfaSf: 1115, unitCount: 3, category: .liner, towers: "Parking Garage", levels: "03–05", notes: "Smaller liner 3BD"),
            UnitPrototype(id: "LN-3BD-B", bedrooms: "3 BD (Liner)", bedroomCount: 3, gfaSf: 1182, unitCount: 6, category: .liner, towers: "Parking Garage", levels: "02–05", notes: "Mid-size liner 3BD"),
            UnitPrototype(id: "LN-3BD-C", bedrooms: "3 BD (Liner)", bedroomCount: 3, gfaSf: 1201, unitCount: 3, category: .liner, towers: "Parking Garage", levels: "03–05", notes: "Larger liner 3BD variant"),
            UnitPrototype(id: "LN-3BD-D", bedrooms: "3 BD (Liner)", bedroomCount: 3, gfaSf: 1510, unitCount: 3, category: .liner, towers: "Parking Garage", levels: "02–04", notes: "Largest liner unit"),
            // 4 BD
            UnitPrototype(id: "4BD-A", bedrooms: "4 BD", bedroomCount: 4, gfaSf: 1468, unitCount: 12, category: .apartment, towers: "Rental & Condo", levels: "10, 21–25", notes: "Upper-floor 4BD; 6+ levels"),
            UnitPrototype(id: "4BD-B", bedrooms: "4 BD", bedroomCount: 4, gfaSf: 1499, unitCount: 6, category: .apartment, towers: "Rental & Condo", levels: "14–16", notes: "Mid-level 4BD variant"),
            UnitPrototype(id: "4BD-C", bedrooms: "4 BD", bedroomCount: 4, gfaSf: 1547, unitCount: 4, category: .apartment, towers: "Rental & Condo", levels: "12–13", notes: "Larger mid-level 4BD"),
            UnitPrototype(id: "4BD-D", bedrooms: "4 BD", bedroomCount: 4, gfaSf: 1961, unitCount: 2, category: .apartment, towers: "Rental & Condo", levels: "08–09", notes: "Largest 4BD; lower residential floors"),
            // 5 BD
            UnitPrototype(id: "5BD-A", bedrooms: "5 BD", bedroomCount: 5, gfaSf: 1724, unitCount: 2, category: .apartment, towers: "Rental & Condo", levels: "10", notes: "Smallest 5BD; single level only"),
            UnitPrototype(id: "5BD-B", bedrooms: "5 BD", bedroomCount: 5, gfaSf: 1859, unitCount: 6, category: .apartment, towers: "Rental", levels: "26–28", notes: "Upper penthouse-tier 5BD (Rental)"),
            UnitPrototype(id: "5BD-C", bedrooms: "5 BD", bedroomCount: 5, gfaSf: 1879, unitCount: 6, category: .apartment, towers: "Condo", levels: "26–28", notes: "Upper penthouse-tier 5BD (Condo)"),
            UnitPrototype(id: "5BD-D", bedrooms: "5 BD", bedroomCount: 5, gfaSf: 2107, unitCount: 1, category: .apartment, towers: "Condo", levels: "06", notes: "Podium-level premium 5BD (Condo)"),
            UnitPrototype(id: "5BD-E", bedrooms: "5 BD", bedroomCount: 5, gfaSf: 2115, unitCount: 1, category: .apartment, towers: "Rental", levels: "06", notes: "Podium-level premium 5BD (Rental)"),
            UnitPrototype(id: "5BD-F", bedrooms: "5 BD", bedroomCount: 5, gfaSf: 2685, unitCount: 2, category: .apartment, towers: "Rental & Condo", levels: "08–09", notes: "Largest unit in the project"),
        ],
        floors: [
            FloorBreakdown(id: "L01", level: 1, levelDisplay: "01", classification: "Ground Level", rental: 0, condo: 0, liner: 0, total: 0, notes: "Lobbies, retail, no residential"),
            FloorBreakdown(id: "L02", level: 2, levelDisplay: "02", classification: "Parking + Liners", rental: 0, condo: 0, liner: 6, total: 6, notes: "LN_1BD×5, LN_3BD/1510×1"),
            FloorBreakdown(id: "L03", level: 3, levelDisplay: "03", classification: "Parking + Liners", rental: 0, condo: 0, liner: 14, total: 14, notes: "LN_1BD×9, LN_3BD/1510×1, /1115×1, /1182×2, /1201×1"),
            FloorBreakdown(id: "L04", level: 4, levelDisplay: "04", classification: "Parking + Liners", rental: 0, condo: 0, liner: 14, total: 14, notes: "Same as Level 03"),
            FloorBreakdown(id: "L05", level: 5, levelDisplay: "05", classification: "Parking + Liners", rental: 0, condo: 0, liner: 9, total: 9, notes: "LN_1BD×5, LN_3BD/1115×1, /1182×2, /1201×1"),
            FloorBreakdown(id: "L06", level: 6, levelDisplay: "06", classification: "Podium", rental: 4, condo: 4, liner: 0, total: 8, notes: "1BD + 5BD premium units"),
            FloorBreakdown(id: "L07", level: 7, levelDisplay: "07", classification: "Resi + Clubhouse", rental: 21, condo: 19, liner: 0, total: 40, notes: "First full residential floor; Clubhouse"),
            FloorBreakdown(id: "L08", level: 8, levelDisplay: "08", classification: "Residential", rental: 24, condo: 21, liner: 0, total: 45, notes: "4BD/1961 and 5BD/2685 added"),
            FloorBreakdown(id: "L09", level: 9, levelDisplay: "09", classification: "Residential", rental: 24, condo: 21, liner: 0, total: 45, notes: "Same layout as Level 08"),
            FloorBreakdown(id: "L10", level: 10, levelDisplay: "10", classification: "Residential", rental: 18, condo: 16, liner: 0, total: 34, notes: "Building steps back; 4BD/1468, 5BD/1724"),
            FloorBreakdown(id: "L11", level: 11, levelDisplay: "11", classification: "Residential", rental: 18, condo: 16, liner: 0, total: 34, notes: "Variants: 3BD/1142, 2BD/990"),
            FloorBreakdown(id: "L12", level: 12, levelDisplay: "12", classification: "Residential", rental: 17, condo: 15, liner: 0, total: 32, notes: "Stepback; 4BD/1547, 2BD/901"),
            FloorBreakdown(id: "L13", level: 13, levelDisplay: "13", classification: "Residential", rental: 17, condo: 15, liner: 0, total: 32, notes: "Same layout as Level 12"),
            FloorBreakdown(id: "L14", level: 14, levelDisplay: "14", classification: "Residential", rental: 16, condo: 14, liner: 0, total: 30, notes: "Stepback; 4BD/1499, 3BD/1276"),
            FloorBreakdown(id: "L15", level: 15, levelDisplay: "15", classification: "Residential", rental: 16, condo: 14, liner: 0, total: 30, notes: "Same layout as Level 14"),
            FloorBreakdown(id: "L16", level: 16, levelDisplay: "16", classification: "Residential", rental: 16, condo: 14, liner: 0, total: 30, notes: "Same layout as Level 14"),
            FloorBreakdown(id: "L17", level: 17, levelDisplay: "17", classification: "Residential", rental: 16, condo: 14, liner: 0, total: 30, notes: "3BD/1257, 2BD/1026 variants"),
            FloorBreakdown(id: "L18", level: 18, levelDisplay: "18", classification: "Residential", rental: 16, condo: 14, liner: 0, total: 30, notes: "Same layout as Level 17"),
            FloorBreakdown(id: "L19", level: 19, levelDisplay: "19", classification: "Residential", rental: 16, condo: 14, liner: 0, total: 30, notes: "Same layout as Level 17"),
            FloorBreakdown(id: "L20", level: 20, levelDisplay: "20", classification: "Residential", rental: 16, condo: 14, liner: 0, total: 30, notes: "Same layout as Level 17"),
            FloorBreakdown(id: "L21", level: 21, levelDisplay: "21", classification: "Residential", rental: 15, condo: 13, liner: 0, total: 28, notes: "Stepback; 4BD/1468, 2BD/945"),
            FloorBreakdown(id: "L22", level: 22, levelDisplay: "22", classification: "Residential", rental: 15, condo: 13, liner: 0, total: 28, notes: "Same layout as Level 21"),
            FloorBreakdown(id: "L23", level: 23, levelDisplay: "23", classification: "Residential", rental: 15, condo: 13, liner: 0, total: 28, notes: "Same layout as Level 21"),
            FloorBreakdown(id: "L24", level: 24, levelDisplay: "24", classification: "Residential", rental: 15, condo: 13, liner: 0, total: 28, notes: "Same layout as Level 21"),
            FloorBreakdown(id: "L25", level: 25, levelDisplay: "25", classification: "Residential", rental: 15, condo: 13, liner: 0, total: 28, notes: "Same layout as Level 21"),
            FloorBreakdown(id: "L26", level: 26, levelDisplay: "26", classification: "Residential", rental: 13, condo: 11, liner: 0, total: 24, notes: "Top tier; 5BD/1859 (R), 5BD/1879 (C)"),
            FloorBreakdown(id: "L27", level: 27, levelDisplay: "27", classification: "Residential", rental: 13, condo: 11, liner: 0, total: 24, notes: "Same layout as Level 26"),
            FloorBreakdown(id: "L28", level: 28, levelDisplay: "28", classification: "Residential", rental: 13, condo: 11, liner: 0, total: 24, notes: "Same layout as Level 26"),
            FloorBreakdown(id: "L29", level: 29, levelDisplay: "29", classification: "Rooftop", rental: 0, condo: 0, liner: 0, total: 0, notes: "Rooftop amenities, no residential"),
        ]
    )
}
