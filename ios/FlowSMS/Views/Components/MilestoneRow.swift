import SwiftUI

struct MilestoneRow: View {
    let milestone: DashboardMilestone

    var statusIcon: String {
        switch milestone.status {
        case .pending: return "clock"
        case .in_progress: return "clock.fill"
        case .completed: return "checkmark.circle.fill"
        case .overdue: return "exclamationmark.circle.fill"
        }
    }

    var statusColor: Color {
        switch milestone.status {
        case .pending: return .sunlight
        case .in_progress: return .oceanSwell
        case .completed: return .green
        case .overdue: return .heart
        }
    }

    var body: some View {
        HStack(spacing: 12) {
            // Status Icon
            Image(systemName: statusIcon)
                .font(.title3)
                .foregroundColor(statusColor)
                .frame(width: 36, height: 36)
                .background(statusColor.opacity(0.15))
                .clipShape(Circle())

            // Content
            VStack(alignment: .leading, spacing: 2) {
                Text(milestone.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.textPrimary)
                    .lineLimit(1)

                Text(milestone.project)
                    .font(.caption)
                    .foregroundColor(.textSecondary)
            }

            Spacer()

            // Date & Status
            VStack(alignment: .trailing, spacing: 4) {
                Text(formatDate(milestone.dueDate))
                    .font(.caption)
                    .foregroundColor(.textSecondary)

                Text(milestone.status.displayName)
                    .font(.caption2)
                    .fontWeight(.medium)
                    .foregroundColor(statusColor)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(statusColor.opacity(0.15))
                    .clipShape(Capsule())
            }
        }
        .padding(12)
        .background(Color.bgHover.opacity(0.3))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "MMM d"
            return displayFormatter.string(from: date)
        }
        return dateString
    }
}

#Preview {
    VStack {
        MilestoneRow(milestone: DashboardMilestone(
            id: "1",
            name: "Schematic Design Review",
            project: "Al-Mamlaka Tower",
            dueDate: "2024-01-28T00:00:00.000Z",
            status: .pending
        ))

        MilestoneRow(milestone: DashboardMilestone(
            id: "2",
            name: "MEP Coordination",
            project: "Al-Mamlaka Tower",
            dueDate: "2024-01-24T00:00:00.000Z",
            status: .overdue
        ))
    }
    .padding()
    .background(Color.bgDark)
}
