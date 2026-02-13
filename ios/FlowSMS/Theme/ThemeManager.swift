import SwiftUI

// MARK: - Theme Enums

enum AppMode: String, CaseIterable, Identifiable {
    case night = "night"
    case day = "day"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .night: return "Night"
        case .day: return "Day"
        }
    }

    var icon: String {
        switch self {
        case .night: return "moon.fill"
        case .day: return "sun.max.fill"
        }
    }

    var colorScheme: ColorScheme {
        switch self {
        case .night: return .dark
        case .day: return .light
        }
    }
}

enum AppTheme: String, CaseIterable, Identifiable {
    case `default` = "default"
    case flow = "flow"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .default: return "Default"
        case .flow: return "Flow"
        }
    }

    var subtitle: String {
        switch self {
        case .default: return "Charcoal & Ocean"
        case .flow: return "Flow Brand Colors"
        }
    }
}

// MARK: - Theme Colors

struct ThemeColors {
    let bgDark: Color
    let bgCard: Color
    let bgSurface: Color
    let bgHover: Color
    let textPrimary: Color
    let textSecondary: Color
    let borderColor: Color
    let accent: Color
    let accentSecondary: Color

    // Additional semantic colors
    let navBarBg: Color
    let tabBarBg: Color
}

// MARK: - Theme Manager

class ThemeManager: ObservableObject {
    static let shared = ThemeManager()

    @Published var theme: AppTheme {
        didSet {
            UserDefaults.standard.set(theme.rawValue, forKey: "flow_app_theme")
            updateColors()
        }
    }

    @Published var mode: AppMode {
        didSet {
            UserDefaults.standard.set(mode.rawValue, forKey: "flow_app_mode")
            updateColors()
        }
    }

    @Published private(set) var colors: ThemeColors
    @Published var changeCounter: Int = 0

    init() {
        let savedTheme = UserDefaults.standard.string(forKey: "flow_app_theme") ?? "default"
        let savedMode = UserDefaults.standard.string(forKey: "flow_app_mode") ?? "night"

        let resolvedTheme = AppTheme(rawValue: savedTheme) ?? .default
        let resolvedMode = AppMode(rawValue: savedMode) ?? .night

        self.theme = resolvedTheme
        self.mode = resolvedMode
        self.colors = ThemeManager.colorsFor(theme: resolvedTheme, mode: resolvedMode)
    }

    func toggleMode() {
        mode = (mode == .night) ? .day : .night
    }

    private func updateColors() {
        colors = ThemeManager.colorsFor(theme: theme, mode: mode)
        changeCounter += 1
        configureUIKitAppearance()
    }

    // MARK: - UIKit Appearance

    func configureUIKitAppearance() {
        let c = colors

        // Navigation bar
        let navBarAppearance = UINavigationBarAppearance()
        navBarAppearance.configureWithOpaqueBackground()
        navBarAppearance.backgroundColor = UIColor(c.navBarBg)
        navBarAppearance.titleTextAttributes = [
            .foregroundColor: UIColor(c.textPrimary)
        ]
        navBarAppearance.largeTitleTextAttributes = [
            .foregroundColor: UIColor(c.textPrimary)
        ]

        UINavigationBar.appearance().standardAppearance = navBarAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navBarAppearance
        UINavigationBar.appearance().compactAppearance = navBarAppearance
        UINavigationBar.appearance().tintColor = UIColor(c.accent)

        // Tab bar
        let tabBarAppearance = UITabBarAppearance()
        tabBarAppearance.configureWithOpaqueBackground()
        tabBarAppearance.backgroundColor = UIColor(c.tabBarBg)

        tabBarAppearance.stackedLayoutAppearance.normal.iconColor = UIColor(c.textSecondary)
        tabBarAppearance.stackedLayoutAppearance.normal.titleTextAttributes = [
            .foregroundColor: UIColor(c.textSecondary)
        ]
        tabBarAppearance.stackedLayoutAppearance.selected.iconColor = UIColor(c.accent)
        tabBarAppearance.stackedLayoutAppearance.selected.titleTextAttributes = [
            .foregroundColor: UIColor(c.accent)
        ]

        UITabBar.appearance().standardAppearance = tabBarAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
    }

    // MARK: - Color Definitions per Theme+Mode

    static func colorsFor(theme: AppTheme, mode: AppMode) -> ThemeColors {
        switch (theme, mode) {

        // Default Night — Current look (PRESERVED)
        case (.default, .night):
            return ThemeColors(
                bgDark: Color(hex: "2D2D2D"),
                bgCard: Color(hex: "3D3D3D"),
                bgSurface: Color(hex: "353535"),
                bgHover: Color(hex: "4D4D4D"),
                textPrimary: Color(hex: "F3EDDF"),
                textSecondary: Color(hex: "A0A0A0"),
                borderColor: Color(hex: "4D4D4D"),
                accent: Color(hex: "7DADBB"),
                accentSecondary: Color(hex: "F99AA9"),
                navBarBg: Color(hex: "3D3D3D"),
                tabBarBg: Color(hex: "3D3D3D")
            )

        // Default Day — Light version
        case (.default, .day):
            return ThemeColors(
                bgDark: Color(hex: "F5F5F5"),
                bgCard: Color(hex: "FFFFFF"),
                bgSurface: Color(hex: "EAEAEA"),
                bgHover: Color(hex: "E0E0E0"),
                textPrimary: Color(hex: "2D2D2D"),
                textSecondary: Color(hex: "6B6B6B"),
                borderColor: Color(hex: "D0D0D0"),
                accent: Color(hex: "7DADBB"),
                accentSecondary: Color(hex: "F99AA9"),
                navBarBg: Color(hex: "FFFFFF"),
                tabBarBg: Color(hex: "FFFFFF")
            )

        // Flow Night — Brand dark theme
        case (.flow, .night):
            return ThemeColors(
                bgDark: Color(hex: "2D2D2D"),
                bgCard: Color(hex: "3D3D3D"),
                bgSurface: Color(hex: "353535"),
                bgHover: Color(hex: "4D4D4D"),
                textPrimary: Color(hex: "F3EDDF"),
                textSecondary: Color(hex: "B0B0A0"),
                borderColor: Color(hex: "4D4D4D"),
                accent: Color(hex: "7DADBB"),
                accentSecondary: Color(hex: "E89700"),
                navBarBg: Color(hex: "3D3D3D"),
                tabBarBg: Color(hex: "3D3D3D")
            )

        // Flow Day — Brand light theme
        case (.flow, .day):
            return ThemeColors(
                bgDark: Color(hex: "F3EDDF"),
                bgCard: Color(hex: "FFFFFF"),
                bgSurface: Color(hex: "EDE7D8"),
                bgHover: Color(hex: "E3DBC8"),
                textPrimary: Color(hex: "3D3D3D"),
                textSecondary: Color(hex: "6B6B6B"),
                borderColor: Color(hex: "D4CCBA"),
                accent: Color(hex: "7DADBB"),
                accentSecondary: Color(hex: "E89700"),
                navBarBg: Color(hex: "FFFFFF"),
                tabBarBg: Color(hex: "FFFFFF")
            )
        }
    }
}

// MARK: - Flow Brand Color Constants (always available regardless of theme)

extension Color {
    // These are the fixed brand palette — never change with theme
    static let flowMidnight = Color(hex: "3D3D3D")
    static let flowMoonlight = Color(hex: "F3EDDF")
    static let flowOceanSwell = Color(hex: "7DADBB")
    static let flowHeart = Color(hex: "F99AA9")
    static let flowSunlight = Color(hex: "E89700")
    static let flowRoots = Color(hex: "8C4500")
    static let flowOlive = Color(hex: "767317")
}
