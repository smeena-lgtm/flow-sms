import SwiftUI

@main
struct FlowSMSApp: App {
    init() {
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
