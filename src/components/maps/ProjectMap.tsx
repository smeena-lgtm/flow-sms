"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Project {
  srNo: string
  projectName: string
  location: string
  status: string
  unitMix?: { total: number }
}

interface ProjectMapProps {
  projects: Project[]
  selectedProject?: string
  height?: string
  showAllMarkers?: boolean
}

// Location coordinates
const LOCATIONS: Record<string, [number, number]> = {
  MIA: [25.7617, -80.1918], // Miami
  RYD: [24.7136, 46.6753], // Riyadh
}

// Status colors
const STATUS_COLORS: Record<string, string> = {
  PIT: "#EAB308", // Yellow
  POT: "#22C55E", // Green
  PHT: "#A855F7", // Purple
}

export default function ProjectMap({
  projects,
  selectedProject,
  height = "300px",
  showAllMarkers = true,
}: ProjectMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    })

    // Add dark tile layer
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }
    ).addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer)
      }
    })

    if (!showAllMarkers && selectedProject) {
      // Show single project
      const project = projects.find((p) => p.srNo === selectedProject)
      if (project) {
        const coords = LOCATIONS[project.location] || LOCATIONS.MIA
        const color = STATUS_COLORS[project.status] || "#3B82F6"

        L.circleMarker(coords, {
          radius: 12,
          fillColor: color,
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindPopup(
            `<div style="text-align:center">
              <strong>${project.projectName}</strong><br/>
              <span style="color:${color}">${project.status}</span>
            </div>`
          )

        map.setView(coords, 12)
      }
    } else {
      // Show all projects
      const bounds: L.LatLngBounds = L.latLngBounds([])

      // Group projects by location to avoid overlapping
      const miaProjects = projects.filter((p) => p.location === "MIA")
      const rydProjects = projects.filter((p) => p.location === "RYD")

      // Add Miami cluster
      if (miaProjects.length > 0) {
        const coords = LOCATIONS.MIA
        bounds.extend(coords)

        // Add individual markers with slight offset
        miaProjects.forEach((project, idx) => {
          const offset = (idx - miaProjects.length / 2) * 0.01
          const color = STATUS_COLORS[project.status] || "#3B82F6"

          L.circleMarker([coords[0] + offset, coords[1] + offset * 0.5], {
            radius: 8,
            fillColor: color,
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
          })
            .addTo(map)
            .bindPopup(
              `<div style="text-align:center">
                <strong>${project.projectName}</strong><br/>
                <span style="color:${color}">${project.status}</span><br/>
                ${project.unitMix?.total ? `${project.unitMix.total} units` : ""}
              </div>`
            )
        })
      }

      // Add Riyadh cluster
      if (rydProjects.length > 0) {
        const coords = LOCATIONS.RYD
        bounds.extend(coords)

        rydProjects.forEach((project, idx) => {
          const offset = (idx - rydProjects.length / 2) * 0.01
          const color = STATUS_COLORS[project.status] || "#3B82F6"

          L.circleMarker([coords[0] + offset, coords[1] + offset * 0.5], {
            radius: 8,
            fillColor: color,
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
          })
            .addTo(map)
            .bindPopup(
              `<div style="text-align:center">
                <strong>${project.projectName}</strong><br/>
                <span style="color:${color}">${project.status}</span><br/>
                ${project.unitMix?.total ? `${project.unitMix.total} units` : ""}
              </div>`
            )
        })
      }

      // Fit bounds with padding
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 })
      }
    }
  }, [projects, selectedProject, showAllMarkers])

  return (
    <div
      ref={mapRef}
      style={{ height, width: "100%" }}
      className="rounded-xl overflow-hidden border border-border-color"
    />
  )
}
