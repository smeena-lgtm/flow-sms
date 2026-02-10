import SwiftUI
import MapKit

// MARK: - Map Annotation Model

struct ProjectMapAnnotation: Identifiable {
    let id: String
    let name: String
    let coordinate: CLLocationCoordinate2D
    let status: BuildingStatus
    let location: BuildingLocation
    let units: Int
}

// MARK: - Location Coordinates (matching web)

private enum ProjectCoordinates {
    static let miami = CLLocationCoordinate2D(latitude: 25.7617, longitude: -80.1918)
    static let riyadh = CLLocationCoordinate2D(latitude: 24.7136, longitude: 46.6753)

    static func coordinate(for location: BuildingLocation) -> CLLocationCoordinate2D {
        switch location {
        case .MIA: return miami
        case .RYD: return riyadh
        case .unknown: return miami
        }
    }
}

// MARK: - All Projects Map (for ProjectsListView)

struct ProjectsMapView: View {
    let buildings: [BuildingInfo]

    private var annotations: [ProjectMapAnnotation] {
        let miaBuildings = buildings.filter { $0.identity.locationEnum == .MIA }
        let rydBuildings = buildings.filter { $0.identity.locationEnum == .RYD }

        var result: [ProjectMapAnnotation] = []

        // Miami projects with offset to avoid overlap
        for (idx, building) in miaBuildings.enumerated() {
            let offset = Double(idx - miaBuildings.count / 2) * 0.008
            result.append(ProjectMapAnnotation(
                id: building.id,
                name: building.identity.displayName,
                coordinate: CLLocationCoordinate2D(
                    latitude: ProjectCoordinates.miami.latitude + offset,
                    longitude: ProjectCoordinates.miami.longitude + offset * 0.5
                ),
                status: building.identity.statusEnum,
                location: building.identity.locationEnum,
                units: Int(building.unitCounts.total)
            ))
        }

        // Riyadh projects with offset
        for (idx, building) in rydBuildings.enumerated() {
            let offset = Double(idx - rydBuildings.count / 2) * 0.008
            result.append(ProjectMapAnnotation(
                id: building.id,
                name: building.identity.displayName,
                coordinate: CLLocationCoordinate2D(
                    latitude: ProjectCoordinates.riyadh.latitude + offset,
                    longitude: ProjectCoordinates.riyadh.longitude + offset * 0.5
                ),
                status: building.identity.statusEnum,
                location: building.identity.locationEnum,
                units: Int(building.unitCounts.total)
            ))
        }

        return result
    }

    @State private var position: MapCameraPosition = .automatic

    var body: some View {
        VStack(spacing: 0) {
            // Map
            Map(position: $position) {
                ForEach(annotations) { annotation in
                    Annotation(annotation.name, coordinate: annotation.coordinate) {
                        ProjectMapPin(status: annotation.status)
                    }
                }
            }
            .mapStyle(.standard(elevation: .flat, pointsOfInterest: .excludingAll))
            .frame(height: 220)

            // Legend bar
            HStack(spacing: 16) {
                ForEach([BuildingStatus.PIT, .POT, .PHT], id: \.self) { status in
                    HStack(spacing: 4) {
                        Circle()
                            .fill(status.color)
                            .frame(width: 8, height: 8)
                        Text(status.shortName)
                            .font(.caption2)
                            .foregroundColor(.textSecondary)
                    }
                }
                Spacer()
                HStack(spacing: 4) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.caption2)
                        .foregroundColor(.textSecondary)
                    Text("\(buildings.count) projects")
                        .font(.caption2)
                        .foregroundColor(.textSecondary)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color.bgCard)
        }
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.borderColor, lineWidth: 1)
        )
        .padding(.horizontal)
    }
}

// MARK: - Single Building Map (for BuildingDetailView)

struct BuildingLocationMapView: View {
    let building: BuildingInfo

    private var coordinate: CLLocationCoordinate2D {
        ProjectCoordinates.coordinate(for: building.identity.locationEnum)
    }

    var body: some View {
        SectionCard(title: "Location", icon: "map") {
            VStack(spacing: 8) {
                Map(initialPosition: .region(MKCoordinateRegion(
                    center: coordinate,
                    span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
                ))) {
                    Annotation(building.identity.displayName, coordinate: coordinate) {
                        ProjectMapPin(status: building.identity.statusEnum, size: .large)
                    }
                }
                .mapStyle(.standard(elevation: .flat, pointsOfInterest: .excludingAll))
                .frame(height: 180)
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .allowsHitTesting(false)

                // Location info bar
                HStack(spacing: 12) {
                    HStack(spacing: 4) {
                        Image(systemName: "mappin.circle.fill")
                            .foregroundColor(building.identity.locationEnum.color)
                        Text(building.identity.locationEnum.displayName)
                            .font(.caption)
                            .foregroundColor(.textPrimary)
                    }

                    Spacer()

                    HStack(spacing: 4) {
                        Circle()
                            .fill(building.identity.statusEnum.color)
                            .frame(width: 8, height: 8)
                        Text(building.identity.statusEnum.shortName)
                            .font(.caption)
                            .foregroundColor(.textSecondary)
                    }
                }
            }
        }
    }
}

// MARK: - Map Pin Component

struct ProjectMapPin: View {
    let status: BuildingStatus
    var size: PinSize = .small

    enum PinSize {
        case small
        case large

        var diameter: CGFloat {
            switch self {
            case .small: return 16
            case .large: return 24
            }
        }

        var borderWidth: CGFloat {
            switch self {
            case .small: return 2
            case .large: return 3
            }
        }
    }

    var body: some View {
        Circle()
            .fill(status.color)
            .frame(width: size.diameter, height: size.diameter)
            .overlay(
                Circle()
                    .stroke(.white, lineWidth: size.borderWidth)
            )
            .shadow(color: status.color.opacity(0.5), radius: 4)
    }
}

// MARK: - Preview

#Preview("All Projects Map") {
    ZStack {
        Color.bgDark.ignoresSafeArea()
        ScrollView {
            ProjectsMapView(buildings: [])
                .padding(.vertical)
        }
    }
}

#Preview("Single Building Map") {
    ZStack {
        Color.bgDark.ignoresSafeArea()
        ScrollView {
            BuildingLocationMapView(building: BuildingInfo())
                .padding()
        }
    }
}
