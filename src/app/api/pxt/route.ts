import { NextResponse } from "next/server"
import type {
  BuildingInfo,
  BuildingInfoStats,
  BuildingInfoResponse,
} from "@/types/building"

// New Building Info Summary Sheet
const SHEET_ID = "1PHEw9O7_225mtkKZtgBvweHaqy2SGzv-Cb_SZHZv1Jc"
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`

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
  if (!value || value === "" || value === "-") return 0
  const cleaned = value.replace(/[",\s]/g, "")
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function parseNullableNumber(value: string): number | null {
  if (!value || value === "" || value === "-") return null
  const num = parseNumber(value)
  return num === 0 ? null : num
}

function parseBuilding(row: string[]): BuildingInfo {
  // Column indices based on schema (0-indexed, schema is 1-indexed)
  return {
    // S1 – Project Identity (cols 1-6 → indices 0-5)
    identity: {
      plotNo: row[0] || "",
      marketingName: row[1] || "",
      designManager: row[2] || "",
      numberOfBuildings: parseNumber(row[3]),
      plotAreaFt2: parseNumber(row[4]),
      far: parseNumber(row[5]),
    },
    // S2 – Gross Floor Area (cols 7-11 → indices 6-10)
    gfa: {
      resProposedGfaFt2: parseNumber(row[6]),
      resProposedGfaPct: parseNumber(row[7]),
      comProposedGfaFt2: parseNumber(row[8]),
      comProposedGfaPct: parseNumber(row[9]),
      totalProposedGfaFt2: parseNumber(row[10]),
    },
    // S3 – Residential Sellable (cols 12-20 → indices 11-19)
    residentialSellable: {
      suiteSelableFt2: parseNumber(row[11]),
      suiteSellableRatio: parseNumber(row[12]),
      balconySaFt2: parseNumber(row[13]),
      leasableFt2: parseNullableNumber(row[14]),
      balconyRatio: parseNumber(row[15]),
      totalSellableFt2: parseNumber(row[16]),
      nonSellableFt2: parseNumber(row[17]),
      nonSellableRatio: parseNumber(row[18]),
      efficiencySaGfa: parseNumber(row[19]),
    },
    // S4 – Commercial Sellable (cols 21-29 → indices 20-28)
    commercialSellable: {
      suiteSellableFt2: parseNumber(row[20]),
      suiteSellableRatio: parseNumber(row[21]),
      balconySaFt2: parseNumber(row[22]),
      leasableFt2: parseNullableNumber(row[23]),
      balconyRatio: parseNumber(row[24]),
      totalSellableFt2: parseNumber(row[25]),
      nonSellableFt2: parseNumber(row[26]),
      nonSellableRatio: parseNumber(row[27]),
      efficiencySaGfa: parseNumber(row[28]),
    },
    // S5 – Total Sellable (cols 30-37 → indices 29-36)
    totalSellable: {
      suiteSellableFt2: parseNumber(row[29]),
      suiteSellableRatio: parseNumber(row[30]),
      balconySaFt2: parseNumber(row[31]),
      balconyRatio: parseNumber(row[32]),
      totalSellableFt2: parseNumber(row[33]),
      nonSellableFt2: parseNumber(row[34]),
      nonSellableRatio: parseNumber(row[35]),
      efficiencySaGfa: parseNumber(row[36]),
    },
    // S6 – AMI (cols 38-39 → indices 37-38)
    ami: {
      areaFt2: parseNumber(row[37]),
      pct: parseNumber(row[38]),
    },
    // S6 – Unit Counts (cols 40-46 → indices 39-45)
    unitCounts: {
      studio: parseNumber(row[39]),
      oneBed: parseNumber(row[40]),
      twoBed: parseNumber(row[41]),
      threeBed: parseNumber(row[42]),
      fourBed: parseNumber(row[43]),
      liner: parseNumber(row[44]),
      total: parseNumber(row[45]),
    },
    // S6 – Unit Mix % (cols 47-52 → indices 46-51)
    unitMixPct: {
      studio: parseNumber(row[46]),
      oneBed: parseNumber(row[47]),
      twoBed: parseNumber(row[48]),
      threeBed: parseNumber(row[49]),
      fourBed: parseNumber(row[50]),
      liner: parseNumber(row[51]),
    },
    // S6 – Balcony % (cols 53-58 → indices 52-57)
    balconyPct: {
      studio: parseNumber(row[52]),
      oneBed: parseNumber(row[53]),
      twoBed: parseNumber(row[54]),
      threeBed: parseNumber(row[55]),
      fourBed: parseNumber(row[56]),
      liner: parseNumber(row[57]),
    },
    // S6 – Rental/Condo Split (cols 59-70 → indices 58-69)
    rentalCondoSplit: {
      studio: { rental: parseNumber(row[58]), condo: parseNumber(row[59]) },
      oneBed: { rental: parseNumber(row[60]), condo: parseNumber(row[61]) },
      twoBed: { rental: parseNumber(row[62]), condo: parseNumber(row[63]) },
      threeBed: { rental: parseNumber(row[64]), condo: parseNumber(row[65]) },
      fourBed: { rental: parseNumber(row[66]), condo: parseNumber(row[67]) },
      liner: { rental: parseNumber(row[68]), condo: parseNumber(row[69]) },
    },
    // S7 – Retail & Grid (cols 71-74 → indices 70-73)
    retailGrid: {
      gridFt: parseNumber(row[70]),
      retailSmallQty: parseNumber(row[71]),
      retailCornerQty: parseNumber(row[72]),
      retailRegularQty: parseNumber(row[73]),
    },
    // S8 – MEP Systems (cols 75-79 → indices 74-78)
    mep: {
      electricalLoadKw: parseNumber(row[74]),
      coolingLoadTr: parseNumber(row[75]),
      waterDemandFt3Day: parseNumber(row[76]),
      sewerageDemandFt3Day: parseNumber(row[77]),
      gasDemandFt3Hr: parseNumber(row[78]),
    },
    // S9 – Parking & Facade (cols 80-87 → indices 79-86)
    parkingFacade: {
      parkingRequired: parseNumber(row[79]),
      parkingProposed: parseNumber(row[80]),
      parkingEfficiencyFt2Car: parseNumber(row[81]),
      additionalParking: parseNumber(row[82]),
      evParkingLots: parseNumber(row[83]),
      facadeGlazingPct: parseNumber(row[84]),
      facadeSpandrelPct: parseNumber(row[85]),
      facadeSolidPct: parseNumber(row[86]),
    },
    // S10 – Lifts & Height (cols 88-94 → indices 87-93)
    liftsHeight: {
      passengerCount: parseNumber(row[87]),
      passengerCapacity: parseNumber(row[88]),
      serviceCount: parseNumber(row[89]),
      serviceCapacity: parseNumber(row[90]),
      totalLifts: parseNumber(row[91]),
      heightFt: parseNumber(row[92]),
      buildingConfiguration: row[93] || "",
    },
    // S11 – BUA (cols 95-96 → indices 94-95)
    bua: {
      buaFt2: parseNumber(row[94]),
      gfaOverBua: parseNumber(row[95]),
    },
  }
}

function calculateStats(buildings: BuildingInfo[]): BuildingInfoStats {
  const byDesignManager: Record<string, number> = {}

  buildings.forEach((b) => {
    const dm = b.identity.designManager || "Unknown"
    byDesignManager[dm] = (byDesignManager[dm] || 0) + 1
  })

  const totalEfficiency = buildings.reduce(
    (sum, b) => sum + b.totalSellable.efficiencySaGfa,
    0
  )
  const totalFar = buildings.reduce((sum, b) => sum + b.identity.far, 0)

  return {
    totalBuildings: buildings.length,
    totalUnits: buildings.reduce((sum, b) => sum + b.unitCounts.total, 0),
    totalGfaFt2: buildings.reduce((sum, b) => sum + b.gfa.totalProposedGfaFt2, 0),
    totalSellableFt2: buildings.reduce(
      (sum, b) => sum + b.totalSellable.totalSellableFt2,
      0
    ),
    avgEfficiency:
      buildings.length > 0 ? totalEfficiency / buildings.length : 0,
    avgFar: buildings.length > 0 ? totalFar / buildings.length : 0,
    totalParking: buildings.reduce(
      (sum, b) => sum + b.parkingFacade.parkingProposed,
      0
    ),
    byDesignManager,
  }
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
        totalCols: headerRow.length,
      })
    }

    // Skip header row, filter valid rows (must have Plot_No)
    const dataRows = rows.slice(1).filter((row) => row[0] && row[0].trim() !== "")

    // Parse all buildings
    const buildings: BuildingInfo[] = dataRows.map(parseBuilding)

    // Apply filters
    const dmFilter = searchParams.get("dm")?.toUpperCase()
    const configFilter = searchParams.get("config")

    let filteredBuildings = buildings

    if (dmFilter) {
      filteredBuildings = filteredBuildings.filter(
        (b) => b.identity.designManager.toUpperCase() === dmFilter
      )
    }

    if (configFilter) {
      filteredBuildings = filteredBuildings.filter((b) =>
        b.liftsHeight.buildingConfiguration
          .toLowerCase()
          .includes(configFilter.toLowerCase())
      )
    }

    // Calculate stats
    const stats = calculateStats(buildings) // Stats always from full dataset

    const result: BuildingInfoResponse = {
      buildings: filteredBuildings,
      stats,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Building Info API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch building data" },
      { status: 500 }
    )
  }
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
