import SwiftUI

struct ProjectCard: View {
    let project: DashboardProject

    var statusColor: Color {
        switch project.status {
        case .active: return .oceanSwell
        case .on_hold: return .sunlight
        case .completed: return .green
        case .planning, .archived: return .textSecondary
        }
    }

    var typeColor: Color {
        switch project.type {
        case .architecture: return .oceanSwell
        case .interior: return .heart
        case .engineering: return .sunlight
        case .mixed: return .olive
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Circle()
                            .fill(statusColor)
                            .frame(width: 8, height: 8)
                        Text(project.status.displayName)
                            .font(.caption)
                            .foregroundColor(.textSecondary)
                    }

                    Text(project.name)
                        .font(.headline)
                        .foregroundColor(.textPrimary)
                        .lineLimit(1)

                    Text(project.client)
                        .font(.subheadline)
                        .foregroundColor(.textSecondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundColor(.textSecondary)
                    .font(.caption)
            }

            // Type Badge
            Text(project.type.displayName)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(typeColor)
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(typeColor.opacity(0.15))
                .clipShape(Capsule())

            // Progress
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Progress")
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                    Spacer()
                    Text("\(project.progress)%")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                }

                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.bgHover)
                            .frame(height: 6)

                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.oceanSwell)
                            .frame(width: geometry.size.width * CGFloat(project.progress) / 100, height: 6)
                    }
                }
                .frame(height: 6)
            }

            // Location & Date
            if let location = project.location {
                HStack(spacing: 12) {
                    HStack(spacing: 4) {
                        Image(systemName: "mappin")
                            .font(.caption2)
                        Text(location)
                            .font(.caption)
                            .lineLimit(1)
                    }
                    .foregroundColor(.textSecondary)

                    if let endDate = project.endDate {
                        HStack(spacing: 4) {
                            Image(systemName: "calendar")
                                .font(.caption2)
                            Text(formatDate(endDate))
                                .font(.caption)
                        }
                        .foregroundColor(.textSecondary)
                    }
                }
            }

            // Team Avatars
            HStack(spacing: -8) {
                ForEach(project.team.prefix(4)) { member in
                    Circle()
                        .fill(Color.oceanSwell)
                        .frame(width: 28, height: 28)
                        .overlay(
                            Text(initials(from: member.name))
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(.midnight)
                        )
                        .overlay(
                            Circle()
                                .stroke(Color.bgCard, lineWidth: 2)
                        )
                }

                if project.team.count > 4 {
                    Circle()
                        .fill(Color.bgHover)
                        .frame(width: 28, height: 28)
                        .overlay(
                            Text("+\(project.team.count - 4)")
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(.textSecondary)
                        )
                        .overlay(
                            Circle()
                                .stroke(Color.bgCard, lineWidth: 2)
                        )
                }

                Spacer()

                Text("\(project.team.count) members")
                    .font(.caption)
                    .foregroundColor(.textSecondary)
            }
        }
        .padding(16)
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func initials(from name: String) -> String {
        name.split(separator: " ")
            .prefix(2)
            .compactMap { $0.first }
            .map { String($0) }
            .joined()
    }

    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "MMM yyyy"
            return displayFormatter.string(from: date)
        }
        return dateString
    }
}

#Preview {
    ProjectCard(project: DashboardProject(
        id: "1",
        name: "Al-Mamlaka Tower",
        client: "Saudi Development Corp",
        type: .architecture,
        status: .active,
        progress: 65,
        location: "Riyadh, Saudi Arabia",
        startDate: nil,
        endDate: "2025-12-31T00:00:00.000Z",
        team: [
            TeamMember(id: "1", name: "Ahmed Al-Rashid", role: "PM", avatar: nil),
            TeamMember(id: "2", name: "Sarah Hassan", role: "Engineer", avatar: nil)
        ]
    ))
    .padding()
    .background(Color.bgDark)
}
