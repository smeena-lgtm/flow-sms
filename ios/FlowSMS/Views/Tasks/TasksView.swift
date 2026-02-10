import SwiftUI

struct TasksView: View {
    @StateObject private var viewModel = TasksViewModel()
    @State private var selectedStatus: TaskStatus? = nil

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                if viewModel.isLoading {
                    Spacer()
                    LoadingSpinner()
                    Spacer()
                } else if let error = viewModel.error {
                    Spacer()
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.largeTitle)
                            .foregroundColor(.sunlight)
                        Text(error)
                            .foregroundColor(.textSecondary)
                        Button("Retry") {
                            Task { await viewModel.loadData() }
                        }
                        .foregroundColor(.oceanSwell)
                    }
                    Spacer()
                } else {
                    // Stats Summary
                    TaskStatsRow(stats: viewModel.stats)

                    // Status Tabs
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            TaskStatusPill(
                                title: "All",
                                count: viewModel.stats.total,
                                isSelected: selectedStatus == nil,
                                color: .oceanSwell
                            ) {
                                selectedStatus = nil
                            }

                            ForEach(TaskStatus.allCases, id: \.self) { status in
                                TaskStatusPill(
                                    title: status.displayName,
                                    count: viewModel.countFor(status: status),
                                    isSelected: selectedStatus == status,
                                    color: status.color
                                ) {
                                    selectedStatus = status
                                }
                            }
                        }
                        .padding(.horizontal)
                    }

                    // Tasks List
                    LazyVStack(spacing: 12) {
                        ForEach(Array(filteredTasks.enumerated()), id: \.element.id) { index, task in
                            TaskCard(task: task)
                                .animatedCard(index: index)
                        }
                    }
                    .padding(.horizontal)

                    if filteredTasks.isEmpty {
                        VStack(spacing: 16) {
                            Image(systemName: "checklist")
                                .font(.system(size: 48))
                                .foregroundColor(.textSecondary)
                            Text("No tasks found")
                                .foregroundColor(.textSecondary)
                        }
                        .padding(.top, 40)
                    }
                }
            }
            .padding(.vertical)
        }
        .background(Color.bgDark)
        .navigationTitle("Tasks")
        .navigationBarTitleDisplayMode(.large)
        .refreshable {
            await viewModel.loadData()
        }
        .task {
            await viewModel.loadData()
        }
    }

    var filteredTasks: [FlowTask] {
        if let status = selectedStatus {
            return viewModel.tasks.filter { $0.status == status.rawValue }
        }
        return viewModel.tasks
    }
}

// MARK: - Task Stats Row

struct TaskStatsRow: View {
    let stats: TaskStats

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                TaskStatCard(label: "Total", value: "\(stats.total)", color: .oceanSwell)
                TaskStatCard(label: "To Do", value: "\(stats.todo)", color: .textSecondary)
                TaskStatCard(label: "In Progress", value: "\(stats.inProgress)", color: .oceanSwell)
                TaskStatCard(label: "Review", value: "\(stats.review)", color: .sunlight)
                TaskStatCard(label: "Done", value: "\(stats.completed)", color: .green)
            }
            .padding(.horizontal)
        }
    }
}

struct TaskStatCard: View {
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

// MARK: - Task Status Pill

struct TaskStatusPill: View {
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

// MARK: - Task Card

struct TaskCard: View {
    let task: FlowTask

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(task.title)
                        .font(.headline)
                        .foregroundColor(.textPrimary)
                        .lineLimit(2)

                    if let projectName = task.project?.name {
                        Text(projectName)
                            .font(.caption)
                            .foregroundColor(.textSecondary)
                    }
                }

                Spacer()

                // Status Badge
                Text(task.statusEnum.displayName)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(task.statusEnum.color)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(task.statusEnum.color.opacity(0.15))
                    .clipShape(Capsule())
            }

            // Meta Row
            HStack(spacing: 16) {
                // Priority
                HStack(spacing: 4) {
                    Image(systemName: "flag.fill")
                        .font(.caption2)
                    Text(task.priorityEnum.displayName)
                        .font(.caption)
                }
                .foregroundColor(task.priorityEnum.color)

                // Due Date
                if let dueDate = task.dueDate {
                    HStack(spacing: 4) {
                        Image(systemName: "calendar")
                            .font(.caption2)
                        Text(formatDate(dueDate))
                            .font(.caption)
                    }
                    .foregroundColor(.textSecondary)
                }

                Spacer()

                // Assignee
                if let assignee = task.assignee {
                    HStack(spacing: 4) {
                        ZStack {
                            Circle()
                                .fill(Color.oceanSwell.opacity(0.2))
                                .frame(width: 20, height: 20)
                            Text(getInitials(assignee.name))
                                .font(.system(size: 8))
                                .fontWeight(.semibold)
                                .foregroundColor(.oceanSwell)
                        }
                        Text(assignee.name)
                            .font(.caption)
                            .foregroundColor(.textSecondary)
                    }
                }
            }
        }
        .padding(16)
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "MMM d"
            return displayFormatter.string(from: date)
        }
        return dateString
    }

    func getInitials(_ name: String) -> String {
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))"
        }
        return String(name.prefix(2)).uppercased()
    }
}

// MARK: - View Model

@MainActor
class TasksViewModel: ObservableObject {
    @Published var tasks: [FlowTask] = []
    @Published var stats = TaskStats()
    @Published var isLoading = false
    @Published var error: String?

    func loadData() async {
        isLoading = true
        error = nil

        do {
            let response = try await APIService.shared.fetchTasks()
            tasks = response.tasks
            stats = response.stats
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }

    func countFor(status: TaskStatus) -> Int {
        switch status {
        case .todo: return stats.todo
        case .inProgress: return stats.inProgress
        case .review: return stats.review
        case .completed: return stats.completed
        case .blocked: return stats.blocked
        }
    }
}

// MARK: - Task Models

enum TaskStatus: String, CaseIterable {
    case todo
    case inProgress = "in_progress"
    case review
    case completed
    case blocked

    var displayName: String {
        switch self {
        case .todo: return "To Do"
        case .inProgress: return "In Progress"
        case .review: return "Review"
        case .completed: return "Done"
        case .blocked: return "Blocked"
        }
    }

    var color: Color {
        switch self {
        case .todo: return .textSecondary
        case .inProgress: return .oceanSwell
        case .review: return .sunlight
        case .completed: return .green
        case .blocked: return .red
        }
    }
}

enum TaskPriority: String, CaseIterable {
    case low
    case medium
    case high
    case urgent

    var displayName: String {
        switch self {
        case .low: return "Low"
        case .medium: return "Medium"
        case .high: return "High"
        case .urgent: return "Urgent"
        }
    }

    var color: Color {
        switch self {
        case .low: return .textSecondary
        case .medium: return .oceanSwell
        case .high: return .sunlight
        case .urgent: return .red
        }
    }
}

struct FlowTask: Codable, Identifiable {
    let id: String
    let title: String
    let description: String?
    let status: String
    let priority: String
    let dueDate: String?
    let order: Int
    let project: TaskProject?
    let assignee: TaskAssignee?
    let creator: TaskCreator?

    var statusEnum: TaskStatus {
        TaskStatus(rawValue: status) ?? .todo
    }

    var priorityEnum: TaskPriority {
        TaskPriority(rawValue: priority) ?? .medium
    }
}

struct TaskProject: Codable {
    let id: String
    let name: String
}

struct TaskAssignee: Codable {
    let id: String
    let name: String
    let avatar: String?
}

struct TaskCreator: Codable {
    let id: String
    let name: String
}

struct TasksResponse: Codable {
    let tasks: [FlowTask]
    let grouped: TasksGrouped
    let stats: TaskStats
}

struct TasksGrouped: Codable {
    let todo: [FlowTask]
    let in_progress: [FlowTask]
    let review: [FlowTask]
    let completed: [FlowTask]
    let blocked: [FlowTask]
}

struct TaskStats: Codable {
    var total: Int = 0
    var todo: Int = 0
    var inProgress: Int = 0
    var review: Int = 0
    var completed: Int = 0
    var blocked: Int = 0
    var highPriority: Int = 0
}

#Preview {
    NavigationStack {
        TasksView()
    }
}
