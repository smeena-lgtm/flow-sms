import SwiftUI

struct MoreView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Documents Section
                VStack(alignment: .leading, spacing: 12) {
                    SectionHeader(title: "Documents", icon: "folder.fill")

                    VStack(spacing: 8) {
                        MoreMenuItem(
                            title: "All Documents",
                            icon: "doc.text.fill",
                            color: .oceanSwell
                        )
                        MoreMenuItem(
                            title: "Contracts",
                            icon: "doc.badge.gearshape.fill",
                            color: .purple
                        )
                        MoreMenuItem(
                            title: "Reports",
                            icon: "chart.bar.doc.horizontal.fill",
                            color: .green
                        )
                        MoreMenuItem(
                            title: "Templates",
                            icon: "doc.on.doc.fill",
                            color: .sunlight
                        )
                    }
                }

                // Finance Section
                VStack(alignment: .leading, spacing: 12) {
                    SectionHeader(title: "Finance", icon: "dollarsign.circle.fill")

                    VStack(spacing: 8) {
                        MoreMenuItem(
                            title: "Budget Overview",
                            icon: "chart.pie.fill",
                            color: .green
                        )
                        MoreMenuItem(
                            title: "Invoices",
                            icon: "doc.text.fill",
                            color: .oceanSwell
                        )
                        MoreMenuItem(
                            title: "Expenses",
                            icon: "creditcard.fill",
                            color: .sunlight
                        )
                    }
                }

                // Settings Section
                VStack(alignment: .leading, spacing: 12) {
                    SectionHeader(title: "Settings", icon: "gearshape.fill")

                    VStack(spacing: 8) {
                        MoreMenuItem(
                            title: "Account",
                            icon: "person.circle.fill",
                            color: .oceanSwell
                        )
                        MoreMenuItem(
                            title: "Notifications",
                            icon: "bell.badge.fill",
                            color: .sunlight
                        )
                        MoreMenuItem(
                            title: "Appearance",
                            icon: "paintbrush.fill",
                            color: .purple
                        )
                        MoreMenuItem(
                            title: "Privacy & Security",
                            icon: "lock.shield.fill",
                            color: .green
                        )
                    }
                }

                // Help & Support Section
                VStack(alignment: .leading, spacing: 12) {
                    SectionHeader(title: "Help & Support", icon: "questionmark.circle.fill")

                    VStack(spacing: 8) {
                        MoreMenuItem(
                            title: "Help Center",
                            icon: "book.fill",
                            color: .oceanSwell
                        )
                        MoreMenuItem(
                            title: "Contact Support",
                            icon: "envelope.fill",
                            color: .purple
                        )
                        MoreMenuItem(
                            title: "About",
                            icon: "info.circle.fill",
                            color: .textSecondary
                        )
                    }
                }

                // App Info
                VStack(spacing: 8) {
                    Text("Flow SMS")
                        .font(.headline)
                        .foregroundColor(.textPrimary)
                    Text("Version 1.0.0")
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                }
                .padding(.top, 20)
            }
            .padding()
        }
        .background(Color.bgDark)
        .navigationTitle("More")
        .navigationBarTitleDisplayMode(.large)
    }
}

// MARK: - Section Header

struct SectionHeader: View {
    let title: String
    let icon: String

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundColor(.oceanSwell)
            Text(title)
                .font(.headline)
                .foregroundColor(.textPrimary)
        }
    }
}

// MARK: - More Menu Item

struct MoreMenuItem: View {
    let title: String
    let icon: String
    let color: Color
    var badge: String? = nil
    @State private var isPressed = false

    var body: some View {
        Button(action: {
            // Navigation action would go here
        }) {
            HStack(spacing: 12) {
                // Icon
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(color.opacity(0.15))
                        .frame(width: 36, height: 36)
                    Image(systemName: icon)
                        .font(.system(size: 16))
                        .foregroundColor(color)
                }

                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.textPrimary)

                Spacer()

                if let badge = badge {
                    Text(badge)
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(color)
                        .clipShape(Capsule())
                }

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.textSecondary)
            }
            .padding(12)
            .background(Color.bgCard)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

#Preview {
    NavigationStack {
        MoreView()
    }
}
