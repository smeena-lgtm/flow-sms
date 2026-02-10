import SwiftUI

@main
struct FlowSMSApp: App {
    init() {
        // DIAGNOSTIC: Confirm new code is running
        print("🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀")
        print("🚀 FlowSMSApp STARTUP - Code Version: 2026-02-06-v2")
        print("🚀 BuildingInfoResponse.modelVersion: \(BuildingInfoResponse.modelVersion)")
        print("🚀 If you see 'projects' error but NOT this log, Xcode has old cached code!")
        print("🚀 To fix: Cmd+Shift+K (Clean Build Folder), delete DerivedData, rebuild")
        print("🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀")

        // Configure global appearance
        configureAppearance()
    }

    var body: some Scene {
        WindowGroup {
            MainTabView()
                .preferredColorScheme(.dark)
        }
    }

    private func configureAppearance() {
        // Navigation bar appearance
        let navBarAppearance = UINavigationBarAppearance()
        navBarAppearance.configureWithOpaqueBackground()
        navBarAppearance.backgroundColor = UIColor(Color.bgCard)
        navBarAppearance.titleTextAttributes = [
            .foregroundColor: UIColor(Color.textPrimary)
        ]
        navBarAppearance.largeTitleTextAttributes = [
            .foregroundColor: UIColor(Color.textPrimary)
        ]

        UINavigationBar.appearance().standardAppearance = navBarAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navBarAppearance
        UINavigationBar.appearance().compactAppearance = navBarAppearance
        UINavigationBar.appearance().tintColor = UIColor(Color.oceanSwell)
    }
}
