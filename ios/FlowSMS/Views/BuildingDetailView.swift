import SwiftUI

struct BuildingDetailView: View {
    let buildingId: String
    @StateObject private var viewModel = BuildingDetailViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            if viewModel.isLoading {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .oceanSwell))
                    .padding(.top, 100)
            } else if let error = viewModel.error {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundColor(.sunlight)
                    Text(error)
                        .foregroundColor(.textSecondary)
                    Button("Retry") {
                        Task { await viewModel.loadBuilding(id: buildingId) }
                    }
                    .foregroundColor(.oceanSwell)
                }
                .padding(.top, 100)
            } else if let building = viewModel.building {
                VStack(spacing: 20) {
                    // Header Card
                    HeaderCard(building: building)

                    // Location Map
                    BuildingLocationMapView(building: building)

                    // Top KPIs
                    KPIGrid(building: building)

                    // Project Program / Gantt Chart
                    ProgramGanttView(
                        buildingId: building.identity.marketingName.isEmpty
                            ? building.identity.plotNo
                            : building.identity.marketingName,
                        buildingName: building.identity.marketingName
                    )

                    // GFA Section
                    GFASection(building: building)

                    // Sellable Area Section
                    SellableSection(building: building)

                    // Unit Mix Section
                    UnitMixSection(building: building)

                    // MEP Section
                    MEPSection(building: building)

                    // Parking & Facade Section
                    ParkingFacadeSection(building: building)

                    // Lifts & Height Section
                    LiftsSection(building: building)
                }
                .padding()
            }
        }
        .background(Color.bgDark)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadBuilding(id: buildingId)
        }
    }
}

// MARK: - Header Card

struct HeaderCard: View {
    let building: BuildingInfo

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(building.identity.displayName)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.textPrimary)

                    if !building.identity.plotNo.isEmpty {
                        Text(building.identity.plotNo)
                            .font(.subheadline)
                            .foregroundColor(.textSecondary)
                    }
                }

                Spacer()

                Text(building.identity.statusEnum.shortName)
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(building.identity.statusEnum.color)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(building.identity.statusEnum.color.opacity(0.15))
                    .clipShape(Capsule())
            }

            HStack(spacing: 16) {
                Label(building.identity.locationEnum.displayName, systemImage: "mappin")
                    .font(.caption)
                    .foregroundColor(.textSecondary)

                if !building.identity.designManager.isEmpty {
                    Label(building.identity.designManager, systemImage: "person")
                        .font(.caption)
                        .foregroundColor(.purple)
                }

                if !building.liftsHeight.buildingConfiguration.isEmpty {
                    Label(building.liftsHeight.buildingConfiguration, systemImage: "building.2")
                        .font(.caption)
                        .foregroundColor(.oceanSwell)
                }
            }
        }
        .padding()
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

// MARK: - KPI Grid

struct KPIGrid: View {
    let building: BuildingInfo

    var body: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 12) {
            KPICard(label: "FAR", value: String(format: "%.2f", building.identity.far), icon: "square.stack.3d.up")
            KPICard(
                label: "Efficiency",
                value: String(format: "%.1f%%", building.totalSellable.efficiencySaGfa * 100),
                icon: "chart.line.uptrend.xyaxis",
                highlight: building.totalSellable.efficiencySaGfa >= 0.9
            )
            KPICard(label: "Units", value: "\(Int(building.unitCounts.total))", icon: "house")
            KPICard(label: "GFA", value: formatArea(building.gfa.totalProposedGfaFt2), icon: "ruler")
            KPICard(label: "Height", value: "\(Int(building.liftsHeight.heightFt)) ft", icon: "arrow.up.and.down")
            KPICard(label: "Parking", value: "\(Int(building.parkingFacade.parkingProposed))", icon: "car")
        }
    }

    func formatArea(_ value: Double) -> String {
        if value >= 1_000_000 {
            return String(format: "%.1fM ft²", value / 1_000_000)
        } else if value >= 1_000 {
            return String(format: "%.0fK ft²", value / 1_000)
        }
        return String(format: "%.0f ft²", value)
    }
}

struct KPICard: View {
    let label: String
    let value: String
    let icon: String
    var highlight: Bool = false

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(highlight ? .green : .oceanSwell)

            Text(value)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(highlight ? .green : .textPrimary)

            Text(label)
                .font(.caption)
                .foregroundColor(.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(highlight ? Color.green.opacity(0.1) : Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(highlight ? Color.green.opacity(0.3) : Color.clear, lineWidth: 1)
        )
    }
}

// MARK: - GFA Section

struct GFASection: View {
    let building: BuildingInfo

    var body: some View {
        SectionCard(title: "Gross Floor Area", icon: "square.grid.2x2") {
            VStack(spacing: 12) {
                GFARow(label: "Residential", value: building.gfa.resProposedGfaFt2, pct: building.gfa.resProposedGfaPct, color: .oceanSwell)
                GFARow(label: "Commercial", value: building.gfa.comProposedGfaFt2, pct: building.gfa.comProposedGfaPct, color: .green)
                Divider()
                GFARow(label: "Total", value: building.gfa.totalProposedGfaFt2, pct: 1.0, color: .purple, isTotal: true)
            }
        }
    }
}

struct GFARow: View {
    let label: String
    let value: Double
    let pct: Double
    let color: Color
    var isTotal: Bool = false

    var body: some View {
        VStack(spacing: 6) {
            HStack {
                Text(label)
                    .font(isTotal ? .subheadline.bold() : .subheadline)
                    .foregroundColor(isTotal ? .textPrimary : .textSecondary)
                Spacer()
                Text(formatArea(value))
                    .font(isTotal ? .subheadline.bold() : .subheadline)
                    .foregroundColor(isTotal ? color : .textPrimary)
            }

            if !isTotal {
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Color.bgHover)
                            .frame(height: 6)
                        RoundedRectangle(cornerRadius: 3)
                            .fill(color)
                            .frame(width: geo.size.width * CGFloat(pct), height: 6)
                    }
                }
                .frame(height: 6)
            }
        }
    }

    func formatArea(_ value: Double) -> String {
        if value >= 1_000_000 {
            return String(format: "%.1fM ft²", value / 1_000_000)
        } else if value >= 1_000 {
            return String(format: "%.0fK ft²", value / 1_000)
        }
        return String(format: "%.0f ft²", value)
    }
}

// MARK: - Sellable Section

struct SellableSection: View {
    let building: BuildingInfo

    var body: some View {
        SectionCard(title: "Sellable Area", icon: "ruler") {
            VStack(spacing: 16) {
                // Residential
                SellableBlock(title: "Residential", sellable: building.residentialSellable, color: .oceanSwell)

                Divider()

                // Commercial
                SellableBlock(title: "Commercial", sellable: building.commercialSellable, color: .green)

                Divider()

                // Total
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Total Efficiency")
                            .font(.subheadline)
                            .foregroundColor(.textSecondary)
                        Text(String(format: "%.1f%%", building.totalSellable.efficiencySaGfa * 100))
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(building.totalSellable.efficiencySaGfa >= 0.9 ? .green : .textPrimary)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("Total Sellable")
                            .font(.subheadline)
                            .foregroundColor(.textSecondary)
                        Text(formatArea(building.totalSellable.totalSellableFt2))
                            .font(.title3)
                            .fontWeight(.semibold)
                            .foregroundColor(.textPrimary)
                    }
                }
                .padding()
                .background(Color.bgSurface)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
    }

    func formatArea(_ value: Double) -> String {
        if value >= 1_000_000 {
            return String(format: "%.1fM ft²", value / 1_000_000)
        } else if value >= 1_000 {
            return String(format: "%.0fK ft²", value / 1_000)
        }
        return String(format: "%.0f ft²", value)
    }
}

struct SellableBlock: View {
    let title: String
    let sellable: BuildingSellable
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Circle().fill(color).frame(width: 8, height: 8)
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.textPrimary)
            }

            HStack(spacing: 16) {
                DataPill(label: "Total", value: formatArea(sellable.totalSellableFt2))
                DataPill(label: "Efficiency", value: String(format: "%.1f%%", sellable.efficiencySaGfa * 100))
            }
        }
    }

    func formatArea(_ value: Double) -> String {
        if value >= 1_000 {
            return String(format: "%.0fK", value / 1_000)
        }
        return String(format: "%.0f", value)
    }
}

struct DataPill: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption2)
                .foregroundColor(.textSecondary)
            Text(value)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color.bgSurface)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

// MARK: - Unit Mix Section

struct UnitMixSection: View {
    let building: BuildingInfo

    var unitTypes: [(String, Double, Color)] {
        [
            ("Studio", building.unitCounts.studio, .cyan),
            ("1BR", building.unitCounts.oneBed, .oceanSwell),
            ("2BR", building.unitCounts.twoBed, .green),
            ("3BR", building.unitCounts.threeBed, .sunlight),
            ("4BR", building.unitCounts.fourBed, .purple),
            ("Liner", building.unitCounts.liner, .pink)
        ].filter { $0.1 > 0 }
    }

    var body: some View {
        SectionCard(title: "Unit Mix", icon: "house") {
            VStack(spacing: 16) {
                // Total units
                HStack {
                    Text("Total Units")
                        .font(.subheadline)
                        .foregroundColor(.textSecondary)
                    Spacer()
                    Text("\(Int(building.unitCounts.total))")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.textPrimary)
                }

                // Unit bar
                if building.unitCounts.total > 0 {
                    GeometryReader { geo in
                        HStack(spacing: 2) {
                            ForEach(unitTypes, id: \.0) { type in
                                let width = geo.size.width * CGFloat(type.1 / building.unitCounts.total)
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(type.2)
                                    .frame(width: max(width, 4), height: 24)
                            }
                        }
                    }
                    .frame(height: 24)
                }

                // Legend
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                    ForEach(unitTypes, id: \.0) { type in
                        HStack(spacing: 6) {
                            Circle().fill(type.2).frame(width: 8, height: 8)
                            Text(type.0)
                                .font(.caption)
                                .foregroundColor(.textSecondary)
                            Spacer()
                            Text("\(Int(type.1))")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.textPrimary)
                        }
                    }
                }

                // AMI
                HStack {
                    Text("AMI")
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                    Spacer()
                    Text(formatArea(building.ami.areaFt2))
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.textPrimary)
                }
                .padding()
                .background(Color.bgSurface)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
    }

    func formatArea(_ value: Double) -> String {
        if value >= 1_000 {
            return String(format: "%.0fK ft²", value / 1_000)
        }
        return String(format: "%.0f ft²", value)
    }
}

// MARK: - MEP Section

struct MEPSection: View {
    let building: BuildingInfo

    var body: some View {
        SectionCard(title: "MEP Systems", icon: "bolt") {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                MEPItem(icon: "bolt", label: "Electrical", value: "\(Int(building.mep.electricalLoadKw)) kW")
                MEPItem(icon: "snowflake", label: "Cooling", value: "\(Int(building.mep.coolingLoadTr)) TR")
                MEPItem(icon: "drop", label: "Water", value: "\(Int(building.mep.waterDemandFt3Day)) ft³/day")
                MEPItem(icon: "flame", label: "Gas", value: "\(Int(building.mep.gasDemandFt3Hr)) ft³/hr")
            }
        }
    }
}

struct MEPItem: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.oceanSwell)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.textSecondary)
                Text(value)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
            }
            Spacer()
        }
        .padding()
        .background(Color.bgSurface)
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

// MARK: - Parking & Facade Section

struct ParkingFacadeSection: View {
    let building: BuildingInfo

    var body: some View {
        SectionCard(title: "Parking & Facade", icon: "car") {
            VStack(spacing: 16) {
                // Parking stats
                HStack(spacing: 16) {
                    ParkingStat(label: "Required", value: Int(building.parkingFacade.parkingRequired))
                    ParkingStat(label: "Proposed", value: Int(building.parkingFacade.parkingProposed), highlight: true)
                    ParkingStat(label: "EV Lots", value: Int(building.parkingFacade.evParkingLots))
                }

                Divider()

                // Facade composition
                VStack(alignment: .leading, spacing: 8) {
                    Text("Facade Composition")
                        .font(.caption)
                        .foregroundColor(.textSecondary)

                    FacadeBar(label: "Glazing", value: building.parkingFacade.facadeGlazingPct, color: .cyan)
                    FacadeBar(label: "Spandrel", value: building.parkingFacade.facadeSpandrelPct, color: .purple)
                    FacadeBar(label: "Solid", value: building.parkingFacade.facadeSolidPct, color: .gray)
                }
            }
        }
    }
}

struct ParkingStat: View {
    let label: String
    let value: Int
    var highlight: Bool = false

    var body: some View {
        VStack(spacing: 4) {
            Text("\(value)")
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(highlight ? .oceanSwell : .textPrimary)
            Text(label)
                .font(.caption)
                .foregroundColor(.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(highlight ? Color.oceanSwell.opacity(0.1) : Color.bgSurface)
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

struct FacadeBar: View {
    let label: String
    let value: Double
    let color: Color

    var body: some View {
        HStack {
            Text(label)
                .font(.caption)
                .foregroundColor(.textSecondary)
                .frame(width: 60, alignment: .leading)

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.bgHover)
                        .frame(height: 12)
                    RoundedRectangle(cornerRadius: 4)
                        .fill(color)
                        .frame(width: geo.size.width * CGFloat(value), height: 12)
                }
            }
            .frame(height: 12)

            Text(String(format: "%.0f%%", value * 100))
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.textPrimary)
                .frame(width: 40, alignment: .trailing)
        }
    }
}

// MARK: - Lifts Section

struct LiftsSection: View {
    let building: BuildingInfo

    var body: some View {
        SectionCard(title: "Lifts & Building", icon: "arrow.up.arrow.down") {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                LiftStat(label: "Passenger", value: Int(building.liftsHeight.passengerCount))
                LiftStat(label: "Service", value: Int(building.liftsHeight.serviceCount))
                LiftStat(label: "Total Lifts", value: Int(building.liftsHeight.totalLifts), highlight: true)
                LiftStat(label: "Height", value: "\(Int(building.liftsHeight.heightFt)) ft")
                LiftStat(label: "Plot Area", value: formatArea(building.identity.plotAreaFt2))
                LiftStat(label: "BUA", value: formatArea(building.bua.buaFt2))
            }
        }
    }

    func formatArea(_ value: Double) -> String {
        if value >= 1_000 {
            return String(format: "%.0fK", value / 1_000)
        }
        return String(format: "%.0f", value)
    }
}

struct LiftStat: View {
    let label: String
    let value: Any
    var highlight: Bool = false

    var displayValue: String {
        if let intVal = value as? Int {
            return "\(intVal)"
        } else if let strVal = value as? String {
            return strVal
        }
        return "-"
    }

    var body: some View {
        VStack(spacing: 4) {
            Text(displayValue)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(highlight ? .oceanSwell : .textPrimary)
            Text(label)
                .font(.caption2)
                .foregroundColor(.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(Color.bgSurface)
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

// MARK: - Section Card

struct SectionCard<Content: View>: View {
    let title: String
    let icon: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .foregroundColor(.oceanSwell)
                Text(title)
                    .font(.headline)
                    .foregroundColor(.textPrimary)
            }

            content
        }
        .padding()
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

// MARK: - View Model

@MainActor
class BuildingDetailViewModel: ObservableObject {
    @Published var building: BuildingInfo?
    @Published var isLoading = false
    @Published var error: String?

    func loadBuilding(id: String) async {
        isLoading = true
        error = nil

        do {
            let response = try await APIService.shared.fetchBuildings()
            building = response.buildings.first { $0.id == id }
            if building == nil {
                error = "Building not found"
            }
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }
}

#Preview {
    NavigationStack {
        BuildingDetailView(buildingId: "test")
    }
}
