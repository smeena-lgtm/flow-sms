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
  // Column indices based on actual sheet structure:
  // 0: Plot_No, 1: Marketing_Name, 2: Design_Manager, 3: Location, 4: Status, 5: No_of_Buildings, 6: Plot_Area, 7: FAR
  // Then the rest of the columns shift by +2 from original schema
  return {
    // S1 – Project Identity
    identity: {
      plotNo: row[0] || "",
      marketingName: row[1] || "",
      designManager: row[2] || "",
      location: row[3] || "",      // NEW: MIA or RYD
      status: row[4] || "",        // NEW: PIT, POT, PHT
      numberOfBuildings: parseNumber(row[5]),
      plotAreaFt2: parseNumber(row[6]),
      far: parseNumber(row[7]),
    },
    // S2 – Gross Floor Area (shifted +2)
    gfa: {
      resProposedGfaFt2: parseNumber(row[8]),
      resProposedGfaPct: parseNumber(row[9]),
      comProposedGfaFt2: parseNumber(row[10]),
      comProposedGfaPct: parseNumber(row[11]),
      totalProposedGfaFt2: parseNumber(row[12]),
    },
    // S3 – Residential Sellable (shifted +2)
    residentialSellable: {
      suiteSelableFt2: parseNumber(row[13]),
      suiteSellableRatio: parseNumber(row[14]),
      balconySaFt2: parseNumber(row[15]),
      leasableFt2: parseNullableNumber(row[16]),
      balconyRatio: parseNumber(row[17]),
      totalSellableFt2: parseNumber(row[18]),
      nonSellableFt2: parseNumber(row[19]),
      nonSellableRatio: parseNumber(row[20]),
      efficiencySaGfa: parseNumber(row[21]),
    },
    // S4 – Commercial Sellable (shifted +2)
    commercialSellable: {
      suiteSellableFt2: parseNumber(row[22]),
      suiteSellableRatio: parseNumber(row[23]),
      balconySaFt2: parseNumber(row[24]),
      leasableFt2: parseNullableNumber(row[25]),
      balconyRatio: parseNumber(row[26]),
      totalSellableFt2: parseNumber(row[27]),
      nonSellableFt2: parseNumber(row[28]),
      nonSellableRatio: parseNumber(row[29]),
      efficiencySaGfa: parseNumber(row[30]),
    },
    // S5 – Total Sellable (shifted +2)
    totalSellable: {
      suiteSellableFt2: parseNumber(row[31]),
      suiteSellableRatio: parseNumber(row[32]),
      balconySaFt2: parseNumber(row[33]),
      balconyRatio: parseNumber(row[34]),
      totalSellableFt2: parseNumber(row[35]),
      nonSellableFt2: parseNumber(row[36]),
      nonSellableRatio: parseNumber(row[37]),
      efficiencySaGfa: parseNumber(row[38]),
    },
    // S6 – AMI (shifted +2)
    ami: {
      areaFt2: parseNumber(row[39]),
      pct: parseNumber(row[40]),
    },
    // S6 – Unit Counts (shifted +2)
    unitCounts: {
      studio: parseNumber(row[41]),
      oneBed: parseNumber(row[42]),
      twoBed: parseNumber(row[43]),
      threeBed: parseNumber(row[44]),
      fourBed: parseNumber(row[45]),
      liner: parseNumber(row[46]),
      total: parseNumber(row[47]),
    },
    // S6 – Unit Mix % (shifted +2)
    unitMixPct: {
      studio: parseNumber(row[48]),
      oneBed: parseNumber(row[49]),
      twoBed: parseNumber(row[50]),
      threeBed: parseNumber(row[51]),
      fourBed: parseNumber(row[52]),
      liner: parseNumber(row[53]),
    },
    // S6 – Balcony % (shifted +2)
    balconyPct: {
      studio: parseNumber(row[54]),
      oneBed: parseNumber(row[55]),
      twoBed: parseNumber(row[56]),
      threeBed: parseNumber(row[57]),
      fourBed: parseNumber(row[58]),
      liner: parseNumber(row[59]),
    },
    // S6 – Rental/Condo Split (shifted +2)
    rentalCondoSplit: {
      studio: { rental: parseNumber(row[60]), condo: parseNumber(row[61]) },
      oneBed: { rental: parseNumber(row[62]), condo: parseNumber(row[63]) },
      twoBed: { rental: parseNumber(row[64]), condo: parseNumber(row[65]) },
      threeBed: { rental: parseNumber(row[66]), condo: parseNumber(row[67]) },
      fourBed: { rental: parseNumber(row[68]), condo: parseNumber(row[69]) },
      liner: { rental: parseNumber(row[70]), condo: parseNumber(row[71]) },
    },
    // S7 – Retail & Grid (shifted +2)
    retailGrid: {
      gridFt: parseNumber(row[72]),
      retailSmallQty: parseNumber(row[73]),
      retailCornerQty: parseNumber(row[74]),
      retailRegularQty: parseNumber(row[75]),
    },
    // S8 – MEP Systems (shifted +2)
    mep: {
      electricalLoadKw: parseNumber(row[76]),
      coolingLoadTr: parseNumber(row[77]),
      waterDemandFt3Day: parseNumber(row[78]),
      sewerageDemandFt3Day: parseNumber(row[79]),
      gasDemandFt3Hr: parseNumber(row[80]),
    },
    // S9 – Parking & Facade (shifted +2)
    parkingFacade: {
      parkingRequired: parseNumber(row[81]),
      parkingProposed: parseNumber(row[82]),
      parkingEfficiencyFt2Car: parseNumber(row[83]),
      additionalParking: parseNumber(row[84]),
      evParkingLots: parseNumber(row[85]),
      facadeGlazingPct: parseNumber(row[86]),
      facadeSpandrelPct: parseNumber(row[87]),
      facadeSolidPct: parseNumber(row[88]),
    },
    // S10 – Lifts & Height (shifted +2)
    liftsHeight: {
      passengerCount: parseNumber(row[89]),
      passengerCapacity: parseNumber(row[90]),
      serviceCount: parseNumber(row[91]),
      serviceCapacity: parseNumber(row[92]),
      totalLifts: parseNumber(row[93]),
      heightFt: parseNumber(row[94]),
      buildingConfiguration: row[95] || "",
    },
    // S11 – BUA (shifted +2)
    bua: {
      buaFt2: parseNumber(row[96]),
      gfaOverBua: parseNumber(row[97]),
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
    byLocation: {
      miami: buildings.filter((b) => b.identity.location === "MIA").length,
      riyadh: buildings.filter((b) => b.identity.location === "RYD").length,
    },
    byStatus: {
      pit: buildings.filter((b) => b.identity.status === "PIT").length,
      pot: buildings.filter((b) => b.identity.status === "POT").length,
      pht: buildings.filter((b) => b.identity.status === "PHT").length,
    },
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
    const statusFilter = searchParams.get("status")?.toUpperCase()
    const locationFilter = searchParams.get("location")?.toUpperCase()
    const dmFilter = searchParams.get("dm")?.toUpperCase()

    let filteredBuildings = buildings

    if (statusFilter && ["PIT", "POT", "PHT"].includes(statusFilter)) {
      filteredBuildings = filteredBuildings.filter(
        (b) => b.identity.status === statusFilter
      )
    }

    if (locationFilter && ["MIA", "RYD"].includes(locationFilter)) {
      filteredBuildings = filteredBuildings.filter(
        (b) => b.identity.location === locationFilter
      )
    }

    if (dmFilter) {
      filteredBuildings = filteredBuildings.filter(
        (b) => b.identity.designManager.toUpperCase() === dmFilter
      )
    }

    // Calculate stats from ALL buildings (not filtered)
    const stats = calculateStats(buildings)

    // Group by status
    const grouped = {
      pit: buildings.filter((b) => b.identity.status === "PIT"),
      pot: buildings.filter((b) => b.identity.status === "POT"),
      pht: buildings.filter((b) => b.identity.status === "PHT"),
    }

    const result: BuildingInfoResponse & { grouped: typeof grouped } = {
      buildings: filteredBuildings,
      grouped,
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
