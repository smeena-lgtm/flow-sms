import SwiftUI

// Integration: Add this after KPIGrid in BuildingDetailView.swift:
// ProgramGanttView(buildingId: building.identity.marketingName.isEmpty ? building.identity.plotNo : building.identity.marketingName, buildingName: building.identity.marketingName)

// MARK: - Program Models

struct ProgramStage: Codable, Identifiable {
    let id: Int
    let name: String
    let shortName: String?
    let startDate: String?
    let endDate: String?
    let dueDate: String?
    let lead: String
    let assist: String?
    let status: String
    let remarks: String
    let category: String
    let milestoneOnly: Bool?

    var statusEnum: ProgramStageStatus {
        ProgramStageStatus(rawValue: status) ?? .upcoming
    }

    var categoryEnum: ProgramCategory {
        ProgramCategory(rawValue: category) ?? .construction
    }

    var effectiveStartDate: Date? {
        let dateString = startDate ?? dueDate
        return dateString.flatMap { DateFormatter.iso8601.date(from: $0) }
    }

    var effectiveEndDate: Date? {
        let dateString = endDate ?? dueDate
        return dateString.flatMap { DateFormatter.iso8601.date(from: $0) }
    }

    var isMilestone: Bool {
        milestoneOnly == true
    }
}

enum ProgramStageStatus: String, CaseIterable {
    case completed
    case in_progress
    case upcoming
    case on_hold
    case cancelled

    var label: String {
        switch self {
        case .completed: return "Completed"
        case .in_progress: return "In Progress"
        case .upcoming: return "Upcoming"
        case .on_hold: return "On Hold"
        case .cancelled: return "Cancelled"
        }
    }

    var color: Color {
        switch self {
        case .completed: return Color(red: 0.2, green: 0.8, blue: 0.3)
        case .in_progress: return Color.oceanSwell
        case .upcoming: return Color.textSecondary
        case .on_hold: return Color.sunlight
        case .cancelled: return Color(red: 0.9, green: 0.3, blue: 0.3)
        }
    }

    var icon: String {
        switch self {
        case .completed: return "checkmark.circle.fill"
        case .in_progress: return "play.circle.fill"
        case .upcoming: return "calendar.circle"
        case .on_hold: return "pause.circle.fill"
        case .cancelled: return "xmark.circle.fill"
        }
    }
}

enum ProgramCategory: String, CaseIterable {
    case design
    case approvals
    case construction
    case handover

    var label: String {
        switch self {
        case .design: return "Design"
        case .approvals: return "Approvals"
        case .construction: return "Construction"
        case .handover: return "Handover"
        }
    }

    var color: Color {
        switch self {
        case .design: return Color(red: 0.6, green: 0.4, blue: 0.95)
        case .approvals: return Color(red: 0.8, green: 0.4, blue: 0.95)
        case .construction: return Color(red: 0.2, green: 0.85, blue: 0.95)
        case .handover: return Color(red: 0.2, green: 0.8, blue: 0.4)
        }
    }
}

struct ProjectProgram: Codable {
    let projectId: String
    let projectName: String
    let lastUpdated: String
    let overallStatus: String
    let stages: [ProgramStage]
}

struct ProgramResponse: Codable {
    let program: ProjectProgram
}

// MARK: - Date Formatter Extension

extension DateFormatter {
    static let iso8601: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        return formatter
    }()
}

// MARK: - ViewModel

@MainActor
class ProgramGanttViewModel: ObservableObject {
    @Published var program: ProjectProgram?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let buildingId: String

    init(buildingId: String) {
        self.buildingId = buildingId
    }

    func fetchProgram() async {
        isLoading = true
        errorMessage = nil

        let urlString = "https://flow-sms.vercel.app/api/programs?projectId=\(buildingId)"
        guard let url = URL(string: urlString.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "") else {
            errorMessage = "Invalid URL"
            isLoading = false
            return
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                errorMessage = "Server error"
                isLoading = false
                return
            }

            let decoder = JSONDecoder()
            let programResponse = try decoder.decode(ProgramResponse.self, from: data)
            self.program = programResponse.program
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
}

// MARK: - Main View

struct ProgramGanttView: View {
    let buildingId: String
    let buildingName: String?

    @StateObject private var viewModel: ProgramGanttViewModel
    @State private var selectedTab: GanttTab = .timeline

    enum GanttTab {
        case timeline
        case details
    }

    init(buildingId: String, buildingName: String? = nil) {
        self.buildingId = buildingId
        self.buildingName = buildingName
        _viewModel = StateObject(wrappedValue: ProgramGanttViewModel(buildingId: buildingId))
    }

    var body: some View {
        VStack(spacing: 16) {
            // Header
            HeaderView(
                projectName: viewModel.program?.projectName ?? "Project Program",
                stageCount: viewModel.program?.stages.count ?? 0,
                lastUpdated: viewModel.program?.lastUpdated
            )

            // Segmented Control
            Picker("View", selection: $selectedTab) {
                Text("Timeline").tag(GanttTab.timeline)
                Text("Details").tag(GanttTab.details)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, 16)

            // Content
            if viewModel.isLoading {
                ProgressView()
                    .frame(maxHeight: .infinity)
            } else if let errorMessage = viewModel.errorMessage {
                VStack(spacing: 12) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 32))
                        .foregroundColor(Color.heart)
                    Text("Error Loading Program")
                        .font(.headline)
                        .foregroundColor(Color.textPrimary)
                    Text(errorMessage)
                        .font(.caption)
                        .foregroundColor(Color.textSecondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxHeight: .infinity)
                .padding(16)
            } else if let program = viewModel.program, !program.stages.isEmpty {
                if selectedTab == .timeline {
                    TimelineGanttView(stages: program.stages)
                } else {
                    DetailsListView(stages: program.stages)
                }
            } else {
                VStack(spacing: 12) {
                    Image(systemName: "chart.bar.xaxis")
                        .font(.system(size: 32))
                        .foregroundColor(Color.textSecondary)
                    Text("No Program Data")
                        .font(.headline)
                        .foregroundColor(Color.textPrimary)
                    Text("No stages found for this project")
                        .font(.caption)
                        .foregroundColor(Color.textSecondary)
                }
                .frame(maxHeight: .infinity)
                .padding(16)
            }
        }
        .padding(.vertical, 16)
        .background(Color.bgDark)
        .task {
            await viewModel.fetchProgram()
        }
    }
}

// MARK: - Header View

private struct HeaderView: View {
    let projectName: String
    let stageCount: Int
    let lastUpdated: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "chart.gantt.circle.fill")
                    .font(.system(size: 18))
                    .foregroundColor(Color.oceanSwell)

                Text("Project Program")
                    .font(.headline)
                    .foregroundColor(Color.textPrimary)

                Spacer()

                Text("\(stageCount) stages")
                    .font(.caption)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.bgCard)
                    .foregroundColor(Color.textSecondary)
                    .cornerRadius(6)
            }

            HStack(spacing: 8) {
                Text(projectName)
                    .font(.system(.body, design: .default))
                    .foregroundColor(Color.textPrimary)
                    .lineLimit(1)

                Spacer()

                if let lastUpdated = lastUpdated {
                    Text("Updated: \(lastUpdated)")
                        .font(.caption2)
                        .foregroundColor(Color.textSecondary)
                }
            }

            // Legend
            LegendView()
        }
        .padding(16)
        .background(Color.bgCard)
        .cornerRadius(12)
        .padding(.horizontal, 16)
    }
}

// MARK: - Legend View

private struct LegendView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Legend")
                .font(.caption)
                .foregroundColor(Color.textSecondary)
                .textCase(.uppercase)

            HStack(spacing: 16) {
                VStack(spacing: 8) {
                    HStack(spacing: 6) {
                        ForEach(ProgramCategory.allCases, id: \.self) { category in
                            HStack(spacing: 4) {
                                RoundedRectangle(cornerRadius: 2)
                                    .fill(category.color)
                                    .frame(width: 12, height: 12)
                                Text(category.label)
                                    .font(.caption2)
                                    .foregroundColor(Color.textSecondary)
                            }
                        }
                    }
                }

                Spacer()
            }
        }
    }
}

// MARK: - Timeline Gantt View

private struct TimelineGanttView: View {
    let stages: [ProgramStage]
    @State private var scrollPosition: CGFloat = 0

    var dateRange: (start: Date, end: Date)? {
        let allDates = stages.compactMap { [$0.effectiveStartDate, $0.effectiveEndDate].compactMap { $0 } }.flatMap { $0 }
        guard !allDates.isEmpty else { return nil }

        let minDate = allDates.min()!
        let maxDate = allDates.max()!

        let calendar = Calendar.current
        let paddedStart = calendar.date(byAdding: .month, value: -1, to: minDate)!
        let paddedEnd = calendar.date(byAdding: .month, value: 1, to: maxDate)!

        return (paddedStart, paddedEnd)
    }

    var body: some View {
        if let dateRange = dateRange {
            GeometryReader { geometry in
                HStack(spacing: 0) {
                    // Fixed left column - Stage names
                    VStack(alignment: .leading, spacing: 0) {
                        // Header
                        HStack(spacing: 8) {
                            Text("Stage")
                                .font(.caption)
                                .foregroundColor(Color.textSecondary)
                            Spacer()
                        }
                        .frame(height: 50)
                        .padding(.horizontal, 12)
                        .background(Color.bgCard)
                        .borderBottom(width: 1, color: Color.borderColor)

                        // Stages
                        ScrollView(.vertical, showsIndicators: false) {
                            VStack(spacing: 0) {
                                ForEach(Array(stages.enumerated()), id: \.element.id) { index, stage in
                                    VStack(spacing: 0) {
                                        HStack(spacing: 8) {
                                            Image(systemName: stage.statusEnum.icon)
                                                .font(.system(size: 12, weight: .semibold))
                                                .foregroundColor(stage.statusEnum.color)
                                                .frame(width: 16)

                                            VStack(alignment: .leading, spacing: 2) {
                                                Text(stage.shortName ?? stage.name)
                                                    .font(.caption)
                                                    .fontWeight(.medium)
                                                    .foregroundColor(Color.textPrimary)
                                                    .lineLimit(1)

                                                Text(stage.lead)
                                                    .font(.caption2)
                                                    .foregroundColor(Color.textSecondary)
                                                    .lineLimit(1)
                                            }
                                            Spacer()
                                        }
                                        .frame(height: 60)
                                        .padding(.horizontal, 12)
                                        .background(index % 2 == 0 ? Color.bgCard : Color.bgSurface)
                                        .borderBottom(width: 1, color: Color.borderColor)
                                    }
                                }
                            }
                        }
                    }
                    .frame(width: 120)
                    .background(Color.bgCard)

                    // Scrollable timeline area
                    ScrollView(.horizontal, showsIndicators: false) {
                        VStack(spacing: 0) {
                            // Timeline header with months
                            TimelineHeaderView(dateRange: dateRange)
                                .borderBottom(width: 1, color: Color.borderColor)

                            // Gantt bars
                            VStack(spacing: 0) {
                                ForEach(Array(stages.enumerated()), id: \.element.id) { index, stage in
                                    GanttBarRowView(
                                        stage: stage,
                                        dateRange: dateRange,
                                        isAlternate: index % 2 == 0
                                    )
                                    .borderBottom(width: 1, color: Color.borderColor)
                                }
                            }
                        }
                    }
                }
                .cornerRadius(12)
                .clipped()
            }
            .frame(height: 400)
            .padding(.horizontal, 16)
        } else {
            VStack {
                Text("No date information available")
                    .foregroundColor(Color.textSecondary)
            }
            .frame(maxHeight: .infinity)
        }
    }
}

// MARK: - Timeline Header View

private struct TimelineHeaderView: View {
    let dateRange: (start: Date, end: Date)

    var monthColumns: [(date: Date, label: String)] {
        var columns: [(Date, String)] = []
        let calendar = Calendar.current
        var currentDate = calendar.startOfMonth(for: dateRange.start)

        let formatter = DateFormatter()
        formatter.dateFormat = "MMM yy"

        while currentDate <= dateRange.end {
            columns.append((currentDate, formatter.string(from: currentDate)))
            currentDate = calendar.date(byAdding: .month, value: 1, to: currentDate)!
        }

        return columns
    }

    var body: some View {
        HStack(spacing: 0) {
            ForEach(monthColumns, id: \.label) { month in
                VStack {
                    Text(month.label)
                        .font(.caption2)
                        .fontWeight(.semibold)
                        .foregroundColor(Color.textPrimary)
                }
                .frame(width: 100, height: 50)
                .background(Color.bgSurface)
                .borderRight(width: 1, color: Color.borderColor)
            }

            Spacer()
                .frame(width: 100)
        }
    }
}

// MARK: - Gantt Bar Row View

private struct GanttBarRowView: View {
    let stage: ProgramStage
    let dateRange: (start: Date, end: Date)
    let isAlternate: Bool

    var body: some View {
        ZStack(alignment: .leading) {
            // Background
            Rectangle()
                .fill(isAlternate ? Color.bgCard : Color.bgSurface)

            // Today line
            TodayLineView(dateRange: dateRange)

            // Gantt bar
            if let startDate = stage.effectiveStartDate, let endDate = stage.effectiveEndDate {
                GanttBarComponentView(
                    stage: stage,
                    startDate: startDate,
                    endDate: endDate,
                    dateRange: dateRange
                )
            }
        }
        .frame(height: 60)
    }
}

// MARK: - Gantt Bar Component

private struct GanttBarComponentView: View {
    let stage: ProgramStage
    let startDate: Date
    let endDate: Date
    let dateRange: (start: Date, end: Date)

    var positions: (start: CGFloat, width: CGFloat) {
        let calendar = Calendar.current
        let totalDays = calendar.dateComponents([.day], from: dateRange.start, to: dateRange.end).day ?? 1
        let daysToStart = calendar.dateComponents([.day], from: dateRange.start, to: startDate).day ?? 0
        let daysInBar = calendar.dateComponents([.day], from: startDate, to: endDate).day ?? 1

        let percentStart = CGFloat(max(0, daysToStart)) / CGFloat(totalDays)
        let percentWidth = CGFloat(max(1, daysInBar)) / CGFloat(totalDays)

        return (percentStart, percentWidth)
    }

    var body: some View {
        let baseWidth: CGFloat = 2400
        let pos = positions

        HStack(spacing: 0) {
            Spacer()
                .frame(width: baseWidth * pos.start)

            if stage.isMilestone {
                // Diamond for milestone
                Image(systemName: "diamond.fill")
                    .font(.system(size: 16))
                    .foregroundColor(stage.categoryEnum.color)
                    .frame(width: 24, height: 24)
                    .offset(x: -12)
            } else {
                // Bar for regular stage
                HStack(spacing: 0) {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(stage.categoryEnum.color)
                        .overlay(
                            RoundedRectangle(cornerRadius: 6)
                                .stroke(stage.statusEnum.color, lineWidth: 2)
                        )
                }
                .frame(width: max(40, baseWidth * pos.width), height: 32)
                .padding(.vertical, 14)
            }

            Spacer()
        }
    }
}

// MARK: - Today Line View

private struct TodayLineView: View {
    let dateRange: (start: Date, end: Date)

    var todayPosition: CGFloat {
        let calendar = Calendar.current
        let today = Date()

        guard today >= dateRange.start && today <= dateRange.end else { return -1 }

        let totalDays = calendar.dateComponents([.day], from: dateRange.start, to: dateRange.end).day ?? 1
        let daysToToday = calendar.dateComponents([.day], from: dateRange.start, to: today).day ?? 0

        return CGFloat(daysToToday) / CGFloat(totalDays)
    }

    var body: some View {
        if todayPosition >= 0 {
            VStack {
                Rectangle()
                    .fill(Color.sunlight)
                    .frame(width: 2)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.leading, todayPosition * 2400)
        }
    }
}

// MARK: - Details List View

private struct DetailsListView: View {
    let stages: [ProgramStage]

    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: 12) {
                ForEach(stages) { stage in
                    StageDetailCard(stage: stage)
                }
            }
            .padding(16)
        }
    }
}

// MARK: - Stage Detail Card

private struct StageDetailCard: View {
    let stage: ProgramStage

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header with category and status
            HStack(spacing: 12) {
                HStack(spacing: 8) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(stage.categoryEnum.color)
                        .frame(width: 12, height: 12)

                    Text(stage.name)
                        .font(.headline)
                        .foregroundColor(Color.textPrimary)
                }

                Spacer()

                HStack(spacing: 6) {
                    Image(systemName: stage.statusEnum.icon)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(stage.statusEnum.color)

                    Text(stage.statusEnum.label)
                        .font(.caption)
                        .foregroundColor(stage.statusEnum.color)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(stage.statusEnum.color.opacity(0.15))
                .cornerRadius(6)
            }

            Divider()
                .background(Color.borderColor)

            // Dates
            VStack(alignment: .leading, spacing: 8) {
                if let startDate = stage.effectiveStartDate {
                    DateRowView(label: "Start", date: startDate)
                }
                if let endDate = stage.effectiveEndDate {
                    DateRowView(label: "End", date: endDate)
                }
            }

            // Team
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 8) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 14))
                        .foregroundColor(Color.oceanSwell)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Lead")
                            .font(.caption)
                            .foregroundColor(Color.textSecondary)
                        Text(stage.lead)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(Color.textPrimary)
                    }

                    Spacer()
                }

                if let assist = stage.assist, !assist.isEmpty {
                    HStack(spacing: 8) {
                        Image(systemName: "person.2.circle.fill")
                            .font(.system(size: 14))
                            .foregroundColor(Color.oceanSwell.opacity(0.7))

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Assist")
                                .font(.caption)
                                .foregroundColor(Color.textSecondary)
                            Text(assist)
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(Color.textPrimary)
                        }

                        Spacer()
                    }
                }
            }

            // Remarks
            if !stage.remarks.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Remarks")
                        .font(.caption)
                        .foregroundColor(Color.textSecondary)
                        .textCase(.uppercase)

                    Text(stage.remarks)
                        .font(.caption)
                        .foregroundColor(Color.textPrimary)
                        .lineLimit(3)
                }
                .padding(10)
                .background(Color.bgSurface)
                .cornerRadius(6)
            }
        }
        .padding(14)
        .background(Color.bgCard)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.borderColor, lineWidth: 1)
        )
    }
}

// MARK: - Date Row Component

private struct DateRowView: View {
    let label: String
    let date: Date

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d, yyyy"
        return formatter.string(from: date)
    }

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "calendar")
                .font(.system(size: 13))
                .foregroundColor(Color.oceanSwell)
                .frame(width: 14)

            Text(label)
                .font(.caption)
                .foregroundColor(Color.textSecondary)
                .frame(width: 50, alignment: .leading)

            Text(formattedDate)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(Color.textPrimary)

            Spacer()
        }
    }
}

// MARK: - View Modifiers

extension View {
    func borderBottom(width: CGFloat, color: Color) -> some View {
        self.overlay(alignment: .bottom) {
            Rectangle()
                .fill(color)
                .frame(height: width)
        }
    }

    func borderRight(width: CGFloat, color: Color) -> some View {
        self.overlay(alignment: .trailing) {
            Rectangle()
                .fill(color)
                .frame(width: width)
        }
    }
}

// MARK: - Calendar Extension

extension Calendar {
    func startOfMonth(for date: Date) -> Date {
        let components = dateComponents([.year, .month], from: date)
        return self.date(from: components) ?? date
    }
}

// MARK: - Preview

#Preview {
    ZStack {
        Color.bgDark.ignoresSafeArea()

        ScrollView {
            ProgramGanttView(buildingId: "test-123", buildingName: "Test Building")
        }
    }
}
