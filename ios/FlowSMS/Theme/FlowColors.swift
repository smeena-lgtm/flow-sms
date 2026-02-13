import SwiftUI

// Flow Brand Colors — Fixed palette (never change with theme)
extension Color {
    // Primary Brand Colors
    static let midnight = Color(hex: "3D3D3D")
    static let moonlight = Color(hex: "F3EDDF")
    static let oceanSwell = Color(hex: "7DADBB")
    static let heart = Color(hex: "F99AA9")
    static let sunlight = Color(hex: "E89700")
    static let roots = Color(hex: "8C4500")
    static let olive = Color(hex: "767317")

    // Dynamic UI Colors — Change with active theme
    static var bgDark: Color { ThemeManager.shared.colors.bgDark }
    static var bgCard: Color { ThemeManager.shared.colors.bgCard }
    static var bgSurface: Color { ThemeManager.shared.colors.bgSurface }
    static var bgHover: Color { ThemeManager.shared.colors.bgHover }
    static var textPrimary: Color { ThemeManager.shared.colors.textPrimary }
    static var textSecondary: Color { ThemeManager.shared.colors.textSecondary }
    static var borderColor: Color { ThemeManager.shared.colors.borderColor }
}

// Hex color initializer
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
