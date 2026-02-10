import SwiftUI

struct HRView: View {
    @StateObject private var viewModel = HRViewModel()
    @State private var selectedTab = 0

    var body: some View {
        VStack(spacing: 0) {
            if viewModel.isLoading {
                Spacer()
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .oceanSwell))
                Spacer()
            } else if let error = viewModel.error {
                Spacer()
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundColor(.sunlight)
                    Text(error)
                        .foregroundColor(.textSecondary)
                    Button("Retry") {
                        Task { await viewModel.loadData() }
                    }
                    .foregroundColor(.oceanSwell)
                }
                Spacer()
            } else {
                ScrollView {
                    VStack(spacing: 16) {
                        // Office Summary Cards
                        OfficeSummaryRow(viewModel: viewModel)

                        // Tab Picker
                        Picker("Status", selection: $selectedTab) {
                            Text("On-Board (\(viewModel.onBoardCount))").tag(0)
                            Text("To Be Joined (\(viewModel.tbjCount))").tag(1)
                        }
                        .pickerStyle(.segmented)
                        .padding(.horizontal)

                        // Employee List
                        LazyVStack(spacing: 12) {
                            ForEach(filteredEmployees) { employee in
                                EmployeeCard(employee: employee)
                            }
                        }
                        .padding(.horizontal)
                    }
                    .padding(.vertical)
                }
            }
        }
        .background(Color.bgDark)
        .navigationTitle("HR")
        .navigationBarTitleDisplayMode(.large)
        .refreshable {
            await viewModel.loadData()
        }
        .task {
            await viewModel.loadData()
        }
    }

    var filteredEmployees: [Employee] {
        if selectedTab == 0 {
            return viewModel.employees.filter { $0.status == "On-Board" }
        } else {
            return viewModel.employees.filter { $0.status == "TBJ" }
        }
    }
}

// MARK: - Office Summary Row

struct OfficeSummaryRow: View {
    @ObservedObject var viewModel: HRViewModel

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                OfficeSummaryCard(
                    office: "MIA",
                    onBoard: viewModel.miaOnBoard,
                    tbj: viewModel.miaTBJ,
                    color: .cyan
                )
                OfficeSummaryCard(
                    office: "KSA",
                    onBoard: viewModel.ksaOnBoard,
                    tbj: viewModel.ksaTBJ,
                    color: .sunlight
                )
                OfficeSummaryCard(
                    office: "DXB",
                    onBoard: viewModel.dxbOnBoard,
                    tbj: viewModel.dxbTBJ,
                    color: .purple
                )
            }
            .padding(.horizontal)
        }
    }
}

struct OfficeSummaryCard: View {
    let office: String
    let onBoard: Int
    let tbj: Int
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(office)
                    .font(.headline)
                    .foregroundColor(.textPrimary)
                Spacer()
                Circle()
                    .fill(color)
                    .frame(width: 8, height: 8)
            }

            HStack(spacing: 16) {
                VStack(alignment: .leading) {
                    Text("\(onBoard)")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.green)
                    Text("On-Board")
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                }

                VStack(alignment: .leading) {
                    Text("\(tbj)")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.orange)
                    Text("TBJ")
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                }
            }
        }
        .padding()
        .frame(width: 160)
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(color.opacity(0.3), lineWidth: 1)
        )
    }
}

// MARK: - Employee Card

struct EmployeeCard: View {
    let employee: Employee

    var body: some View {
        HStack(spacing: 12) {
            // Avatar
            ZStack {
                Circle()
                    .fill(officeColor.opacity(0.2))
                    .frame(width: 44, height: 44)

                Text(employee.initials)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(officeColor)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(employee.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.textPrimary)

                Text(employee.title)
                    .font(.caption)
                    .foregroundColor(.textSecondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text(employee.office)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(officeColor)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(officeColor.opacity(0.15))
                    .clipShape(Capsule())

                if !employee.reportsTo.isEmpty {
                    Text("→ \(employee.reportsTo)")
                        .font(.caption2)
                        .foregroundColor(.textSecondary)
                }
            }
        }
        .padding()
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    var officeColor: Color {
        switch employee.office {
        case "MIA": return .cyan
        case "KSA": return .sunlight
        case "DXB": return .purple
        default: return .textSecondary
        }
    }
}

// MARK: - View Model

@MainActor
class HRViewModel: ObservableObject {
    @Published var employees: [Employee] = []
    @Published var isLoading = false
    @Published var error: String?

    var onBoardCount: Int {
        employees.filter { $0.status == "On-Board" }.count
    }

    var tbjCount: Int {
        employees.filter { $0.status == "TBJ" }.count
    }

    var miaOnBoard: Int {
        employees.filter { $0.office == "MIA" && $0.status == "On-Board" }.count
    }

    var miaTBJ: Int {
        employees.filter { $0.office == "MIA" && $0.status == "TBJ" }.count
    }

    var ksaOnBoard: Int {
        employees.filter { $0.office == "KSA" && $0.status == "On-Board" }.count
    }

    var ksaTBJ: Int {
        employees.filter { $0.office == "KSA" && $0.status == "TBJ" }.count
    }

    var dxbOnBoard: Int {
        employees.filter { $0.office == "DXB" && $0.status == "On-Board" }.count
    }

    var dxbTBJ: Int {
        employees.filter { $0.office == "DXB" && $0.status == "TBJ" }.count
    }

    func loadData() async {
        isLoading = true
        error = nil

        do {
            employees = try await APIService.shared.fetchEmployees()
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }
}

// MARK: - Employee Model

struct Employee: Codable, Identifiable {
    var id: String { srNo }
    let srNo: String
    let name: String
    let title: String
    let office: String
    let status: String
    let reportsTo: String

    var initials: String {
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))"
        }
        return String(name.prefix(2)).uppercased()
    }

    private enum CodingKeys: String, CodingKey {
        case srNo, name, title, office, status, reportsTo
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        srNo = (try? container.decode(String.self, forKey: .srNo)) ?? UUID().uuidString
        name = (try? container.decode(String.self, forKey: .name)) ?? "Unknown"
        title = (try? container.decode(String.self, forKey: .title)) ?? ""
        office = (try? container.decode(String.self, forKey: .office)) ?? ""
        status = (try? container.decode(String.self, forKey: .status)) ?? "On-Board"
        reportsTo = (try? container.decode(String.self, forKey: .reportsTo)) ?? ""
    }
}

struct HRResponse: Codable {
    let team: [Employee]  // On-Board employees
    let tbj: [Employee]   // To Be Joined employees
    let stats: HRResponseStats
    let officeSummaries: [OfficeSummary]

    // Convenience: all employees combined
    var employees: [Employee] {
        team + tbj
    }

    struct HRResponseStats: Codable {
        let totalEmployees: Int
        let totalTBJ: Int
        let byOffice: [String: Int]
        let byStage: [String: Int]
    }

    struct OfficeSummary: Codable {
        let office: String
        let totalEmployees: Int
        let onBoard: Int
        let toBeJoined: Int
    }
}

#Preview {
    NavigationStack {
        HRView()
    }
}
