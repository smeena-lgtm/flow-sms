import SwiftUI

@main
struct FlowSMSApp: App {
    @StateObject private var themeManager = ThemeManager.shared

    init() {
        // DIAGNOSTIC: Confirm new code is running
        print("🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀")
        print("🚀 FlowSMSApp STARTUP - Code Version: 2026-02-13-theme")
        print("🚀 BuildingInfoResponse.modelVersion: \(BuildingInfoResponse.modelVersion)")
        print("🚀 If you see 'projects' error but NOT this log, Xcode has old cached code!")
        print("🚀 To fix: Cmd+Shift+K (Clean Build Folder), delete DerivedData, rebuild")
        print("🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀")

        // Configure initial appearance from ThemeManager
        ThemeManager.shared.configureUIKitAppearance()
    }

    var body: some Scene {
        WindowGroup {
            MainTabView()
                .environmentObject(themeManager)
                .preferredColorScheme(themeManager.mode.colorScheme)
                .id(themeManager.changeCounter) // Force full re-render on theme change
        }
    }
}
