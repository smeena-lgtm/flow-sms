import { NextResponse } from "next/server"

const SHEET_ID = "1AKxB64tY68H7RvzzzKWOjsZlKrQB7GI91PA9JacfUlQ"
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=MASTER`

interface PXTProject {
  srNo: string
  plotName: string
  projectName: string
  plotArea: string
  location: string
  status: "PIT" | "POT" | "PHT"
  unitMix: {
    studio: number
    oneBR: number
    twoBR: number
    threeBR: number
    fourBR: number
    liner: number
    total: number
  }
  gfa: {
    residential: number
    commercial: number
    total: number
  }
  sellableArea: {
    residential: number
    commercial: number
    total: number
  }
}

interface PXTStats {
  total: number
  pit: number
  pot: number
  pht: number
  byLocation: {
    miami: number
    riyadh: number
  }
  totalUnits: number
  totalGFA: number
}

function parseCSV(csv: string): string[][] {
  const lines = csv.split("\n")
  return lines.map((line) => {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  })
}

function parseNumber(value: string): number {
  const cleaned = value.replace(/[",]/g, "")
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const response = await fetch(SHEET_URL, {
      next: { revalidate: 30 }, // Cache for 30 seconds
    })

    if (!response.ok) {
      throw new Error("Failed to fetch Google Sheet")
    }

    const csv = await response.text()
    const rows = parseCSV(csv)

    // Debug mode - return raw column structure
    if (searchParams.get("debug") === "true") {
      const headerRow = rows[0] || []
      const firstDataRow = rows[1] || []
      return NextResponse.json({
        headers: headerRow.map((h, i) => `[${i}] ${h}`),
        firstRow: firstDataRow.map((v, i) => `[${i}] ${v}`),
        totalRows: rows.length - 1,
      })
    }

    // Filter params
    const statusFilter = searchParams.get("status")?.toUpperCase() // PIT, POT, PHT
    const locationFilter = searchParams.get("location")?.toUpperCase() // MIA, RYD

    // Skip header row
    const dataRows = rows.slice(1).filter((row) => row[0] && row[2]) // Must have Sr. No. and Project Name

    // Column mapping based on actual Google Sheet structure
    const projects: PXTProject[] = dataRows.map((row) => ({
      srNo: row[0] || "",
      plotName: row[1] || "",
      projectName: row[2] || "",
      plotArea: row[3] || "",
      location: row[5] || "",  // Column F: Location (MIA or RYD)
      status: (row[6] || "PIT") as "PIT" | "POT" | "PHT",  // Column G: Status (PIT, POT, PHT)
      unitMix: {
        studio: parseNumber(row[7] || "0"),   // [7] ST (Studio)
        oneBR: parseNumber(row[8] || "0"),    // [8] 1 BR
        twoBR: parseNumber(row[9] || "0"),    // [9] 2 BR
        threeBR: parseNumber(row[10] || "0"), // [10] 3 BR
        fourBR: parseNumber(row[11] || "0"),  // [11] 4 BR
        liner: parseNumber(row[12] || "0"),   // [12] LINER
        total: parseNumber(row[13] || "0"),   // [13] Total Unit mix
      },
      gfa: {
        residential: parseNumber(row[14] || "0"),  // [14] GFA RESI
        commercial: parseNumber(row[15] || "0"),   // [15] GFA COMM
        total: parseNumber(row[16] || "0"),        // [16] GFA TOTAL
      },
      sellableArea: {
        residential: parseNumber(row[17] || "0"),  // [17] SA RESI
        commercial: parseNumber(row[18] || "0"),   // [18] SA COMM
        total: parseNumber(row[19] || "0"),        // [19] SA TOTAL
      },
    }))

    // Apply filters
    let filteredProjects = projects

    if (statusFilter && ["PIT", "POT", "PHT"].includes(statusFilter)) {
      filteredProjects = filteredProjects.filter((p) => p.status === statusFilter)
    }

    if (locationFilter && ["MIA", "RYD"].includes(locationFilter)) {
      filteredProjects = filteredProjects.filter((p) => p.location === locationFilter)
    }

    // Calculate stats
    const stats: PXTStats = {
      total: projects.length,
      pit: projects.filter((p) => p.status === "PIT").length,
      pot: projects.filter((p) => p.status === "POT").length,
      pht: projects.filter((p) => p.status === "PHT").length,
      byLocation: {
        miami: projects.filter((p) => p.location === "MIA").length,
        riyadh: projects.filter((p) => p.location === "RYD").length,
      },
      totalUnits: projects.reduce((sum, p) => sum + p.unitMix.total, 0),
      totalGFA: projects.reduce((sum, p) => sum + p.gfa.total, 0),
    }

    // Group by status
    const grouped = {
      pit: projects.filter((p) => p.status === "PIT"),
      pot: projects.filter((p) => p.status === "POT"),
      pht: projects.filter((p) => p.status === "PHT"),
    }

    return NextResponse.json({
      projects: filteredProjects,
      grouped,
      stats,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("PXT API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch PXT data" },
      { status: 500 }
    )
  }
}
