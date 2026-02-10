import Foundation

// MARK: - API Configuration

struct APIConfig {
    // Production URL - Vercel deployment
    static let baseURL = "https://flow-sms.vercel.app/api"
}

// MARK: - API Errors

enum APIError: Error, LocalizedError {
    case invalidURL
    case networkError(Error)
    case decodingError(Error)
    case serverError(Int)
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .decodingError(let error):
            return "Failed to parse response: \(error.localizedDescription)"
        case .serverError(let code):
            return "Server error: \(code)"
        case .unknown:
            return "Unknown error occurred"
        }
    }
}

// MARK: - API Service

@MainActor
class APIService: ObservableObject {
    static let shared = APIService()

    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        return decoder
    }()

    private init() {}

    // MARK: - Dashboard

    func fetchDashboard() async throws -> DashboardResponse {
        return try await fetch(endpoint: "/dashboard")
    }

    // MARK: - Buildings (PXT API)

    func fetchBuildings() async throws -> BuildingInfoResponse {
        print("🚀🚀🚀 APIService.fetchBuildings() - Code Version 2026-02-06-v2 🚀🚀🚀")
        print("📊 Fetching buildings from /api/pxt...")
        print("📊 BuildingInfoResponse.modelVersion: \(BuildingInfoResponse.modelVersion)")

        guard let url = URL(string: APIConfig.baseURL + "/pxt") else {
            throw APIError.invalidURL
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            print("✅ Got \(data.count) bytes from /api/pxt")

            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.unknown
            }

            guard (200...299).contains(httpResponse.statusCode) else {
                throw APIError.serverError(httpResponse.statusCode)
            }

            // Debug: print first 500 chars of response
            if let jsonString = String(data: data, encoding: .utf8) {
                print("📝 Response preview: \(String(jsonString.prefix(500)))")

                // Check top-level keys
                if let jsonData = jsonString.data(using: .utf8),
                   let json = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any] {
                    print("🔑 TOP LEVEL JSON KEYS: \(Array(json.keys))")
                }
            }

            do {
                print("🔄 About to decode BuildingInfoResponse (model version: \(BuildingInfoResponse.modelVersion))...")
                let result = try decoder.decode(BuildingInfoResponse.self, from: data)
                print("✅ Decoded \(result.buildings.count) buildings successfully!")
                return result
            } catch let decodingError as DecodingError {
                print("❌❌❌ DECODING ERROR (version 2026-02-06-v2) ❌❌❌")
                print("❌ Error type: \(type(of: decodingError))")
                switch decodingError {
                case .keyNotFound(let key, let context):
                    print("❌ KEY NOT FOUND: '\(key.stringValue)'")
                    print("❌ Coding path: \(context.codingPath.map { $0.stringValue })")
                    print("❌ Debug: \(context.debugDescription)")
                case .typeMismatch(let type, let context):
                    print("❌ TYPE MISMATCH: expected \(type)")
                    print("❌ Coding path: \(context.codingPath.map { $0.stringValue })")
                case .valueNotFound(let type, let context):
                    print("❌ VALUE NOT FOUND: \(type)")
                    print("❌ Coding path: \(context.codingPath.map { $0.stringValue })")
                case .dataCorrupted(let context):
                    print("❌ DATA CORRUPTED")
                    print("❌ Coding path: \(context.codingPath.map { $0.stringValue })")
                @unknown default:
                    print("❌ Unknown decoding error")
                }
                throw APIError.decodingError(decodingError)
            } catch {
                print("❌ Non-decoding error: \(error)")
                throw APIError.decodingError(error)
            }
        } catch let error as APIError {
            throw error
        } catch {
            print("❌ Network error: \(error)")
            throw APIError.networkError(error)
        }
    }

    // MARK: - HR (Employees)

    func fetchEmployees() async throws -> [Employee] {
        print("📊 Fetching employees from /api/hr...")
        let response: HRResponse = try await fetch(endpoint: "/hr")
        // Combine team (on-board) and tbj employees
        return response.team + response.tbj
    }

    func fetchHRStats() async throws -> HRStats {
        print("📊 Fetching HR stats from /api/hr...")
        let response: HRResponse = try await fetch(endpoint: "/hr")

        // Calculate stats from employees
        let allEmployees = response.team + response.tbj
        var stats = HRStats()
        stats.total = allEmployees.count
        stats.mia = allEmployees.filter { $0.office.uppercased() == "MIA" }.count
        stats.ksa = allEmployees.filter { $0.office.uppercased() == "KSA" }.count
        stats.dxb = allEmployees.filter { $0.office.uppercased() == "DXB" }.count
        stats.tbj = response.tbj.count
        return stats
    }

    // MARK: - Tasks

    func fetchTasks() async throws -> TasksResponse {
        print("📊 Fetching tasks from /api/tasks...")
        return try await fetch(endpoint: "/tasks")
    }

    // MARK: - Legacy Projects (kept for compatibility)

    func fetchProjects() async throws -> [Project] {
        return try await fetch(endpoint: "/projects")
    }

    func fetchProject(id: String) async throws -> Project {
        return try await fetch(endpoint: "/projects/\(id)")
    }

    // MARK: - Generic Fetch

    private func fetch<T: Decodable>(endpoint: String) async throws -> T {
        guard let url = URL(string: APIConfig.baseURL + endpoint) else {
            throw APIError.invalidURL
        }

        print("🔗 Fetching: \(url.absoluteString)")

        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            print("✅ Got response: \(data.count) bytes")

            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.unknown
            }

            guard (200...299).contains(httpResponse.statusCode) else {
                throw APIError.serverError(httpResponse.statusCode)
            }

            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                print("Decoding error: \(error)")
                print("Response data: \(String(data: data, encoding: .utf8) ?? "nil")")
                throw APIError.decodingError(error)
            }
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.networkError(error)
        }
    }
}
