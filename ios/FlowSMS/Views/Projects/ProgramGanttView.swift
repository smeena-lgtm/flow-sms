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
        return dateString.flatMap { ProgramDateFormatter.shared.date(from: $0) }
    }

    var effectiveEndDate: Date? {
        let dateString = endDate ?? dueDate
        return dateString.flatMap { ProgramDateFormatter.shared.date(from: $0) }
    }

    var isMilestone: Bool {
        milestoneOnly == true
    }
}

// Dedicated date formatter to avoid conflicts
private enum ProgramDateFormatter {
    static let shared: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        return formatter
    }()

    static let display: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d, yyyy"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        return formatter
    }()

    static let monthYear: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM yy"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        return formatter
    }()
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

        // Use URLComponents for proper encoding
        var components = URLComponents(string: "https://flow-sms.vercel.app/api/programs")
        components?.queryItems = [URLQueryItem(name: "projectId", value: buildingId)]

        guard let url = components?.url else {
            errorMessage = "Invalid URL"
            isLoading = false
            return
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                let statusCode = (response as? HTTPURLResponse)?.statusCode ?? 0
                errorMessage = "Server error (\(statusCode))"
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
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack(spacing: 10) {
                Image(systemName: "chart.gantt")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.oceanSwell)

                VStack(alignment: .leading, spacing: 2) {
                    Text("Project Program")
                        .font(.headline)
                        .foregroundColor(.textPrimary)

                    if let program = viewModel.program {
                        Text("\(program.stages.count) stages · Updated \(program.lastUpdated)")
                            .font(.caption2)
                            .foregroundColor(.textSecondary)
                    }
                }

                Spacer()
            }
            .padding(16)

            // Segmented Control
            if viewModel.program != nil {
                Picker("View", selection: $selectedTab) {
                    Text("Timeline").tag(GanttTab.timeline)
                    Text("Details").tag(GanttTab.details)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, 16)
                .padding(.bottom, 12)
            }

            // Content
            if viewModel.isLoading {
                HStack {
                    Spacer()
                    VStack(spacing: 12) {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .oceanSwell))
                        Text("Loading program...")
                            .font(.caption)
                            .foregroundColor(.textSecondary)
                    }
                    Spacer()
                }
                .padding(.vertical, 40)
            } else if let errorMessage = viewModel.errorMessage {
                VStack(spacing: 10) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.sunlight)
                    Text(errorMessage)
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 30)
            } else if let program = viewModel.program, !program.stages.isEmpty {
                if selectedTab == .timeline {
                    ProgramTimelineView(stages: program.stages)
                } else {
                    ProgramDetailsListView(stages: program.stages)
                }
            } else {
                VStack(spacing: 10) {
                    Image(systemName: "chart.bar.xaxis")
                        .font(.system(size: 24))
                        .foregroundColor(.textSecondary)
                    Text("No program data available")
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 30)
            }

            // Legend
            if viewModel.program != nil {
                HStack(spacing: 12) {
                    ForEach(ProgramCategory.allCases, id: \.self) { cat in
                        HStack(spacing: 4) {
                            RoundedRectangle(cornerRadius: 2)
                                .fill(cat.color)
                                .frame(width: 10, height: 10)
                            Text(cat.label)
                                .font(.caption2)
                                .foregroundColor(.textSecondary)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
            }
        }
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .task {
            await viewModel.fetchProgram()
        }
    }
}

// MARK: - Timeline View

private struct ProgramTimelineView: View {
    let stages: [ProgramStage]

    var dateRange: (start: Date, end: Date)? {
        let allDates = stages.compactMap { [$0.effectiveStartDate, $0.effectiveEndDate].compactMap { $0 } }.flatMap { $0 }
        guard !allDates.isEmpty else { return nil }

        let calendar = Calendar.current
        let paddedStart = calendar.date(byAdding: .month, value: -1, to: allDates.min()!)!
        let paddedEnd = calendar.date(byAdding: .month, value: 1, to: allDates.max()!)!
        return (paddedStart, paddedEnd)
    }

    var body: some View {
        if let dateRange = dateRange {
            VStack(spacing: 0) {
                // Stage rows with horizontal scroll for bars
                ForEach(Array(stages.enumerated()), id: \.element.id) { index, stage in
                    HStack(spacing: 0) {
                        // Fixed left: stage name
                        HStack(spacing: 6) {
                            Image(systemName: stage.statusEnum.icon)
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(stage.statusEnum.color)
                                .frame(width: 14)

                            Text(stage.shortName ?? stage.name)
                                .font(.caption2)
                                .fontWeight(.medium)
                                .foregroundColor(.textPrimary)
                                .lineLimit(1)
                        }
                        .frame(width: 110, alignment: .leading)
                        .padding(.horizontal, 8)

                        // Right: bar
                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                // Today line
                                let todayPct = todayPosition(in: dateRange)
                                if todayPct >= 0 && todayPct <= 1 {
                                    Rectangle()
                                        .fill(Color.sunlight.opacity(0.6))
                                        .frame(width: 1.5)
                                        .offset(x: geo.size.width * todayPct)
                                }

                                // Bar or milestone
                                if let start = stage.effectiveStartDate, let end = stage.effectiveEndDate {
                                    let pos = barPosition(start: start, end: end, in: dateRange)
                                    if stage.isMilestone {
                                        Image(systemName: "diamond.fill")
                                            .font(.system(size: 10))
                                            .foregroundColor(stage.categoryEnum.color)
                                            .offset(x: geo.size.width * pos.start - 5)
                                    } else {
                                        RoundedRectangle(cornerRadius: 4)
                                            .fill(stage.categoryEnum.color)
                                            .frame(width: max(6, geo.size.width * pos.width), height: 16)
                                            .offset(x: geo.size.width * pos.start)
                                    }
                                } else {
                                    Text("TBD")
                                        .font(.system(size: 8))
                                        .foregroundColor(.textSecondary)
                                        .frame(maxWidth: .infinity, alignment: .center)
                                }
                            }
                        }
                    }
                    .frame(height: 36)
                    .background(index % 2 == 0 ? Color.bgCard : Color.bgSurface.opacity(0.5))
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .padding(.horizontal, 12)
        } else {
            Text("No date information available")
                .font(.caption)
                .foregroundColor(.textSecondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 20)
        }
    }

    private func barPosition(start: Date, end: Date, in range: (start: Date, end: Date)) -> (start: CGFloat, width: CGFloat) {
        let cal = Calendar.current
        let totalDays = max(1, cal.dateComponents([.day], from: range.start, to: range.end).day ?? 1)
        let daysToStart = max(0, cal.dateComponents([.day], from: range.start, to: start).day ?? 0)
        let barDays = max(1, cal.dateComponents([.day], from: start, to: end).day ?? 1)
        return (CGFloat(daysToStart) / CGFloat(totalDays), CGFloat(barDays) / CGFloat(totalDays))
    }

    private func todayPosition(in range: (start: Date, end: Date)) -> CGFloat {
        let cal = Calendar.current
        let today = Date()
        guard today >= range.start, today <= range.end else { return -1 }
        let totalDays = max(1, cal.dateComponents([.day], from: range.start, to: range.end).day ?? 1)
        let daysToToday = cal.dateComponents([.day], from: range.start, to: today).day ?? 0
        return CGFloat(daysToToday) / CGFloat(totalDays)
    }
}

// MARK: - Details List View

private struct ProgramDetailsListView: View {
    let stages: [ProgramStage]

    var body: some View {
        VStack(spacing: 8) {
            ForEach(stages) { stage in
                VStack(alignment: .leading, spacing: 8) {
                    // Name + Status
                    HStack(spacing: 8) {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(stage.categoryEnum.color)
                            .frame(width: 4, height: 20)

                        Text(stage.name)
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(stage.statusEnum == .cancelled ? .textSecondary : .textPrimary)
                            .strikethrough(stage.statusEnum == .cancelled)
                            .lineLimit(2)

                        Spacer()

                        HStack(spacing: 4) {
                            Image(systemName: stage.statusEnum.icon)
                                .font(.system(size: 10))
                            Text(stage.statusEnum.label)
                                .font(.caption2)
                        }
                        .foregroundColor(stage.statusEnum.color)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(stage.statusEnum.color.opacity(0.12))
                        .clipShape(Capsule())
                    }

                    // Dates + Lead
                    HStack(spacing: 16) {
                        if let start = stage.effectiveStartDate {
                            Label(ProgramDateFormatter.display.string(from: start), systemImage: "calendar")
                                .font(.caption2)
                                .foregroundColor(.textSecondary)
                        }

                        Label(stage.lead, systemImage: "person.fill")
                            .font(.caption2)
                            .foregroundColor(stage.lead == "DLF" ? .purple : .oceanSwell)
                    }

                    // Remarks
                    if !stage.remarks.isEmpty {
                        Text(stage.remarks)
                            .font(.caption2)
                            .foregroundColor(.textSecondary)
                            .lineLimit(2)
                    }
                }
                .padding(12)
                .background(Color.bgSurface)
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding(.horizontal, 12)
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
            ProgramGanttView(buildingId: "Flow Aventura", buildingName: "Flow Aventura")
                .padding()
        }
    }
}
