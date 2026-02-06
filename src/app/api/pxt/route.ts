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
  // Column indices based on actual sheet structure (104 columns):
  // 0: Plot_No, 1: Marketing_Name, 2: Design_Manager, 3: Location, 4: Status
  // 5: No_of_Buildings, 6: Plot_Area_ft2, 7: FAR
  // 8-12: GFA section
  // 13-21: Residential Sellable
  // 22-30: Commercial Sellable
  // 31-38: Total Sellable
  // 39-46: AMI section (Area, Wellbeing, Community, Operations, WorkFlow, F+B, Outdoor, Pct)
  // 47-53: Unit Counts (Studio, 1Bed, 2Bed, 3Bed, 4Bed, Liner, Total)
  // 54-59: Unit Mix %
  // 60-65: Balcony %
  // 66-77: Rental/Condo Split
  // 78-81: Retail & Grid
  // 82-86: MEP Systems
  // 87-94: Parking & Facade
  // 95-101: Lifts & Height
  // 102-103: BUA
  return {
    // S1 – Project Identity
    identity: {
      plotNo: row[0] || "",
      marketingName: row[1] || "",
      designManager: row[2] || "",
      location: row[3] || "",      // MIA or RYD
      status: row[4] || "",        // PIT, POT, PHT
      numberOfBuildings: parseNumber(row[5]),
      plotAreaFt2: parseNumber(row[6]),
      far: parseNumber(row[7]),
    },
    // S2 – Gross Floor Area
    gfa: {
      resProposedGfaFt2: parseNumber(row[8]),
      resProposedGfaPct: parseNumber(row[9]),
      comProposedGfaFt2: parseNumber(row[10]),
      comProposedGfaPct: parseNumber(row[11]),
      totalProposedGfaFt2: parseNumber(row[12]),
    },
    // S3 – Residential Sellable
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
    // S4 – Commercial Sellable
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
    // S5 – Total Sellable
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
    // S6 – AMI (expanded with subcategories)
    ami: {
      areaFt2: parseNumber(row[39]),
      pct: parseNumber(row[46]),  // AMI_Pct is at index 46
    },
    // Unit Counts (47-53)
    unitCounts: {
      studio: parseNumber(row[47]),
      oneBed: parseNumber(row[48]),
      twoBed: parseNumber(row[49]),
      threeBed: parseNumber(row[50]),
      fourBed: parseNumber(row[51]),
      liner: parseNumber(row[52]),
      total: parseNumber(row[53]),
    },
    // Unit Mix % (54-59)
    unitMixPct: {
      studio: parseNumber(row[54]),
      oneBed: parseNumber(row[55]),
      twoBed: parseNumber(row[56]),
      threeBed: parseNumber(row[57]),
      fourBed: parseNumber(row[58]),
      liner: parseNumber(row[59]),
    },
    // Balcony % (60-65)
    balconyPct: {
      studio: parseNumber(row[60]),
      oneBed: parseNumber(row[61]),
      twoBed: parseNumber(row[62]),
      threeBed: parseNumber(row[63]),
      fourBed: parseNumber(row[64]),
      liner: parseNumber(row[65]),
    },
    // Rental/Condo Split (66-77)
    rentalCondoSplit: {
      studio: { rental: parseNumber(row[66]), condo: parseNumber(row[67]) },
      oneBed: { rental: parseNumber(row[68]), condo: parseNumber(row[69]) },
      twoBed: { rental: parseNumber(row[70]), condo: parseNumber(row[71]) },
      threeBed: { rental: parseNumber(row[72]), condo: parseNumber(row[73]) },
      fourBed: { rental: parseNumber(row[74]), condo: parseNumber(row[75]) },
      liner: { rental: parseNumber(row[76]), condo: parseNumber(row[77]) },
    },
    // S7 – Retail & Grid (78-81)
    retailGrid: {
      gridFt: parseNumber(row[78]),
      retailSmallQty: parseNumber(row[79]),
      retailCornerQty: parseNumber(row[80]),
      retailRegularQty: parseNumber(row[81]),
    },
    // S8 – MEP Systems (82-86)
    mep: {
      electricalLoadKw: parseNumber(row[82]),
      coolingLoadTr: parseNumber(row[83]),
      waterDemandFt3Day: parseNumber(row[84]),
      sewerageDemandFt3Day: parseNumber(row[85]),
      gasDemandFt3Hr: parseNumber(row[86]),
    },
    // S9 – Parking & Facade (87-94)
    parkingFacade: {
      parkingRequired: parseNumber(row[87]),
      parkingProposed: parseNumber(row[88]),
      parkingEfficiencyFt2Car: parseNumber(row[89]),
      additionalParking: parseNumber(row[90]),
      evParkingLots: parseNumber(row[91]),
      facadeGlazingPct: parseNumber(row[92]),
      facadeSpandrelPct: parseNumber(row[93]),
      facadeSolidPct: parseNumber(row[94]),
    },
    // S10 – Lifts & Height (95-101)
    liftsHeight: {
      passengerCount: parseNumber(row[95]),
      passengerCapacity: parseNumber(row[96]),
      serviceCount: parseNumber(row[97]),
      serviceCapacity: parseNumber(row[98]),
      totalLifts: parseNumber(row[99]),
      heightFt: parseNumber(row[100]),
      buildingConfiguration: row[101] || "",
    },
    // S11 – BUA (102-103)
    bua: {
      buaFt2: parseNumber(row[102]),
      gfaOverBua: parseNumber(row[103]),
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

    // Skip header row, filter valid rows (must have Plot_No OR Marketing_Name)
    const dataRows = rows.slice(1).filter((row) => {
      const hasPlotNo = row[0] && row[0].trim() !== ""
      const hasMarketingName = row[1] && row[1].trim() !== ""
      return hasPlotNo || hasMarketingName
    })

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
