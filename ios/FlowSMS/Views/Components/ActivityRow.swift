import SwiftUI

struct ActivityRow: View {
    let activity: DashboardActivity

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Avatar
            Circle()
                .fill(Color.oceanSwell)
                .frame(width: 36, height: 36)
                .overlay(
                    Text(initials(from: activity.user))
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.midnight)
                )

            // Content
            VStack(alignment: .leading, spacing: 4) {
                Text(activity.user)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.textPrimary)
                +
                Text(" \(activity.formattedAction) ")
                    .font(.subheadline)
                    .foregroundColor(.textSecondary)
                +
                Text(activity.target)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.oceanSwell)

                Text(formatTimeAgo(activity.time))
                    .font(.caption)
                    .foregroundColor(.textSecondary)
            }

            Spacer()
        }
    }

    private func initials(from name: String) -> String {
        name.split(separator: " ")
            .prefix(2)
            .compactMap { $0.first }
            .map { String($0) }
            .joined()
    }

    private func formatTimeAgo(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        guard let date = formatter.date(from: dateString) else {
            return dateString
        }

        let now = Date()
        let diff = now.timeIntervalSince(date)

        if diff < 60 {
            return "just now"
        } else if diff < 3600 {
            let minutes = Int(diff / 60)
            return "\(minutes) min ago"
        } else if diff < 86400 {
            let hours = Int(diff / 3600)
            return "\(hours) hours ago"
        } else if diff < 172800 {
            return "Yesterday"
        } else {
            let days = Int(diff / 86400)
            return "\(days) days ago"
        }
    }
}

#Preview {
    VStack {
        ActivityRow(activity: DashboardActivity(
            id: "1",
            user: "Ahmed Al-Rashid",
            action: "uploaded_document",
            target: "Floor Plans Rev.3",
            time: "2024-01-25T10:30:00.000Z"
        ))
    }
    .padding()
    .background(Color.bgDark)
}
