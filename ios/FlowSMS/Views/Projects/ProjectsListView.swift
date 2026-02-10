import SwiftUI

struct ProjectsListView: View {
    @StateObject private var viewModel = BuildingsListViewModel()
    @State private var selectedTab: BuildingStatus? = nil
    @State private var searchText = ""

    var filteredBuildings: [BuildingInfo] {
        var buildings: [BuildingInfo]

        // Filter by status tab
        if let tab = selectedTab {
            switch tab {
            case .PIT:
                buildings = viewModel.response?.grouped.pit ?? []
            case .POT:
                buildings = viewModel.response?.grouped.pot ?? []
            case .PHT:
                buildings = viewModel.response?.grouped.pht ?? []
            case .unknown:
                buildings = viewModel.response?.buildings ?? []
            }
        } else {
            buildings = viewModel.response?.buildings ?? []
        }

        // Search filter
        if !searchText.isEmpty {
            buildings = buildings.filter {
                $0.identity.displayName.localizedCaseInsensitiveContains(searchText) ||
                $0.identity.plotNo.localizedCaseInsensitiveContains(searchText) ||
                $0.identity.designManager.localizedCaseInsensitiveContains(searchText)
            }
        }

        return buildings
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Stats Summary
                if let stats = viewModel.response?.stats {
                    StatsRow(stats: stats)
                }

                // Status Tab Pills
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        StatusPill(
                            title: "All",
                            count: viewModel.response?.stats.totalBuildings ?? 0,
                            isSelected: selectedTab == nil,
                            color: .oceanSwell
                        ) {
                            selectedTab = nil
                        }

                        StatusPill(
                            title: "PIT",
                            count: viewModel.response?.stats.byStatus.pit ?? 0,
                            isSelected: selectedTab == .PIT,
                            color: .sunlight
                        ) {
                            selectedTab = .PIT
                        }

                        StatusPill(
                            title: "POT",
                            count: viewModel.response?.stats.byStatus.pot ?? 0,
                            isSelected: selectedTab == .POT,
                            color: .green
                        ) {
                            selectedTab = .POT
                        }

                        StatusPill(
                            title: "PHT",
                            count: viewModel.response?.stats.byStatus.pht ?? 0,
                            isSelected: selectedTab == .PHT,
                            color: .purple
                        ) {
                            selectedTab = .PHT
                        }
                    }
                    .padding(.horizontal)
                }

                if viewModel.isLoading {
                    LoadingSpinner()
                        .padding(.top, 50)
                } else if let error = viewModel.error {
                    BuildingsErrorView(message: error) {
                        Task { await viewModel.loadBuildings() }
                    }
                } else {
                    // Results count
                    HStack {
                        Text("\(filteredBuildings.count) projects")
                            .font(.caption)
                            .foregroundColor(.textSecondary)
                        Spacer()
                    }
                    .padding(.horizontal)

                    LazyVStack(spacing: 12) {
                        ForEach(Array(filteredBuildings.enumerated()), id: \.element.id) { index, building in
                            NavigationLink(destination: BuildingDetailView(buildingId: building.id)) {
                                BuildingListCard(building: building)
                            }
                            .buttonStyle(ScaleButtonStyle())
                            .animatedCard(index: index)
                        }
                    }
                    .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
        .background(Color.bgDark)
        .navigationTitle("Projects")
        .navigationBarTitleDisplayMode(.large)
        .searchable(text: $searchText, prompt: "Search projects...")
        .refreshable {
            await viewModel.loadBuildings()
        }
        .task {
            await viewModel.loadBuildings()
        }
    }
}

// MARK: - Stats Row

struct StatsRow: View {
    let stats: BuildingInfoStats

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                MiniStatCard(label: "Total", value: "\(stats.totalBuildings)", color: .oceanSwell)
                MiniStatCard(label: "Units", value: formatNumber(stats.totalUnits), color: .purple)
                MiniStatCard(label: "Miami", value: "\(stats.byLocation.miami)", color: .cyan)
                MiniStatCard(label: "Riyadh", value: "\(stats.byLocation.riyadh)", color: .sunlight)
            }
            .padding(.horizontal)
        }
    }

    func formatNumber(_ num: Double) -> String {
        if num >= 1_000_000 {
            return String(format: "%.1fM", num / 1_000_000)
        } else if num >= 1_000 {
            return String(format: "%.0fK", num / 1_000)
        }
        return String(format: "%.0f", num)
    }
}

struct MiniStatCard: View {
    let label: String
    let value: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundColor(.textSecondary)
            Text(value)
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(.textPrimary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(color.opacity(0.3), lineWidth: 1)
        )
    }
}

// MARK: - Status Pill

struct StatusPill: View {
    let title: String
    let count: Int
    let isSelected: Bool
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Text(title)
                    .fontWeight(isSelected ? .semibold : .regular)
                Text("\(count)")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(isSelected ? Color.white.opacity(0.2) : Color.bgHover)
                    .clipShape(Capsule())
                    .contentTransition(.numericText())
            }
            .font(.subheadline)
            .foregroundColor(isSelected ? .midnight : .textSecondary)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(isSelected ? color : Color.bgCard)
            .clipShape(Capsule())
            .scaleEffect(isSelected ? 1.02 : 1.0)
        }
        .buttonStyle(BounceButtonStyle())
        .animation(.smoothSpring, value: isSelected)
    }
}

// MARK: - Building List Card

struct BuildingListCard: View {
    let building: BuildingInfo

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack(alignment: .top) {
                // Location icon
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(
                            LinearGradient(
                                colors: building.identity.locationEnum == .MIA
                                    ? [.cyan, .oceanSwell]
                                    : [.sunlight, .orange],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 44, height: 44)

                    Text(String(building.identity.displayName.prefix(1)))
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(building.identity.displayName)
                        .font(.headline)
                        .foregroundColor(.textPrimary)
                        .lineLimit(1)

                    if !building.identity.plotNo.isEmpty {
                        Text(building.identity.plotNo)
                            .font(.caption)
                            .foregroundColor(.textSecondary)
                    }
                }

                Spacer()

                // Status badge
                Text(building.identity.statusEnum.shortName)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(building.identity.statusEnum.color)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(building.identity.statusEnum.color.opacity(0.15))
                    .clipShape(Capsule())
            }

            // Location & DM
            HStack(spacing: 16) {
                HStack(spacing: 4) {
                    Image(systemName: "mappin")
                        .font(.caption2)
                    Text(building.identity.locationEnum.displayName)
                        .font(.caption)
                }
                .foregroundColor(.textSecondary)

                if !building.identity.designManager.isEmpty {
                    HStack(spacing: 4) {
                        Image(systemName: "person")
                            .font(.caption2)
                        Text(building.identity.designManager)
                            .font(.caption)
                    }
                    .foregroundColor(.purple)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.textSecondary)
            }

            // Key metrics
            HStack(spacing: 0) {
                MetricItem(label: "Units", value: "\(Int(building.unitCounts.total))")
                Divider().frame(height: 30)
                MetricItem(label: "GFA", value: formatArea(building.gfa.totalProposedGfaFt2))
                Divider().frame(height: 30)
                MetricItem(
                    label: "Efficiency",
                    value: formatPercent(building.totalSellable.efficiencySaGfa),
                    highlight: building.totalSellable.efficiencySaGfa >= 0.9
                )
            }
            .padding(.vertical, 8)
            .background(Color.bgSurface)
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
        .padding(16)
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    func formatArea(_ value: Double) -> String {
        if value >= 1_000_000 {
            return String(format: "%.1fM", value / 1_000_000)
        } else if value >= 1_000 {
            return String(format: "%.0fK", value / 1_000)
        }
        return String(format: "%.0f", value)
    }

    func formatPercent(_ value: Double) -> String {
        return String(format: "%.1f%%", value * 100)
    }
}

struct MetricItem: View {
    let label: String
    let value: String
    var highlight: Bool = false

    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(highlight ? .green : .textPrimary)
            Text(label)
                .font(.caption2)
                .foregroundColor(.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Buildings Error View

struct BuildingsErrorView: View {
    let message: String
    let retryAction: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
                .foregroundColor(.sunlight)

            Text(message)
                .font(.subheadline)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)

            Button(action: retryAction) {
                Text("Retry")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.midnight)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 10)
                    .background(Color.oceanSwell)
                    .clipShape(Capsule())
            }
        }
        .padding()
    }
}

// MARK: - View Model

@MainActor
class BuildingsListViewModel: ObservableObject {
    @Published var response: BuildingInfoResponse?
    @Published var isLoading = false
    @Published var error: String?

    func loadBuildings() async {
        isLoading = true
        error = nil

        do {
            response = try await APIService.shared.fetchBuildings()
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }
}

#Preview {
    NavigationStack {
        ProjectsListView()
    }
}
