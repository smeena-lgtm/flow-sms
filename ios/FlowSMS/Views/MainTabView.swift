import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0
    @Namespace private var animation

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
        .tint(.oceanSwell)
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: selectedTab)
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

#Preview {
    MainTabView()
}
