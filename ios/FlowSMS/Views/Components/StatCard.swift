import SwiftUI

struct StatCard: View {
    let title: String
    let value: Int
    let icon: String
    let trendValue: Int?
    let trendPositive: Bool?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.subheadline)
                        .foregroundColor(.textSecondary)

                    Text("\(value)")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.textPrimary)

                    if let trend = trendValue, let positive = trendPositive {
                        HStack(spacing: 4) {
                            Image(systemName: positive ? "arrow.up" : "arrow.down")
                                .font(.caption)
                            Text("\(trend)%")
                                .font(.caption)
                                .fontWeight(.medium)
                        }
                        .foregroundColor(positive ? .green : .heart)
                    }
                }

                Spacer()

                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(.oceanSwell)
                    .padding(12)
                    .background(Color.oceanSwell.opacity(0.15))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
        .padding(16)
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

#Preview {
    StatCard(
        title: "Active Projects",
        value: 12,
        icon: "folder.fill",
        trendValue: 8,
        trendPositive: true
    )
    .padding()
    .background(Color.bgDark)
}
