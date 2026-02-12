import SwiftUI

// MARK: - Main Unit Study View

struct UnitStudyView: View {
    let project: UnitStudyProject

    @State private var selectedBedroom: Int? = nil
    @State private var showPrototypes = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Hero header
                UnitStudyHeader(project: project)

                // Tower breakdown cards
                TowerBreakdownSection(towers: project.towers)

                // Bedroom distribution
                BedroomDistributionSection(
                    summaries: project.bedroomSummaries,
                    totalUnits: project.totalUnits
                )

                // Prototype explorer
                PrototypeExplorerSection(
                    prototypes: project.prototypes,
                    bedroomSummaries: project.bedroomSummaries
                )

                // Floor-by-floor tower view
                FloorByFloorSection(floors: project.floors)

                // Size ranges
                SizeRangeSection(summaries: project.bedroomSummaries)
            }
            .padding()
        }
        .background(Color.bgDark)
        .navigationTitle("Unit Study")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Hero Header

private struct UnitStudyHeader: View {
    let project: UnitStudyProject

    var body: some View {
        VStack(spacing: 16) {
            // Project name
            VStack(spacing: 4) {
                Text(project.name)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.textPrimary)

                Text(project.address)
                    .font(.caption)
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)
            }

            // Key stats
            HStack(spacing: 0) {
                UnitStudyStatPill(value: "\(project.totalUnits)", label: "Units", color: .oceanSwell)
                Divider().frame(height: 36)
                UnitStudyStatPill(value: "\(project.levels)", label: "Levels", color: .green)
                Divider().frame(height: 36)
                UnitStudyStatPill(value: "\(project.maxHeightFt) ft", label: "Height", color: .purple)
                Divider().frame(height: 36)
                UnitStudyStatPill(value: "\(project.parking)", label: "Parking", color: .sunlight)
            }
            .padding(.vertical, 8)
            .background(Color.bgSurface)
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
        .padding()
        .background(
            LinearGradient(
                colors: [Color.bgCard, Color.bgCard.opacity(0.8)],
                startPoint: .top,
                endPoint: .bottom
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.oceanSwell.opacity(0.2), lineWidth: 1)
        )
    }
}

private struct UnitStudyStatPill: View {
    let value: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(color)
            Text(label)
                .font(.caption2)
                .foregroundColor(.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Tower Breakdown

private struct TowerBreakdownSection: View {
    let towers: [TowerInfo]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "building.2")
                    .foregroundColor(.oceanSwell)
                Text("Tower Breakdown")
                    .font(.headline)
                    .foregroundColor(.textPrimary)
            }

            HStack(spacing: 10) {
                ForEach(Array(towers.enumerated()), id: \.offset) { _, tower in
                    TowerCard(tower: tower)
                }
            }
        }
    }
}

private struct TowerCard: View {
    let tower: TowerInfo

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: tower.icon)
                .font(.title3)
                .foregroundColor(tower.color)

            Text("\(tower.units)")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.textPrimary)

            VStack(spacing: 2) {
                Text(tower.name)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
                Text(tower.type)
                    .font(.caption2)
                    .foregroundColor(.textSecondary)
                Text("L\(tower.levels)")
                    .font(.caption2)
                    .foregroundColor(tower.color.opacity(0.8))
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(tower.color.opacity(0.25), lineWidth: 1)
        )
    }
}

// MARK: - Bedroom Distribution

private struct BedroomDistributionSection: View {
    let summaries: [BedroomSummary]
    let totalUnits: Int

    var body: some View {
        SectionCard(title: "Bedroom Distribution", icon: "chart.bar.fill") {
            VStack(spacing: 14) {
                // Stacked horizontal bar
                GeometryReader { geo in
                    HStack(spacing: 2) {
                        ForEach(summaries) { summary in
                            let width = geo.size.width * CGFloat(summary.mixPct)
                            RoundedRectangle(cornerRadius: 4)
                                .fill(summary.color)
                                .frame(width: max(width, 6), height: 28)
                                .overlay(
                                    Text(width > 40 ? "\(Int(summary.mixPct * 100))%" : "")
                                        .font(.caption2)
                                        .fontWeight(.bold)
                                        .foregroundColor(.white)
                                )
                        }
                    }
                }
                .frame(height: 28)

                // Detail rows
                ForEach(summaries) { summary in
                    BedroomDistributionRow(summary: summary, totalUnits: totalUnits)
                }

                // Tenure split header
                Divider()

                HStack {
                    Text("")
                        .frame(width: 50)
                    Spacer()
                    Text("Rental")
                        .font(.caption2)
                        .foregroundColor(.oceanSwell)
                        .frame(width: 52, alignment: .trailing)
                    Text("Condo")
                        .font(.caption2)
                        .foregroundColor(.green)
                        .frame(width: 52, alignment: .trailing)
                    Text("Liner")
                        .font(.caption2)
                        .foregroundColor(.sunlight)
                        .frame(width: 46, alignment: .trailing)
                    Text("Total")
                        .font(.caption2)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                        .frame(width: 46, alignment: .trailing)
                }

                ForEach(summaries) { summary in
                    HStack {
                        HStack(spacing: 6) {
                            Circle().fill(summary.color).frame(width: 8, height: 8)
                            Text(summary.label)
                                .font(.caption)
                                .foregroundColor(.textSecondary)
                        }
                        .frame(width: 50, alignment: .leading)

                        Spacer()

                        Text("\(summary.rental)")
                            .font(.caption)
                            .foregroundColor(.oceanSwell)
                            .frame(width: 52, alignment: .trailing)
                        Text("\(summary.condoApt)")
                            .font(.caption)
                            .foregroundColor(.green)
                            .frame(width: 52, alignment: .trailing)
                        Text("\(summary.condoLiner)")
                            .font(.caption)
                            .foregroundColor(summary.condoLiner > 0 ? .sunlight : .textSecondary.opacity(0.4))
                            .frame(width: 46, alignment: .trailing)
                        Text("\(summary.subtotal)")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.textPrimary)
                            .frame(width: 46, alignment: .trailing)
                    }
                }
            }
        }
    }
}

private struct BedroomDistributionRow: View {
    let summary: BedroomSummary
    let totalUnits: Int

    var body: some View {
        HStack(spacing: 10) {
            // Bedroom label
            HStack(spacing: 6) {
                Circle().fill(summary.color).frame(width: 8, height: 8)
                Text(summary.label)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.textPrimary)
            }
            .frame(width: 54, alignment: .leading)

            // Proportion bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.bgHover)
                        .frame(height: 8)
                    RoundedRectangle(cornerRadius: 3)
                        .fill(summary.color)
                        .frame(width: geo.size.width * CGFloat(summary.mixPct), height: 8)
                }
            }
            .frame(height: 8)

            // Count + percentage
            VStack(alignment: .trailing, spacing: 0) {
                Text("\(summary.subtotal)")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
                Text(String(format: "%.1f%%", summary.mixPct * 100))
                    .font(.caption2)
                    .foregroundColor(.textSecondary)
            }
            .frame(width: 44, alignment: .trailing)
        }
    }
}

// MARK: - Prototype Explorer

private struct PrototypeExplorerSection: View {
    let prototypes: [UnitPrototype]
    let bedroomSummaries: [BedroomSummary]

    @State private var selectedBedroom: Int? = nil

    var filteredPrototypes: [UnitPrototype] {
        if let bd = selectedBedroom {
            return prototypes.filter { $0.bedroomCount == bd }
        }
        return prototypes
    }

    var maxGfa: Int {
        prototypes.map(\.gfaSf).max() ?? 1
    }

    var body: some View {
        SectionCard(title: "Prototype Catalog", icon: "square.grid.3x3") {
            VStack(spacing: 12) {
                // Filter pills
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        PrototypeFilterPill(label: "All", count: prototypes.count, isSelected: selectedBedroom == nil, color: .oceanSwell) {
                            withAnimation(.smoothSpring) { selectedBedroom = nil }
                        }
                        ForEach(bedroomSummaries) { summary in
                            PrototypeFilterPill(
                                label: summary.label,
                                count: summary.uniqueTypes,
                                isSelected: selectedBedroom == summary.bedroomCount,
                                color: summary.color
                            ) {
                                withAnimation(.smoothSpring) { selectedBedroom = summary.bedroomCount }
                            }
                        }
                    }
                }

                // Subtitle
                HStack {
                    Text("\(filteredPrototypes.count) unique prototypes")
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                    Spacer()
                    Text("GFA (sf)")
                        .font(.caption2)
                        .foregroundColor(.textSecondary)
                }

                // Prototype cards
                ForEach(filteredPrototypes) { proto in
                    PrototypeCard(prototype: proto, maxGfa: maxGfa)
                }
            }
        }
    }
}

private struct PrototypeFilterPill: View {
    let label: String
    let count: Int
    let isSelected: Bool
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Text(label)
                    .fontWeight(isSelected ? .semibold : .regular)
                Text("\(count)")
                    .font(.caption2)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 1)
                    .background(isSelected ? Color.white.opacity(0.2) : Color.bgHover)
                    .clipShape(Capsule())
            }
            .font(.caption)
            .foregroundColor(isSelected ? .midnight : .textSecondary)
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .background(isSelected ? color : Color.bgSurface)
            .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }
}

private struct PrototypeCard: View {
    let prototype: UnitPrototype
    let maxGfa: Int

    var body: some View {
        VStack(spacing: 8) {
            // Header row
            HStack {
                // Type ID badge
                Text(prototype.id)
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(prototype.bedroomCount.bedroomColor)
                    .clipShape(Capsule())

                // Category badge
                HStack(spacing: 3) {
                    Image(systemName: prototype.category.icon)
                        .font(.caption2)
                    Text(prototype.category.rawValue)
                        .font(.caption2)
                }
                .foregroundColor(prototype.category.color)

                Spacer()

                // Unit count
                Text("\(prototype.unitCount) units")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.textPrimary)
            }

            // GFA bar
            HStack(spacing: 8) {
                Text("\(prototype.gfaSf) sf")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.textPrimary)
                    .frame(width: 56, alignment: .leading)

                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Color.bgHover)
                            .frame(height: 8)
                        RoundedRectangle(cornerRadius: 3)
                            .fill(prototype.bedroomCount.bedroomColor.opacity(0.7))
                            .frame(width: geo.size.width * CGFloat(prototype.gfaSf) / CGFloat(maxGfa), height: 8)
                    }
                }
                .frame(height: 8)
            }

            // Info row
            HStack(spacing: 12) {
                HStack(spacing: 3) {
                    Image(systemName: "building.2")
                        .font(.caption2)
                    Text(prototype.towers)
                        .font(.caption2)
                }
                .foregroundColor(.textSecondary)

                HStack(spacing: 3) {
                    Image(systemName: "arrow.up.arrow.down")
                        .font(.caption2)
                    Text("L\(prototype.levels)")
                        .font(.caption2)
                }
                .foregroundColor(.textSecondary)

                Spacer()
            }

            // Notes
            if !prototype.notes.isEmpty {
                Text(prototype.notes)
                    .font(.caption2)
                    .foregroundColor(.textSecondary.opacity(0.7))
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding(12)
        .background(Color.bgSurface)
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

// MARK: - Floor-by-Floor Section

private struct FloorByFloorSection: View {
    let floors: [FloorBreakdown]

    private var residentialFloors: [FloorBreakdown] {
        floors.filter { $0.total > 0 }
    }

    private var maxUnitsPerFloor: Int {
        residentialFloors.map(\.total).max() ?? 1
    }

    var body: some View {
        SectionCard(title: "Floor-by-Floor", icon: "square.stack.3d.up") {
            VStack(spacing: 6) {
                // Legend
                HStack(spacing: 14) {
                    HStack(spacing: 4) {
                        RoundedRectangle(cornerRadius: 2).fill(Color.oceanSwell).frame(width: 12, height: 8)
                        Text("Rental").font(.caption2).foregroundColor(.textSecondary)
                    }
                    HStack(spacing: 4) {
                        RoundedRectangle(cornerRadius: 2).fill(Color.green).frame(width: 12, height: 8)
                        Text("Condo").font(.caption2).foregroundColor(.textSecondary)
                    }
                    HStack(spacing: 4) {
                        RoundedRectangle(cornerRadius: 2).fill(Color.sunlight).frame(width: 12, height: 8)
                        Text("Liner").font(.caption2).foregroundColor(.textSecondary)
                    }
                    Spacer()
                }
                .padding(.bottom, 4)

                // Floor rows (reversed so top floor is at top)
                ForEach(residentialFloors.reversed()) { floor in
                    FloorRow(floor: floor, maxUnits: maxUnitsPerFloor)
                }
            }
        }
    }
}

private struct FloorRow: View {
    let floor: FloorBreakdown
    let maxUnits: Int

    var body: some View {
        HStack(spacing: 6) {
            // Level label
            Text(floor.levelDisplay)
                .font(.caption2)
                .fontWeight(.medium)
                .foregroundColor(.textSecondary)
                .frame(width: 22, alignment: .trailing)

            // Classification icon
            Image(systemName: classificationIcon)
                .font(.caption2)
                .foregroundColor(classificationColor)
                .frame(width: 14)

            // Stacked bar
            GeometryReader { geo in
                HStack(spacing: 1) {
                    if floor.rental > 0 {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color.oceanSwell)
                            .frame(width: barWidth(for: floor.rental, in: geo.size.width))
                    }
                    if floor.condo > 0 {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color.green)
                            .frame(width: barWidth(for: floor.condo, in: geo.size.width))
                    }
                    if floor.liner > 0 {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color.sunlight)
                            .frame(width: barWidth(for: floor.liner, in: geo.size.width))
                    }
                    Spacer(minLength: 0)
                }
            }
            .frame(height: 14)

            // Total
            Text("\(floor.total)")
                .font(.caption2)
                .fontWeight(.medium)
                .foregroundColor(.textPrimary)
                .frame(width: 26, alignment: .trailing)
        }
    }

    private func barWidth(for value: Int, in totalWidth: CGFloat) -> CGFloat {
        max(totalWidth * CGFloat(value) / CGFloat(maxUnits), 3)
    }

    private var classificationIcon: String {
        switch floor.classification {
        case "Podium": return "square.grid.2x2"
        case "Resi + Clubhouse": return "star"
        case "Residential": return "building.2"
        default: return "car"  // Parking + Liners
        }
    }

    private var classificationColor: Color {
        switch floor.classification {
        case "Podium": return .purple
        case "Resi + Clubhouse": return .pink
        case "Residential": return .oceanSwell
        default: return .sunlight
        }
    }
}

// MARK: - Size Range Section

private struct SizeRangeSection: View {
    let summaries: [BedroomSummary]

    private var maxSf: Int {
        summaries.map(\.maxGfa).max() ?? 1
    }

    var body: some View {
        SectionCard(title: "Size Ranges", icon: "ruler") {
            VStack(spacing: 12) {
                ForEach(summaries) { summary in
                    SizeRangeRow(summary: summary, maxSf: maxSf)
                }
            }
        }
    }
}

private struct SizeRangeRow: View {
    let summary: BedroomSummary
    let maxSf: Int

    var body: some View {
        VStack(spacing: 6) {
            HStack {
                HStack(spacing: 6) {
                    Circle().fill(summary.color).frame(width: 8, height: 8)
                    Text(summary.label)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.textPrimary)
                }

                Spacer()

                Text("\(summary.uniqueTypes) types")
                    .font(.caption2)
                    .foregroundColor(.textSecondary)

                Text("Min. \(summary.minApprovedSf) sf")
                    .font(.caption2)
                    .foregroundColor(.textSecondary.opacity(0.6))
            }

            // Range bar
            GeometryReader { geo in
                let totalWidth = geo.size.width
                let startPct = CGFloat(summary.minGfa) / CGFloat(maxSf)
                let endPct = CGFloat(summary.maxGfa) / CGFloat(maxSf)
                let barStart = totalWidth * startPct
                let barWidth = max(totalWidth * (endPct - startPct), 8)

                ZStack(alignment: .leading) {
                    // Track
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.bgHover)
                        .frame(height: 10)

                    // Range bar
                    RoundedRectangle(cornerRadius: 3)
                        .fill(
                            LinearGradient(
                                colors: [summary.color.opacity(0.6), summary.color],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: barWidth, height: 10)
                        .offset(x: barStart)
                }
            }
            .frame(height: 10)

            // Labels
            HStack {
                Text("\(summary.minGfa) sf")
                    .font(.caption2)
                    .foregroundColor(summary.color)
                Spacer()
                Text("\(summary.maxGfa) sf")
                    .font(.caption2)
                    .foregroundColor(summary.color)
            }
        }
        .padding(10)
        .background(Color.bgSurface)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        UnitStudyView(project: UnitStudyDatabase.aventura)
    }
}
