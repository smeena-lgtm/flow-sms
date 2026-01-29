import { NextResponse } from "next/server"

// Google Sheet ID for Project Statistics (separate sheet for data sanctity)
const SHEET_ID = "1HORluZ8llo3uKTLfe884cI9C7jNe38ny_5OQd1yCeus"

// GID for the Project Stats tab
const PROJECT_STATS_GID = "1893317411"

/*
GOOGLE SHEET STRUCTURE - Create a tab with these columns:

A: Plot #
B: Project
C: Plot Area (m²)
D: FAR
E: Configuration
F: Residential GFA Allowed (m²)
G: Commercial GFA Allowed (m²)
H: Total GFA Allowed (m²)
I: Residential GFA Achieved (m²)
J: Commercial GFA Achieved (m²)
K: Total GFA Achieved (m²)
L: Suite Sellable (m²)
M: Balcony Sellable (m²)
N: Total Sellable (m²)
O: Sellable Efficiency (%)
P: Amenities (m²)
Q: Efficiency Amenities (%)
R: 1 BD
S: 2 BD
T: 3 BD
U: 4 BD
V: Total Units
W: Parking Required
X: Parking Proposed
Y: Parking Efficiency (%)
Z: Passenger Lifts
AA: Service Lifts
AB: Total Lifts
AC: BUA (m²)
AD: GFA/BUA
AE: DMD (m)
AF: OLS (m)
AG: Height (m)
*/

export interface ProjectStats {
  plotNumber: string
  project: string
  plotArea: number
  far: number
  configuration: string

  // GFA Metrics
  residentialGFAAllowed: number
  commercialGFAAllowed: number
  totalGFAAllowed: number
  residentialGFAAchieved: number
  commercialGFAAchieved: number
  totalGFAAchieved: number

  // Sellable Metrics
  suiteSellable: number
  balconySellable: number
  totalSellable: number
  sellableEfficiency: number

  // Amenities
  amenities: number
  efficiencyAmenities: number

  // Unit Mix
  units1BD: number
  units2BD: number
  units3BD: number
  units4BD: number
  totalUnits: number

  // Parking
  parkingRequired: number
  parkingProposed: number
  parkingEfficiency: number

  // Lifts
  passengerLifts: number
  serviceLifts: number
  totalLifts: number

  // Building Metrics
  bua: number
  gfaBuaRatio: number
  dmd: number
  ols: number
  height: number
}

interface AggregatedStats {
  totalProjects: number
  totalPlotArea: number
  totalGFAAllowed: number
  totalGFAAchieved: number
  gfaUtilization: number
  totalSellable: number
  avgSellableEfficiency: number
  totalUnits: number
  unitMix: {
    bd1: number
    bd2: number
    bd3: number
    bd4: number
  }
  totalParkingRequired: number
  totalParkingProposed: number
  avgParkingEfficiency: number
  totalLifts: number
}

async function fetchSheetData(gid: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.status}`)
    }

    const csv = await response.text()

    // Parse CSV handling quoted values
    const rows = csv.split("\n").map(row => {
      const values: string[] = []
      let current = ""
      let inQuotes = false

      for (const char of row) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim())
      return values
    })

    return rows
  } catch (error) {
    console.error("Error fetching sheet:", error)
    return []
  }
}

function parseNumber(value: string): number {
  if (!value) return 0
  // Remove commas, percentage signs, and parse
  const cleaned = value.replace(/[,%]/g, "").trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function parseProjectStats(rows: string[][]): ProjectStats[] {
  // Skip header row
  return rows.slice(1)
    .filter(row => row[0]?.trim()) // Must have a plot number
    .map(row => ({
      plotNumber: row[0] || "",
      project: row[1] || "",
      plotArea: parseNumber(row[2]),
      far: parseNumber(row[3]),
      configuration: row[4] || "",

      residentialGFAAllowed: parseNumber(row[5]),
      commercialGFAAllowed: parseNumber(row[6]),
      totalGFAAllowed: parseNumber(row[7]),
      residentialGFAAchieved: parseNumber(row[8]),
      commercialGFAAchieved: parseNumber(row[9]),
      totalGFAAchieved: parseNumber(row[10]),

      suiteSellable: parseNumber(row[11]),
      balconySellable: parseNumber(row[12]),
      totalSellable: parseNumber(row[13]),
      sellableEfficiency: parseNumber(row[14]),

      amenities: parseNumber(row[15]),
      efficiencyAmenities: parseNumber(row[16]),

      units1BD: parseNumber(row[17]),
      units2BD: parseNumber(row[18]),
      units3BD: parseNumber(row[19]),
      units4BD: parseNumber(row[20]),
      totalUnits: parseNumber(row[21]),

      parkingRequired: parseNumber(row[22]),
      parkingProposed: parseNumber(row[23]),
      parkingEfficiency: parseNumber(row[24]),

      passengerLifts: parseNumber(row[25]),
      serviceLifts: parseNumber(row[26]),
      totalLifts: parseNumber(row[27]),

      bua: parseNumber(row[28]),
      gfaBuaRatio: parseNumber(row[29]),
      dmd: parseNumber(row[30]),
      ols: parseNumber(row[31]),
      height: parseNumber(row[32])
    }))
}

function calculateAggregatedStats(projects: ProjectStats[]): AggregatedStats {
  const totalProjects = projects.length

  const totalPlotArea = projects.reduce((sum, p) => sum + p.plotArea, 0)
  const totalGFAAllowed = projects.reduce((sum, p) => sum + p.totalGFAAllowed, 0)
  const totalGFAAchieved = projects.reduce((sum, p) => sum + p.totalGFAAchieved, 0)
  const gfaUtilization = totalGFAAllowed > 0 ? (totalGFAAchieved / totalGFAAllowed) * 100 : 0

  const totalSellable = projects.reduce((sum, p) => sum + p.totalSellable, 0)
  const avgSellableEfficiency = projects.length > 0
    ? projects.reduce((sum, p) => sum + p.sellableEfficiency, 0) / projects.length
    : 0

  const totalUnits = projects.reduce((sum, p) => sum + p.totalUnits, 0)
  const unitMix = {
    bd1: projects.reduce((sum, p) => sum + p.units1BD, 0),
    bd2: projects.reduce((sum, p) => sum + p.units2BD, 0),
    bd3: projects.reduce((sum, p) => sum + p.units3BD, 0),
    bd4: projects.reduce((sum, p) => sum + p.units4BD, 0)
  }

  const totalParkingRequired = projects.reduce((sum, p) => sum + p.parkingRequired, 0)
  const totalParkingProposed = projects.reduce((sum, p) => sum + p.parkingProposed, 0)
  const avgParkingEfficiency = projects.length > 0
    ? projects.reduce((sum, p) => sum + p.parkingEfficiency, 0) / projects.length
    : 0

  const totalLifts = projects.reduce((sum, p) => sum + p.totalLifts, 0)

  return {
    totalProjects,
    totalPlotArea,
    totalGFAAllowed,
    totalGFAAchieved,
    gfaUtilization,
    totalSellable,
    avgSellableEfficiency,
    totalUnits,
    unitMix,
    totalParkingRequired,
    totalParkingProposed,
    avgParkingEfficiency,
    totalLifts
  }
}

export async function GET() {
  try {
    const rows = await fetchSheetData(PROJECT_STATS_GID)
    const projects = parseProjectStats(rows)
    const aggregated = calculateAggregatedStats(projects)

    return NextResponse.json({
      projects,
      aggregated,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error("Project Stats API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch project statistics" },
      { status: 500 }
    )
  }
}
