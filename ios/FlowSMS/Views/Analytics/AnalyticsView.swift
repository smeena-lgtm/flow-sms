import SwiftUI

struct AnalyticsView: View {
    @StateObject private var viewModel = AnalyticsViewModel()
    @State private var contentLoaded = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                if viewModel.isLoading {
                    // Skeleton Loading
                    VStack(spacing: 20) {
                        SkeletonSection(title: "Overview", itemCount: 4)
                        SkeletonSection(title: "Building KPIs", itemCount: 2)
                        SkeletonSection(title: "By Location", itemCount: 2)
                    }
                    .transition(.opacity)
                } else if let error = viewModel.error {
                    ErrorStateView(message: error) {
                        Task { await viewModel.loadData() }
                    }
                    .transition(.fadeScale)
                } else {
                    // Top Stats Grid
                    TopStatsSection(stats: viewModel.buildingStats)
                        .animatedCard(index: 0)

                    // Building KPIs
                    BuildingKPIsSection(stats: viewModel.buildingStats)
                        .animatedCard(index: 1)

                    // Location Distribution
                    LocationDistributionSection(stats: viewModel.buildingStats)
                        .animatedCard(index: 2)

                    // Status Distribution
                    StatusDistributionSection(stats: viewModel.buildingStats)
                        .animatedCard(index: 3)

                    // HR Summary
                    if let hrStats = viewModel.hrStats {
                        HRSummarySection(hrStats: hrStats)
                            .animatedCard(index: 4)
                    }
                }
            }
            .padding()
        }
        .background(Color.bgDark)
        .navigationTitle("Analytics")
        .navigationBarTitleDisplayMode(.large)
        .refreshable {
            await viewModel.loadData()
        }
        .task {
            await viewModel.loadData()
        }
    }
}

// MARK: - Skeleton Loading

struct SkeletonSection: View {
    let title: String
    let itemCount: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            SkeletonView(height: 20)
                .frame(width: 100)

            if itemCount == 4 {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    ForEach(0..<itemCount, id: \.self) { _ in
                        SkeletonView(height: 80)
                    }
                }
            } else {
                HStack(spacing: 12) {
                    ForEach(0..<itemCount, id: \.self) { _ in
                        SkeletonView(height: 80)
                    }
                }
            }
        }
    }
}

// MARK: - Error State View

struct ErrorStateView: View {
    let message: String
    let retryAction: () -> Void
    @State private var isVisible = false

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(.sunlight)
                .scaleEffect(isVisible ? 1 : 0.5)

            Text(message)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .opacity(isVisible ? 1 : 0)

            Button(action: retryAction) {
                HStack(spacing: 8) {
                    Image(systemName: "arrow.clockwise")
                    Text("Retry")
                }
                .foregroundColor(.midnight)
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(Color.oceanSwell)
                .clipShape(Capsule())
            }
            .buttonStyle(BounceButtonStyle())
            .opacity(isVisible ? 1 : 0)
        }
        .padding(.top, 100)
        .onAppear {
            withAnimation(.smoothSpring) {
                isVisible = true
            }
        }
    }
}

// MARK: - Top Stats Section

struct TopStatsSection: View {
    let stats: BuildingInfoStats?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Overview")
                .font(.headline)
                .foregroundColor(.textPrimary)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                AnalyticsStatCard(
                    title: "Total Buildings",
                    value: "\(stats?.totalBuildings ?? 0)",
                    icon: "building.2.fill",
                    color: .oceanSwell,
                    index: 0
                )

                AnalyticsStatCard(
                    title: "Total Units",
                    value: formatNumber(Double(stats?.totalUnits ?? 0)),
                    icon: "house.fill",
                    color: .purple,
                    index: 1
                )

                AnalyticsStatCard(
                    title: "Total GFA",
                    value: formatArea(stats?.totalGfaFt2 ?? 0),
                    icon: "square.grid.3x3.fill",
                    color: .green,
                    index: 2
                )

                AnalyticsStatCard(
                    title: "Avg Efficiency",
                    value: formatPercent(stats?.avgEfficiency ?? 0),
                    icon: "chart.line.uptrend.xyaxis",
                    color: .sunlight,
                    index: 3
                )
            }
        }
    }

    func formatNumber(_ num: Double) -> String {
        if num >= 1_000_000 {
            return String(format: "%.1fM", num / 1_000_000)
        } else if num >= 1_000 {
            return String(format: "%.1fK", num / 1_000)
        }
        return String(format: "%.0f", num)
    }

    func formatArea(_ value: Double) -> String {
        if value >= 1_000_000 {
            return String(format: "%.1fM ft²", value / 1_000_000)
        } else if value >= 1_000 {
            return String(format: "%.0fK ft²", value / 1_000)
        }
        return String(format: "%.0f ft²", value)
    }

    func formatPercent(_ value: Double) -> String {
        return String(format: "%.1f%%", value * 100)
    }
}

struct AnalyticsStatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    var index: Int = 0
    @State private var isPressed = false
    @State private var isVisible = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.textSecondary)
                Spacer()
                Image(systemName: icon)
                    .foregroundColor(color)
                    .scaleEffect(isVisible ? 1 : 0.5)
            }

            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.textPrimary)
                .contentTransition(.numericText())
        }
        .padding()
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(color.opacity(isPressed ? 0.5 : 0), lineWidth: 2)
        )
        .scaleEffect(isPressed ? 0.97 : 1.0)
        .animation(.quickSpring, value: isPressed)
        .onTapGesture {
            withAnimation(.quickSpring) {
                isPressed = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                withAnimation(.quickSpring) {
                    isPressed = false
                }
            }
        }
        .onAppear {
            withAnimation(.smoothSpring.delay(Double(index) * 0.08)) {
                isVisible = true
            }
        }
    }
}

// MARK: - Building KPIs Section

struct BuildingKPIsSection: View {
    let stats: BuildingInfoStats?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Building KPIs")
                .font(.headline)
                .foregroundColor(.textPrimary)

            HStack(spacing: 12) {
                AnalyticsKPICard(title: "Avg FAR", value: String(format: "%.2f", stats?.avgFar ?? 0), color: .cyan, index: 0)
                AnalyticsKPICard(title: "Total Parking", value: formatNumber(stats?.totalParking ?? 0), color: .orange, index: 1)
            }
        }
    }

    func formatNumber(_ num: Double) -> String {
        if num >= 1_000 {
            return String(format: "%.1fK", num / 1_000)
        }
        return String(format: "%.0f", num)
    }
}

struct AnalyticsKPICard: View {
    let title: String
    let value: String
    let color: Color
    var index: Int = 0
    @State private var isVisible = false

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(color)
                .scaleEffect(isVisible ? 1 : 0.8)
            Text(title)
                .font(.caption)
                .foregroundColor(.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .onAppear {
            withAnimation(.smoothSpring.delay(Double(index) * 0.1)) {
                isVisible = true
            }
        }
    }
}

// MARK: - Location Distribution

struct LocationDistributionSection: View {
    let stats: BuildingInfoStats?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("By Location")
                .font(.headline)
                .foregroundColor(.textPrimary)

            HStack(spacing: 12) {
                LocationCard(
                    location: "Miami",
                    count: stats?.byLocation.miami ?? 0,
                    color: .cyan,
                    icon: "building.2.fill",
                    index: 0
                )
                LocationCard(
                    location: "Riyadh",
                    count: stats?.byLocation.riyadh ?? 0,
                    color: .sunlight,
                    icon: "building.columns.fill",
                    index: 1
                )
            }
        }
    }
}

struct LocationCard: View {
    let location: String
    let count: Int
    let color: Color
    let icon: String
    var index: Int = 0
    @State private var isVisible = false
    @State private var iconScale: CGFloat = 0.5

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(location)
                    .font(.subheadline)
                    .foregroundColor(.textSecondary)
                Text("\(count)")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.textPrimary)
                    .contentTransition(.numericText())
                Text("buildings")
                    .font(.caption)
                    .foregroundColor(.textSecondary)
            }
            Spacer()
            Image(systemName: icon)
                .font(.title)
                .foregroundColor(color)
                .scaleEffect(iconScale)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(
            LinearGradient(
                colors: [color.opacity(0.2), Color.bgCard],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .opacity(isVisible ? 1 : 0)
        .offset(x: isVisible ? 0 : (index == 0 ? -20 : 20))
        .onAppear {
            withAnimation(.smoothSpring.delay(Double(index) * 0.1)) {
                isVisible = true
            }
            withAnimation(.bouncy.delay(0.3 + Double(index) * 0.1)) {
                iconScale = 1.0
            }
        }
    }
}

// MARK: - Status Distribution

struct StatusDistributionSection: View {
    let stats: BuildingInfoStats?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("By Status")
                .font(.headline)
                .foregroundColor(.textPrimary)

            HStack(spacing: 8) {
                StatusBadge(status: "PIT", count: stats?.byStatus.pit ?? 0, color: .sunlight, index: 0)
                StatusBadge(status: "POT", count: stats?.byStatus.pot ?? 0, color: .green, index: 1)
                StatusBadge(status: "PHT", count: stats?.byStatus.pht ?? 0, color: .purple, index: 2)
            }
        }
    }
}

struct StatusBadge: View {
    let status: String
    let count: Int
    let color: Color
    var index: Int = 0
    @State private var isVisible = false

    var body: some View {
        VStack(spacing: 8) {
            Text("\(count)")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.textPrimary)
                .contentTransition(.numericText())
            Text(status)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(color)
                .padding(.horizontal, 12)
                .padding(.vertical, 4)
                .background(color.opacity(0.2))
                .clipShape(Capsule())
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .scaleEffect(isVisible ? 1 : 0.8)
        .opacity(isVisible ? 1 : 0)
        .onAppear {
            withAnimation(.bouncy.delay(Double(index) * 0.08)) {
                isVisible = true
            }
        }
    }
}

// MARK: - HR Summary Section

struct HRSummarySection: View {
    let hrStats: HRStats

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Team Summary")
                .font(.headline)
                .foregroundColor(.textPrimary)

            HStack(spacing: 8) {
                OfficeCard(office: "MIA", count: hrStats.mia, color: .cyan, index: 0)
                OfficeCard(office: "KSA", count: hrStats.ksa, color: .sunlight, index: 1)
                OfficeCard(office: "DXB", count: hrStats.dxb, color: .purple, index: 2)
            }
        }
    }
}

struct OfficeCard: View {
    let office: String
    let count: Int
    let color: Color
    var index: Int = 0
    @State private var isVisible = false

    var body: some View {
        VStack(spacing: 4) {
            Text("\(count)")
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(.textPrimary)
                .contentTransition(.numericText())
            Text(office)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(color)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(color.opacity(isVisible ? 0.3 : 0), lineWidth: 1)
        )
        .scaleEffect(isVisible ? 1 : 0.9)
        .opacity(isVisible ? 1 : 0)
        .onAppear {
            withAnimation(.smoothSpring.delay(Double(index) * 0.08)) {
                isVisible = true
            }
        }
    }
}

// MARK: - View Model

@MainActor
class AnalyticsViewModel: ObservableObject {
    @Published var buildingStats: BuildingInfoStats?
    @Published var hrStats: HRStats?
    @Published var isLoading = false
    @Published var error: String?

    func loadData() async {
        withAnimation(.smoothSpring) {
            isLoading = true
        }
        error = nil

        do {
            // Load building data
            let buildingResponse = try await APIService.shared.fetchBuildings()
            withAnimation(.smoothSpring) {
                buildingStats = buildingResponse.stats
            }

            // Load HR data
            do {
                let stats = try await APIService.shared.fetchHRStats()
                withAnimation(.smoothSpring) {
                    hrStats = stats
                }
            } catch {
                // HR is optional, don't fail the whole view
                print("HR stats failed: \(error)")
            }
        } catch {
            withAnimation(.smoothSpring) {
                self.error = error.localizedDescription
            }
        }

        withAnimation(.smoothSpring) {
            isLoading = false
        }
    }
}

// MARK: - HR Stats Model

struct HRStats: Codable {
    var mia: Int = 0
    var ksa: Int = 0
    var dxb: Int = 0
    var tbj: Int = 0
    var total: Int = 0
}

#Preview {
    NavigationStack {
        AnalyticsView()
    }
}
