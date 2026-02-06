import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET /api/monday/mappings - List all board mappings
export async function GET() {
  try {
    const mappings = await prisma.mondayBoardMapping.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ mappings })
  } catch (error) {
    console.error("Failed to fetch mappings:", error)
    return NextResponse.json(
      { error: "Failed to fetch board mappings" },
      { status: 500 }
    )
  }
}

// POST /api/monday/mappings - Create a new board mapping
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { pxtProjectSrNo, mondayBoardId, boardName } = body

    if (!pxtProjectSrNo || !mondayBoardId) {
      return NextResponse.json(
        { error: "pxtProjectSrNo and mondayBoardId are required" },
        { status: 400 }
      )
    }

    // Check if mapping already exists
    const existing = await prisma.mondayBoardMapping.findUnique({
      where: { pxtProjectSrNo },
    })

    if (existing) {
      // Update existing mapping
      const updated = await prisma.mondayBoardMapping.update({
        where: { pxtProjectSrNo },
        data: { mondayBoardId, boardName },
      })
      return NextResponse.json({ mapping: updated, updated: true })
    }

    // Create new mapping
    const mapping = await prisma.mondayBoardMapping.create({
      data: {
        pxtProjectSrNo,
        mondayBoardId,
        boardName,
      },
    })

    return NextResponse.json({ mapping, created: true })
  } catch (error) {
    console.error("Failed to create mapping:", error)
    return NextResponse.json(
      { error: "Failed to create board mapping" },
      { status: 500 }
    )
  }
}

// DELETE /api/monday/mappings - Delete a board mapping
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pxtProjectSrNo = searchParams.get("pxtProjectSrNo")

    if (!pxtProjectSrNo) {
      return NextResponse.json(
        { error: "pxtProjectSrNo query parameter is required" },
        { status: 400 }
      )
    }

    await prisma.mondayBoardMapping.delete({
      where: { pxtProjectSrNo },
    })

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error("Failed to delete mapping:", error)
    return NextResponse.json(
      { error: "Failed to delete board mapping" },
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
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
