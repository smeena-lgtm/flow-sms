import { NextRequest, NextResponse } from "next/server"
import programsData from "@/data/programs.json"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const projectName = searchParams.get("projectName")

    let programs = programsData.programs

    // Filter by projectId (exact match)
    if (projectId) {
      const program = programs.find(
        (p) => p.projectId.toLowerCase() === projectId.toLowerCase()
      )
      if (!program) {
        return NextResponse.json(
          { error: "Program not found", projectId },
          { status: 404 }
        )
      }
      return NextResponse.json({ program })
    }

    // Filter by projectName (partial match)
    if (projectName) {
      programs = programs.filter((p) =>
        p.projectName.toLowerCase().includes(projectName.toLowerCase())
      )
    }

    return NextResponse.json({
      programs,
      totalPrograms: programs.length,
    })
  } catch (error) {
    console.error("Programs API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    )
  }
}
