import SwiftUI

struct MoreView: View {
    @ObservedObject private var themeManager = ThemeManager.shared

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Appearance Section (prominent, at top)
                VStack(alignment: .leading, spacing: 12) {
                    SectionHeader(title: "Appearance", icon: "paintbrush.fill")

                    // Quick Mode Toggle
                    Button(action: {
                        withAnimation(.smoothSpring) {
                            themeManager.toggleMode()
                        }
                    }) {
                        HStack(spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(Color.sunlight.opacity(0.15))
                                    .frame(width: 36, height: 36)
                                Image(systemName: themeManager.mode.icon)
                                    .font(.system(size: 16))
                                    .foregroundColor(.sunlight)
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text(themeManager.mode == .night ? "Night Mode" : "Day Mode")
                                    .font(.subheadline)
                                    .foregroundColor(.textPrimary)
                                Text("Tap to switch")
                                    .font(.caption2)
                                    .foregroundColor(.textSecondary)
                            }

                            Spacer()

                            // Toggle pill
                            ZStack {
                                Capsule()
                                    .fill(themeManager.mode == .night ? Color.oceanSwell.opacity(0.3) : Color.sunlight.opacity(0.3))
                                    .frame(width: 48, height: 28)

                                Circle()
                                    .fill(themeManager.mode == .night ? Color.oceanSwell : Color.sunlight)
                                    .frame(width: 22, height: 22)
                                    .offset(x: themeManager.mode == .night ? -10 : 10)
                                    .animation(.smoothSpring, value: themeManager.mode)
                            }
                        }
                        .padding(12)
                        .background(Color.bgCard)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .buttonStyle(ScaleButtonStyle())

                    // Theme Picker - navigate to full appearance settings
                    NavigationLink(destination: AppearanceSettingsView()) {
                        HStack(spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(Color.purple.opacity(0.15))
                                    .frame(width: 36, height: 36)
                                Image(systemName: "swatchpalette.fill")
                                    .font(.system(size: 16))
                                    .foregroundColor(.purple)
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text("Theme")
                                    .font(.subheadline)
                                    .foregroundColor(.textPrimary)
                                Text("Currently: \(themeManager.theme.displayName)")
                                    .font(.caption2)
                                    .foregroundColor(.textSecondary)
                            }

                            Spacer()

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

// MARK: - Appearance Settings View (Full Page)

struct AppearanceSettingsView: View {
    @ObservedObject private var themeManager = ThemeManager.shared

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Mode Selection
                VStack(alignment: .leading, spacing: 12) {
                    Text("Display Mode")
                        .font(.headline)
                        .foregroundColor(.textPrimary)
                    Text("Choose between light and dark interface")
                        .font(.caption)
                        .foregroundColor(.textSecondary)

                    HStack(spacing: 12) {
                        ForEach(AppMode.allCases) { appMode in
                            ModeCard(
                                mode: appMode,
                                isActive: themeManager.mode == appMode,
                                onSelect: {
                                    withAnimation(.smoothSpring) {
                                        themeManager.mode = appMode
                                    }
                                }
                            )
                        }
                    }
                }

                // Theme Selection
                VStack(alignment: .leading, spacing: 12) {
                    Text("Theme")
                        .font(.headline)
                        .foregroundColor(.textPrimary)
                    Text("Select a color palette for the interface")
                        .font(.caption)
                        .foregroundColor(.textSecondary)

                    VStack(spacing: 12) {
                        ForEach(AppTheme.allCases) { appTheme in
                            ThemeCard(
                                theme: appTheme,
                                mode: themeManager.mode,
                                isActive: themeManager.theme == appTheme,
                                onSelect: {
                                    withAnimation(.smoothSpring) {
                                        themeManager.theme = appTheme
                                    }
                                }
                            )
                        }
                    }
                }

                // Flow Brand Colors (visible when Flow theme is selected)
                if themeManager.theme == .flow {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Flow Brand Palette")
                            .font(.headline)
                            .foregroundColor(.textPrimary)
                        Text("Official colors from the Flow brand guide")
                            .font(.caption)
                            .foregroundColor(.textSecondary)

                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible()),
                            GridItem(.flexible()),
                            GridItem(.flexible()),
                        ], spacing: 12) {
                            BrandColorSwatch(name: "Midnight", color: .flowMidnight)
                            BrandColorSwatch(name: "Moonlight", color: .flowMoonlight)
                            BrandColorSwatch(name: "Ocean", color: .flowOceanSwell)
                            BrandColorSwatch(name: "Sunlight", color: .flowSunlight)
                            BrandColorSwatch(name: "Heart", color: .flowHeart)
                            BrandColorSwatch(name: "Roots", color: .flowRoots)
                            BrandColorSwatch(name: "Olive", color: .flowOlive)
                        }

                        // Gradients
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Brand Gradients")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.textPrimary)

                            HStack(spacing: 8) {
                                GradientSwatch(
                                    name: "Sunset",
                                    gradient: LinearGradient(colors: [.oceanSwell, .heart, .sunlight], startPoint: .leading, endPoint: .trailing)
                                )
                                GradientSwatch(
                                    name: "Deep Ocean",
                                    gradient: LinearGradient(colors: [.midnight, .oceanSwell], startPoint: .leading, endPoint: .trailing)
                                )
                                GradientSwatch(
                                    name: "Golden Hour",
                                    gradient: LinearGradient(colors: [.sunlight, .moonlight], startPoint: .leading, endPoint: .trailing)
                                )
                            }
                        }
                        .padding(.top, 8)
                    }
                    .transition(.opacity.combined(with: .move(edge: .bottom)))
                }
            }
            .padding()
        }
        .background(Color.bgDark)
        .navigationTitle("Appearance")
        .navigationBarTitleDisplayMode(.large)
    }
}

// MARK: - Mode Card

struct ModeCard: View {
    let mode: AppMode
    let isActive: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            VStack(spacing: 10) {
                // Mode icon
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(isActive ? Color.oceanSwell.opacity(0.2) : Color.bgSurface)
                        .frame(width: 56, height: 56)

                    Image(systemName: mode.icon)
                        .font(.system(size: 24))
                        .foregroundColor(isActive ? .oceanSwell : .textSecondary)
                }

                Text(mode.displayName)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(isActive ? .textPrimary : .textSecondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(Color.bgCard)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isActive ? Color.oceanSwell : Color.borderColor, lineWidth: isActive ? 2 : 1)
            )
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

// MARK: - Theme Card

struct ThemeCard: View {
    let theme: AppTheme
    let mode: AppMode
    let isActive: Bool
    let onSelect: () -> Void

    var body: some View {
        let previewColors = ThemeManager.colorsFor(theme: theme, mode: mode)

        Button(action: onSelect) {
            HStack(spacing: 16) {
                // Mini preview
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(previewColors.bgDark)
                        .frame(width: 60, height: 44)

                    HStack(spacing: 3) {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(previewColors.bgCard)
                            .frame(width: 14, height: 32)

                        VStack(spacing: 3) {
                            RoundedRectangle(cornerRadius: 1.5)
                                .fill(previewColors.accent)
                                .frame(width: 28, height: 4)
                            RoundedRectangle(cornerRadius: 1.5)
                                .fill(previewColors.textSecondary)
                                .frame(width: 28, height: 3)
                            HStack(spacing: 2) {
                                RoundedRectangle(cornerRadius: 2)
                                    .fill(previewColors.bgCard)
                                    .frame(width: 12, height: 10)
                                RoundedRectangle(cornerRadius: 2)
                                    .fill(previewColors.bgCard)
                                    .frame(width: 12, height: 10)
                            }
                        }
                    }
                }
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(previewColors.borderColor, lineWidth: 1)
                )

                VStack(alignment: .leading, spacing: 2) {
                    Text(theme.displayName)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.textPrimary)
                    Text(theme.subtitle)
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                }

                Spacer()

                // Color dots preview
                HStack(spacing: 4) {
                    Circle()
                        .fill(previewColors.accent)
                        .frame(width: 14, height: 14)
                    Circle()
                        .fill(previewColors.accentSecondary)
                        .frame(width: 14, height: 14)
                    Circle()
                        .fill(previewColors.bgCard)
                        .frame(width: 14, height: 14)
                        .overlay(Circle().stroke(previewColors.borderColor, lineWidth: 1))
                }

                if isActive {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.oceanSwell)
                }
            }
            .padding(14)
            .background(Color.bgCard)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(isActive ? Color.oceanSwell : Color.borderColor, lineWidth: isActive ? 2 : 1)
            )
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

// MARK: - Brand Color Swatch

struct BrandColorSwatch: View {
    let name: String
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            RoundedRectangle(cornerRadius: 10)
                .fill(color)
                .frame(height: 44)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.borderColor, lineWidth: 1)
                )

            Text(name)
                .font(.caption2)
                .foregroundColor(.textSecondary)
        }
    }
}

// MARK: - Gradient Swatch

struct GradientSwatch: View {
    let name: String
    let gradient: LinearGradient

    var body: some View {
        VStack(spacing: 6) {
            RoundedRectangle(cornerRadius: 10)
                .fill(gradient)
                .frame(height: 32)

            Text(name)
                .font(.caption2)
                .foregroundColor(.textSecondary)
        }
    }
}

#Preview {
    NavigationStack {
        MoreView()
    }
}
