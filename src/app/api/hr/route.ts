import { NextResponse } from "next/server"

// Google Sheet ID from the URL
const SHEET_ID = "1_ju_qYu8Rbvykm4vn0z5Sw9BgQ9zIaHy8A4Xvg-wEI0"

// Tab GID - second tab (Backup) with all employees
const LIST_GID = "252386052"

interface Employee {
  srNo: string
  name: string
  title: string
  status: string  // "On-Board" or "TBJ"
  office: string  // "MIA", "KSA", "DXB"
  reportsTo: string
  remarks: string
}

interface OfficeSummary {
  office: string
  totalEmployees: number
  onBoard: number
  toBeJoined: number
}

// Known offices
const OFFICES = ["MIA", "KSA", "DXB"]

async function fetchSheetData(gid: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 } // Cache for 60 seconds
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.status}`)
    }

    const csv = await response.text()

    // Parse CSV
    const rows = csv.split("\n").map(row => {
      // Handle quoted values with commas
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

function parseEmployees(rows: string[][]): Employee[] {
  // Skip header row, parse all rows with valid Sr. No.
  return rows.slice(1)
    .filter(row => {
      const srNo = row[0]?.trim() || ""
      // Must have a valid serial number (numeric)
      return srNo && !isNaN(parseInt(srNo))
    })
    .map(row => ({
      srNo: row[0] || "",
      name: row[1] || "",
      title: row[2] || "",
      status: row[3] || "",
      office: row[4] || "",
      reportsTo: row[5] || "",
      remarks: row[6] || ""
    }))
}

function calculateOfficeSummaries(employees: Employee[]): OfficeSummary[] {
  const summaries: OfficeSummary[] = []

  // Calculate per-office stats
  OFFICES.forEach(office => {
    const officeEmployees = employees.filter(e => e.office?.toUpperCase() === office)
    const onBoard = officeEmployees.filter(e => e.status.toLowerCase() === "on-board").length
    const tbj = officeEmployees.filter(e => e.status.toLowerCase() === "tbj").length

    summaries.push({
      office: `${office} OFFICE`,
      totalEmployees: onBoard + tbj,
      onBoard: onBoard,
      toBeJoined: tbj
    })
  })

  // Calculate overall totals
  const totalOnBoard = employees.filter(e => e.status.toLowerCase() === "on-board").length
  const totalTBJ = employees.filter(e => e.status.toLowerCase() === "tbj").length

  // Add overall at the beginning
  summaries.unshift({
    office: "OVERALL",
    totalEmployees: totalOnBoard + totalTBJ,
    onBoard: totalOnBoard,
    toBeJoined: totalTBJ
  })

  return summaries
}

export async function GET() {
  try {
    // Fetch the main LIST sheet
    const rows = await fetchSheetData(LIST_GID)
    const employees = parseEmployees(rows)

    // Separate into team (On-Board) and TBJ
    const team = employees.filter(e => e.status.toLowerCase() === "on-board")
    const tbj = employees.filter(e => e.status.toLowerCase() === "tbj")

    // Calculate office summaries
    const officeSummaries = calculateOfficeSummaries(employees)

    // Calculate stats
    const stats = {
      totalEmployees: team.length,
      totalTBJ: tbj.length,
      byOffice: team.reduce((acc, e) => {
        if (e.office) {
          acc[e.office] = (acc[e.office] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>),
      byStage: {} as Record<string, number>
    }

    return NextResponse.json({
      team,
      tbj,
      stats,
      officeSummaries
    })
  } catch (error) {
    console.error("HR API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch HR data" },
      { status: 500 }
    )
  }
}
