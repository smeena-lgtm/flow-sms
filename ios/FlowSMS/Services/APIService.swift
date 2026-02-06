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
        return try await fetch(endpoint: "/pxt")
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
