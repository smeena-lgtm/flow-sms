import { NextResponse } from "next/server"

// Google Sheet ID from the URL
const SHEET_ID = "1_ju_qYu8Rbvykm4vn0z5Sw9BgQ9zIaHy8A4Xvg-wEI0"

// Tab GIDs from Google Sheet URL
const TEAM_GID = "0"
const TBJ_GID = "252386052" // TBJ Pipeline tab

interface TeamMember {
  srNo: string
  name: string
  title: string
  status: string
  office: string
  reportsTo: string
  remarks: string
}

interface TBJCandidate {
  srNo: string
  name: string
  position: string
  stage: string
  office: string
  expectedJoinDate: string
  source: string
  remarks: string
}

interface OfficeSummary {
  office: string
  totalEmployees: number
  onBoard: number
  toBeJoined: number
}

// Pipeline stages for TBJ
const PIPELINE_STAGES = ["Lead", "Screening", "Interview", "Offer", "Onboarding"]

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

function parseTeamData(rows: string[][]): TeamMember[] {
  // Skip header row and filter out summary/empty rows
  return rows.slice(1)
    .filter(row => {
      const name = row[1]?.trim() || ""
      const srNo = row[0]?.trim() || ""
      // Skip empty rows, summary rows, and header-like rows
      if (!name) return false
      // Skip if name contains keywords that indicate it's not a person
      const skipKeywords = ["total", "employee", "on-board", "joined", "overall", "office", "sr.", "name", "title", "status"]
      if (skipKeywords.some(kw => name.toLowerCase().includes(kw))) return false
      // Must have a valid serial number (numeric)
      if (!srNo || isNaN(parseInt(srNo))) return false
      return true
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

function parseTBJData(rows: string[][]): TBJCandidate[] {
  // Skip header row and filter properly
  return rows.slice(1)
    .filter(row => {
      const name = row[1]?.trim() || ""
      const srNo = row[0]?.trim() || ""
      if (!name) return false
      // Skip summary rows
      const skipKeywords = ["total", "overall", "sr.", "name", "position", "stage"]
      if (skipKeywords.some(kw => name.toLowerCase().includes(kw))) return false
      // Must have a valid serial number
      if (!srNo || isNaN(parseInt(srNo))) return false
      return true
    })
    .map(row => ({
      srNo: row[0] || "",
      name: row[1] || "",
      position: row[2] || "",
      stage: row[3] || "Lead",
      office: row[4] || "",
      expectedJoinDate: row[5] || "",
      source: row[6] || "",
      remarks: row[7] || ""
    }))
}

function calculateOfficeSummaries(team: TeamMember[], tbj: TBJCandidate[]): OfficeSummary[] {
  const summaries: OfficeSummary[] = []

  // Calculate per-office stats
  OFFICES.forEach(office => {
    const officeTeam = team.filter(m => m.office?.toUpperCase().includes(office))
    const officeTBJ = tbj.filter(c => c.office?.toUpperCase().includes(office))
    const onBoard = officeTeam.filter(m => m.status.toLowerCase() === "on-board").length

    summaries.push({
      office: `${office} OFFICE`,
      totalEmployees: onBoard + officeTBJ.length,
      onBoard: onBoard,
      toBeJoined: officeTBJ.length
    })
  })

  // Calculate overall totals
  const totalOnBoard = team.filter(m => m.status.toLowerCase() === "on-board").length
  const totalTBJ = tbj.length

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
    // Fetch both sheets in parallel
    const [teamRows, tbjRows] = await Promise.all([
      fetchSheetData(TEAM_GID),
      fetchSheetData(TBJ_GID)
    ])

    const team = parseTeamData(teamRows)
    const tbj = parseTBJData(tbjRows)

    // Calculate office summaries
    const officeSummaries = calculateOfficeSummaries(team, tbj)

    // Calculate stats
    const stats = {
      totalEmployees: team.filter(m => m.status.toLowerCase() === "on-board").length,
      totalTBJ: tbj.length,
      byOffice: team.reduce((acc, m) => {
        if (m.office && m.status.toLowerCase() === "on-board") {
          acc[m.office] = (acc[m.office] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>),
      byStage: PIPELINE_STAGES.reduce((acc, stage) => {
        acc[stage] = tbj.filter(c => c.stage.toLowerCase() === stage.toLowerCase()).length
        return acc
      }, {} as Record<string, number>)
    }

    // Group TBJ by stage for pipeline view
    const pipeline = PIPELINE_STAGES.map(stage => ({
      stage,
      candidates: tbj.filter(c => c.stage.toLowerCase() === stage.toLowerCase())
    }))

    return NextResponse.json({
      team,
      tbj,
      pipeline,
      stats,
      stages: PIPELINE_STAGES,
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
