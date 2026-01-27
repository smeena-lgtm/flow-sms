import SwiftUI

struct ProjectDetailView: View {
    let projectId: String
    @StateObject private var viewModel = ProjectDetailViewModel()
    @State private var selectedTab = 0

    var body: some View {
        ScrollView {
            if viewModel.isLoading {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .oceanSwell))
                    .padding(.top, 50)
            } else if let project = viewModel.project {
                VStack(spacing: 20) {
                    // Header Card
                    VStack(alignment: .leading, spacing: 16) {
                        // Status & Type
                        HStack {
                            HStack(spacing: 6) {
                                Circle()
                                    .fill(statusColor(project.status))
                                    .frame(width: 8, height: 8)
                                Text(project.status.displayName)
                                    .font(.caption)
                                    .foregroundColor(.textSecondary)
                            }

                            Spacer()

                            Text(project.type.displayName)
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(typeColor(project.type))
                                .padding(.horizontal, 10)
                                .padding(.vertical, 4)
                                .background(typeColor(project.type).opacity(0.15))
                                .clipShape(Capsule())
                        }

                        // Project Name & Client
                        VStack(alignment: .leading, spacing: 4) {
                            Text(project.name)
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.textPrimary)

                            Text(project.client)
                                .font(.subheadline)
                                .foregroundColor(.textSecondary)
                        }

                        // Progress Bar
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("Progress")
                                    .font(.subheadline)
                                    .foregroundColor(.textSecondary)
                                Spacer()
                                Text("\(project.progress)%")
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.textPrimary)
                            }

                            GeometryReader { geometry in
                                ZStack(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(Color.bgHover)
                                        .frame(height: 8)

                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(Color.oceanSwell)
                                        .frame(width: geometry.size.width * CGFloat(project.progress) / 100, height: 8)
                                }
                            }
                            .frame(height: 8)
                        }
                    }
                    .padding(20)
                    .background(Color.bgCard)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .padding(.horizontal)

                    // Info Cards
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        InfoCard(icon: "calendar", title: "Timeline", value: formatTimeline(project))
                        InfoCard(icon: "mappin", title: "Location", value: project.location ?? "N/A")
                        InfoCard(icon: "person.2", title: "Team Size", value: "\(project.team.count) members")
                        InfoCard(icon: "doc.text", title: "Description", value: project.description ?? "No description")
                    }
                    .padding(.horizontal)

                    // Team Section
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Team Members")
                            .font(.headline)
                            .foregroundColor(.textPrimary)
                            .padding(.horizontal)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                ForEach(project.team) { member in
                                    TeamMemberCard(member: member)
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
                }
                .padding(.vertical)
            } else if let error = viewModel.error {
                ErrorView(message: error) {
                    Task { await viewModel.loadProject(id: projectId) }
                }
            }
        }
        .background(Color.bgDark)
        .navigationTitle("Project Details")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadProject(id: projectId)
        }
    }

    private func statusColor(_ status: ProjectStatus) -> Color {
        switch status {
        case .active: return .oceanSwell
        case .on_hold: return .sunlight
        case .completed: return .green
        case .planning, .archived: return .textSecondary
        }
    }

    private func typeColor(_ type: ProjectType) -> Color {
        switch type {
        case .architecture: return .oceanSwell
        case .interior: return .heart
        case .engineering: return .sunlight
        case .mixed: return .olive
        }
    }

    private func formatTimeline(_ project: Project) -> String {
        guard let start = project.startDate, let end = project.endDate else {
            return "N/A"
        }

        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        let displayFormatter = DateFormatter()
        displayFormatter.dateFormat = "MMM yyyy"

        if let startDate = formatter.date(from: start),
           let endDate = formatter.date(from: end) {
            return "\(displayFormatter.string(from: startDate)) - \(displayFormatter.string(from: endDate))"
        }

        return "N/A"
    }
}

// MARK: - Info Card

struct InfoCard: View {
    let icon: String
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.subheadline)
                    .foregroundColor(.oceanSwell)

                Text(title)
                    .font(.caption)
                    .foregroundColor(.textSecondary)
            }

            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.textPrimary)
                .lineLimit(2)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

// MARK: - Team Member Card

struct TeamMemberCard: View {
    let member: TeamMember

    var body: some View {
        VStack(spacing: 8) {
            Circle()
                .fill(LinearGradient(
                    colors: [.oceanSwell, .heart],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ))
                .frame(width: 50, height: 50)
                .overlay(
                    Text(initials(from: member.name))
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.midnight)
                )

            Text(member.name)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.textPrimary)
                .lineLimit(1)

            if let role = member.role {
                Text(role)
                    .font(.caption2)
                    .foregroundColor(.textSecondary)
                    .lineLimit(1)
            }
        }
        .frame(width: 80)
    }

    private func initials(from name: String) -> String {
        name.split(separator: " ")
            .prefix(2)
            .compactMap { $0.first }
            .map { String($0) }
            .joined()
    }
}

// MARK: - View Model

@MainActor
class ProjectDetailViewModel: ObservableObject {
    @Published var project: Project?
    @Published var isLoading = false
    @Published var error: String?

    func loadProject(id: String) async {
        isLoading = true
        error = nil

        do {
            project = try await APIService.shared.fetchProject(id: id)
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }
}

#Preview {
    NavigationStack {
        ProjectDetailView(projectId: "1")
    }
}
