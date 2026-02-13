import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0
    @Namespace private var animation
    @ObservedObject private var themeManager = ThemeManager.shared

    var body: some View {
        TabView(selection: $selectedTab) {
            // Analytics Tab (Home)
            NavigationStack {
                AnalyticsView()
            }
            .tabItem {
                Image(systemName: selectedTab == 0 ? "chart.bar.fill" : "chart.bar")
                Text("Analytics")
            }
            .tag(0)

            // Projects Tab (PXT Buildings)
            NavigationStack {
                ProjectsListView()
            }
            .tabItem {
                Image(systemName: selectedTab == 1 ? "building.2.fill" : "building.2")
                Text("Projects")
            }
            .tag(1)

            // HR Tab
            NavigationStack {
                HRView()
            }
            .tabItem {
                Image(systemName: selectedTab == 2 ? "person.2.fill" : "person.2")
                Text("HR")
            }
            .tag(2)

            // Tasks Tab
            NavigationStack {
                TasksView()
            }
            .tabItem {
                Image(systemName: selectedTab == 3 ? "checklist.checked" : "checklist")
                Text("Tasks")
            }
            .tag(3)

            // More Tab (Documents + Settings)
            NavigationStack {
                MoreView()
            }
            .tabItem {
                Image(systemName: selectedTab == 4 ? "ellipsis.circle.fill" : "ellipsis.circle")
                Text("More")
            }
            .tag(4)
        }
        .tint(themeManager.colors.accent)
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: selectedTab)
        .onAppear {
            configureTabBarAppearance()
        }
        .onChange(of: themeManager.changeCounter) { _, _ in
            configureTabBarAppearance()
        }
    }

    private func configureTabBarAppearance() {
        let c = themeManager.colors
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(c.tabBarBg)

        // Normal state
        appearance.stackedLayoutAppearance.normal.iconColor = UIColor(c.textSecondary)
        appearance.stackedLayoutAppearance.normal.titleTextAttributes = [
            .foregroundColor: UIColor(c.textSecondary)
        ]

        // Selected state
        appearance.stackedLayoutAppearance.selected.iconColor = UIColor(c.accent)
        appearance.stackedLayoutAppearance.selected.titleTextAttributes = [
            .foregroundColor: UIColor(c.accent)
        ]

        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
    }
}

#Preview {
    MainTabView()
}
