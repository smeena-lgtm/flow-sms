import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    if viewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .oceanSwell))
                            .padding(.top, 50)
                    } else if let error = viewModel.error {
                        ErrorView(message: error) {
                            Task { await viewModel.loadDashboard() }
                        }
                    } else {
                        // Stats Grid
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 12) {
                            StatCard(
                                title: "Active Projects",
                                value: viewModel.stats?.activeProjects ?? 0,
                                icon: "folder.fill",
                                trendValue: 8,
                                trendPositive: true
                            )

                            StatCard(
                                title: "Team Members",
                                value: viewModel.stats?.totalMembers ?? 0,
                                icon: "person.2.fill",
                                trendValue: 4,
                                trendPositive: true
                            )

                            StatCard(
                                title: "Pending Tasks",
                                value: viewModel.stats?.pendingTasks ?? 0,
                                icon: "clock.fill",
                                trendValue: 12,
                                trendPositive: false
                            )

                            StatCard(
                                title: "Completed",
                                value: viewModel.stats?.completedThisMonth ?? 0,
                                icon: "checkmark.circle.fill",
                                trendValue: 25,
                                trendPositive: true
                            )
                        }
                        .padding(.horizontal)

                        // Recent Projects
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("Recent Projects")
                                    .font(.headline)
                                    .foregroundColor(.textPrimary)

                                Spacer()

                                NavigationLink(destination: ProjectsListView()) {
                                    Text("View all")
                                        .font(.subheadline)
                                        .foregroundColor(.oceanSwell)
                                }
                            }
                            .padding(.horizontal)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 12) {
                                    ForEach(viewModel.recentProjects) { project in
                                        NavigationLink(destination: ProjectDetailView(projectId: project.id)) {
                                            ProjectCard(project: project)
                                                .frame(width: 280)
                                        }
                                        .buttonStyle(PlainButtonStyle())
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }

                        // Upcoming Milestones
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Upcoming Milestones")
                                .font(.headline)
                                .foregroundColor(.textPrimary)
                                .padding(.horizontal)

                            VStack(spacing: 8) {
                                ForEach(viewModel.upcomingMilestones) { milestone in
                                    MilestoneRow(milestone: milestone)
                                }
                            }
                            .padding(.horizontal)
                        }

                        // Recent Activity
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Recent Activity")
                                .font(.headline)
                                .foregroundColor(.textPrimary)
                                .padding(.horizontal)

                            VStack(spacing: 16) {
                                ForEach(viewModel.recentActivities) { activity in
                                    ActivityRow(activity: activity)
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
                }
                .padding(.vertical)
            }
            .background(Color.bgDark)
            .navigationTitle("Dashboard")
            .navigationBarTitleDisplayMode(.large)
            .toolbarBackground(Color.bgCard, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .refreshable {
                await viewModel.loadDashboard()
            }
        }
        .task {
            await viewModel.loadDashboard()
        }
    }
}

// MARK: - Error View

struct ErrorView: View {
    let message: String
    let onRetry: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "wifi.exclamationmark")
                .font(.largeTitle)
                .foregroundColor(.textSecondary)

            Text("Connection Error")
                .font(.headline)
                .foregroundColor(.textPrimary)

            Text(message)
                .font(.subheadline)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)

            Button(action: onRetry) {
                Text("Try Again")
                    .fontWeight(.medium)
                    .foregroundColor(.midnight)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.oceanSwell)
                    .clipShape(Capsule())
            }
        }
        .padding()
    }
}

// MARK: - View Model

@MainActor
class DashboardViewModel: ObservableObject {
    @Published var stats: DashboardStats?
    @Published var recentProjects: [DashboardProject] = []
    @Published var upcomingMilestones: [DashboardMilestone] = []
    @Published var recentActivities: [DashboardActivity] = []
    @Published var isLoading = false
    @Published var error: String?

    func loadDashboard() async {
        isLoading = true
        error = nil

        do {
            let response = try await APIService.shared.fetchDashboard()
            stats = response.stats
            recentProjects = response.recentProjects
            upcomingMilestones = response.upcomingMilestones
            recentActivities = response.recentActivities
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }
}

#Preview {
    DashboardView()
}
