import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Image(systemName: "square.grid.2x2.fill")
                    Text("Dashboard")
                }
                .tag(0)

            NavigationStack {
                ProjectsListView()
            }
            .tabItem {
                Image(systemName: "folder.fill")
                Text("Projects")
            }
            .tag(1)

            // Placeholder for Team
            PlaceholderView(title: "Team", icon: "person.2.fill", message: "Team management coming soon")
                .tabItem {
                    Image(systemName: "person.2.fill")
                    Text("Team")
                }
                .tag(2)

            // Placeholder for Settings
            PlaceholderView(title: "Settings", icon: "gearshape.fill", message: "Settings coming soon")
                .tabItem {
                    Image(systemName: "gearshape.fill")
                    Text("Settings")
                }
                .tag(3)
        }
        .tint(.oceanSwell)
        .onAppear {
            // Customize tab bar appearance
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = UIColor(Color.bgCard)

            // Normal state
            appearance.stackedLayoutAppearance.normal.iconColor = UIColor(Color.textSecondary)
            appearance.stackedLayoutAppearance.normal.titleTextAttributes = [
                .foregroundColor: UIColor(Color.textSecondary)
            ]

            // Selected state
            appearance.stackedLayoutAppearance.selected.iconColor = UIColor(Color.oceanSwell)
            appearance.stackedLayoutAppearance.selected.titleTextAttributes = [
                .foregroundColor: UIColor(Color.oceanSwell)
            ]

            UITabBar.appearance().standardAppearance = appearance
            UITabBar.appearance().scrollEdgeAppearance = appearance
        }
    }
}

// MARK: - Placeholder View

struct PlaceholderView: View {
    let title: String
    let icon: String
    let message: String

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.system(size: 60))
                    .foregroundColor(.textSecondary)

                Text(message)
                    .font(.headline)
                    .foregroundColor(.textSecondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.bgDark)
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.large)
            .toolbarBackground(Color.bgCard, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
    }
}

#Preview {
    MainTabView()
}
