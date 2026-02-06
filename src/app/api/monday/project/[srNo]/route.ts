import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { mondayService } from "@/lib/monday/service"

// GET /api/monday/project/[srNo] - Get Monday.com data for a PXT project
export async function GET(
  request: Request,
  { params }: { params: { srNo: string } }
) {
  try {
    const srNo = decodeURIComponent(params.srNo)

    // Check if Monday.com is configured
    if (!mondayService.isConfigured()) {
      return NextResponse.json(
        { error: "Monday.com integration not configured", hasBoard: false },
        { status: 200 } // Return 200 so frontend knows there's no error, just no config
      )
    }

    // Find the board mapping for this project
    const mapping = await prisma.mondayBoardMapping.findUnique({
      where: { pxtProjectSrNo: srNo },
    })

    if (!mapping) {
      return NextResponse.json(
        { hasBoard: false, message: "No Monday.com board linked to this project" },
        { status: 200 }
      )
    }

    // Fetch project metrics from Monday.com
    const metrics = await mondayService.getProjectMetrics(mapping.mondayBoardId)

    // Update last synced timestamp
    await prisma.mondayBoardMapping.update({
      where: { id: mapping.id },
      data: {
        lastSyncedAt: new Date(),
        boardName: metrics.boardName, // Cache the board name
      },
    })

    return NextResponse.json({
      hasBoard: true,
      metrics,
    })
  } catch (error) {
    console.error("Monday API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch Monday.com data" },
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
