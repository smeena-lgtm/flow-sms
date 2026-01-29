import { NextResponse } from "next/server"

// Airtable Configuration
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || ""
const AIRTABLE_BASE_ID = "app97iqZiJbwTuYcG"

// Category definitions with table names
const CATEGORIES = [
  { id: "01", name: "SURFACE", code: "SRF", icon: "square.3.layers.3d.top.filled" },
  { id: "02", name: "LIGHTING", code: "LGT", icon: "lightbulb.fill" },
  { id: "03", name: "ELECTRICAL FITTINGS", code: "EFI", icon: "powerplug.fill" },
  { id: "04", name: "SANITARY FITTINGS", code: "SNF", icon: "drop.fill" },
  { id: "05", name: "FURNITURE", code: "FUR", icon: "sofa.fill" },
  { id: "06", name: "RUGS", code: "RUG", icon: "rectangle.pattern.checkered" },
  { id: "07", name: "APPLIANCES", code: "APP", icon: "refrigerator.fill" },
  { id: "08", name: "HARDWARE", code: "HRD", icon: "wrench.and.screwdriver.fill" },
  { id: "09", name: "ACCESSORIES", code: "ACC", icon: "star.fill" },
  { id: "10", name: "JOINERY", code: "JON", icon: "cabinet.fill" },
  { id: "11", name: "ARTWORK", code: "ART", icon: "photo.artframe" },
  { id: "12", name: "FABRIC", code: "FAB", icon: "rectangle.split.2x2.fill" },
]

interface AirtableRecord {
  id: string
  fields: Record<string, unknown>
}

interface AirtableResponse {
  records: AirtableRecord[]
  offset?: string
}

interface SKUItem {
  id: string
  name: string
  type: string
  material: string
  status: string
  hasImage: boolean
  hasSpecSheet: boolean
  hasRevitFile: boolean
  category: string
}

interface CategoryStats {
  id: string
  name: string
  code: string
  icon: string
  totalSKUs: number
  active: number
  inactive: number
  types: Record<string, number>
  materials: Record<string, number>
  assets: {
    images: { complete: number; missing: number }
    specSheets: { complete: number; missing: number }
    revitFiles: { complete: number; missing: number }
  }
}

async function fetchAirtableTable(tableName: string): Promise<AirtableRecord[]> {
  const allRecords: AirtableRecord[] = []
  let offset: string | undefined

  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`)
    if (offset) url.searchParams.set("offset", offset)
    url.searchParams.set("pageSize", "100")

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      })

      if (!response.ok) {
        console.error(`Failed to fetch table ${tableName}: ${response.status}`)
        break
      }

      const data: AirtableResponse = await response.json()
      allRecords.push(...data.records)
      offset = data.offset
    } catch (error) {
      console.error(`Error fetching table ${tableName}:`, error)
      break
    }
  } while (offset)

  return allRecords
}

function parseRecordsToSKUs(records: AirtableRecord[], categoryId: string): SKUItem[] {
  return records.map((record) => {
    const fields = record.fields
    return {
      id: record.id,
      name: (fields["Name"] as string) || (fields["SKU Name"] as string) || "",
      type: (fields["Type"] as string) || (fields["Category"] as string) || "",
      material: (fields["Material"] as string) || (fields["Finish"] as string) || "",
      status: (fields["Status"] as string) || "Active",
      hasImage: !!(fields["Image"] || fields["Images"] || fields["Photo"]),
      hasSpecSheet: !!(fields["Spec Sheet"] || fields["Specifications"] || fields["Data Sheet"]),
      hasRevitFile: !!(fields["Revit"] || fields["Revit File"] || fields["BIM"]),
      category: categoryId,
    }
  })
}

function calculateCategoryStats(skus: SKUItem[], category: typeof CATEGORIES[0]): CategoryStats {
  const active = skus.filter((s) => s.status.toLowerCase() === "active").length
  const inactive = skus.length - active

  // Count types
  const types: Record<string, number> = {}
  skus.forEach((sku) => {
    if (sku.type) {
      types[sku.type] = (types[sku.type] || 0) + 1
    }
  })

  // Count materials
  const materials: Record<string, number> = {}
  skus.forEach((sku) => {
    if (sku.material) {
      materials[sku.material] = (materials[sku.material] || 0) + 1
    }
  })

  // Asset completion
  const imagesComplete = skus.filter((s) => s.hasImage).length
  const specSheetsComplete = skus.filter((s) => s.hasSpecSheet).length
  const revitFilesComplete = skus.filter((s) => s.hasRevitFile).length

  return {
    id: category.id,
    name: category.name,
    code: category.code,
    icon: category.icon,
    totalSKUs: skus.length,
    active,
    inactive,
    types,
    materials,
    assets: {
      images: { complete: imagesComplete, missing: skus.length - imagesComplete },
      specSheets: { complete: specSheetsComplete, missing: skus.length - specSheetsComplete },
      revitFiles: { complete: revitFilesComplete, missing: skus.length - revitFilesComplete },
    },
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get("category")

  if (!AIRTABLE_TOKEN) {
    return NextResponse.json(
      { error: "Airtable token not configured" },
      { status: 500 }
    )
  }

  try {
    // If specific category requested, fetch just that one
    if (categoryId) {
      const category = CATEGORIES.find((c) => c.id === categoryId)
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 })
      }

      const tableName = `${category.id} ${category.name}`
      const records = await fetchAirtableTable(tableName)
      const skus = parseRecordsToSKUs(records, category.id)
      const stats = calculateCategoryStats(skus, category)

      return NextResponse.json({
        category: stats,
        skus,
      })
    }

    // Fetch all categories for overview
    const allStats: CategoryStats[] = []
    let totalSKUs = 0
    let totalActive = 0
    let totalInactive = 0

    for (const category of CATEGORIES) {
      try {
        // Handle special case for ARTWORK which has two tables
        let tableName = `${category.id} ${category.name}`
        if (category.id === "11") {
          tableName = "11 ARTWORK (ART)" // Primary artwork table
        }

        const records = await fetchAirtableTable(tableName)
        const skus = parseRecordsToSKUs(records, category.id)
        const stats = calculateCategoryStats(skus, category)

        allStats.push(stats)
        totalSKUs += stats.totalSKUs
        totalActive += stats.active
        totalInactive += stats.inactive
      } catch (error) {
        console.error(`Error processing category ${category.name}:`, error)
        // Add empty stats for failed category
        allStats.push({
          ...category,
          totalSKUs: 0,
          active: 0,
          inactive: 0,
          types: {},
          materials: {},
          assets: {
            images: { complete: 0, missing: 0 },
            specSheets: { complete: 0, missing: 0 },
            revitFiles: { complete: 0, missing: 0 },
          },
        })
      }
    }

    return NextResponse.json({
      overview: {
        totalCategories: CATEGORIES.length,
        totalSKUs,
        totalActive,
        totalInactive,
      },
      categories: allStats,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Flow Standards API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch Flow Standards data" },
      { status: 500 }
    )
  }
}
