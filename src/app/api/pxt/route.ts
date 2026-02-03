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
    const statusFilter = searchParams.get("status")?.toUpperCase() // PIT, POT, PHT
    const locationFilter = searchParams.get("location")?.toUpperCase() // MIA, RYD

    const response = await fetch(SHEET_URL, {
      next: { revalidate: 30 }, // Cache for 30 seconds
    })

    if (!response.ok) {
      throw new Error("Failed to fetch Google Sheet")
    }

    const csv = await response.text()
    const rows = parseCSV(csv)

    // Skip header row
    const dataRows = rows.slice(1).filter((row) => row[0] && row[2]) // Must have Sr. No. and Project Name

    const projects: PXTProject[] = dataRows.map((row) => ({
      srNo: row[0] || "",
      plotName: row[1] || "",
      projectName: row[2] || "",
      plotArea: row[3] || "",
      location: row[4] || "",
      status: (row[5] || "PIT") as "PIT" | "POT" | "PHT",
      unitMix: {
        studio: parseNumber(row[6] || "0"),
        oneBR: parseNumber(row[7] || "0"),
        twoBR: parseNumber(row[8] || "0"),
        threeBR: parseNumber(row[9] || "0"),
        fourBR: parseNumber(row[10] || "0"),
        liner: parseNumber(row[11] || "0"),
        total: parseNumber(row[12] || "0"),
      },
      gfa: {
        residential: parseNumber(row[13] || "0"),
        commercial: parseNumber(row[14] || "0"),
        total: parseNumber(row[15] || "0"),
      },
      sellableArea: {
        residential: parseNumber(row[16] || "0"),
        commercial: parseNumber(row[17] || "0"),
        total: parseNumber(row[18] || "0"),
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
