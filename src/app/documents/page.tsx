"use client"

import { useState, useEffect } from "react"
import {
  Package,
  Image,
  Box,
  ChevronRight,
} from "lucide-react"

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

interface FlowStandardsData {
  overview: {
    totalCategories: number
    totalSKUs: number
    totalActive: number
    totalInactive: number
  }
  categories: CategoryStats[]
  lastUpdated: string
}

const iconComponents: Record<string, React.ReactNode> = {
  "square.3.layers.3d.top.filled": <Box className="h-5 w-5" />,
  "lightbulb.fill": <Package className="h-5 w-5" />,
  "powerplug.fill": <Package className="h-5 w-5" />,
  "drop.fill": <Package className="h-5 w-5" />,
  "sofa.fill": <Package className="h-5 w-5" />,
  "rectangle.pattern.checkered": <Package className="h-5 w-5" />,
  "refrigerator.fill": <Package className="h-5 w-5" />,
  "wrench.and.screwdriver.fill": <Package className="h-5 w-5" />,
  "star.fill": <Package className="h-5 w-5" />,
  "cabinet.fill": <Package className="h-5 w-5" />,
  "photo.artframe": <Image className="h-5 w-5" />,
  "rectangle.split.2x2.fill": <Package className="h-5 w-5" />,
}

export default function DocumentsPage() {
  const [data, setData] = useState<FlowStandardsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch("/api/flow-standards")
        if (!res.ok) throw new Error("Failed to fetch")
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError("Failed to load Flow Standards data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Documents</h1>
          <p className="text-sm text-text-muted mt-1">
            Flow Standards & Product Library
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl bg-bg-card border border-border-color p-4">
            <p className="text-xs text-text-muted mb-1">Categories</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-blue" />
              <span className="text-xl font-bold text-text-primary">
                {data.overview.totalCategories}
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-bg-card border border-border-color p-4">
            <p className="text-xs text-text-muted mb-1">Total SKUs</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-green" />
              <span className="text-xl font-bold text-text-primary">
                {data.overview.totalSKUs.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-bg-card border border-border-color p-4">
            <p className="text-xs text-text-muted mb-1">Active</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-cyan" />
              <span className="text-xl font-bold text-text-primary">
                {data.overview.totalActive.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-bg-card border border-border-color p-4">
            <p className="text-xs text-text-muted mb-1">Inactive</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-yellow" />
              <span className="text-xl font-bold text-text-primary">
                {data.overview.totalInactive.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-20 text-accent-red">{error}</div>
      )}

      {/* Categories Grid */}
      {!loading && !error && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.categories.map((category) => (
            <div
              key={category.id}
              className="rounded-xl bg-bg-card border border-border-color p-4 hover:border-accent-blue/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                    {iconComponents[category.icon] || <Package className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary text-sm">
                      {category.name}
                    </p>
                    <p className="text-xs text-text-muted">{category.code}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-accent-blue transition-colors" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">SKUs</span>
                  <span className="font-medium text-text-primary">
                    {category.totalSKUs}
                  </span>
                </div>

                {/* Asset completion bars */}
                <div className="space-y-1.5">
                  <AssetBar
                    label="Images"
                    complete={category.assets.images.complete}
                    total={category.totalSKUs}
                    color="bg-accent-cyan"
                  />
                  <AssetBar
                    label="Specs"
                    complete={category.assets.specSheets.complete}
                    total={category.totalSKUs}
                    color="bg-accent-green"
                  />
                  <AssetBar
                    label="Revit"
                    complete={category.assets.revitFiles.complete}
                    total={category.totalSKUs}
                    color="bg-accent-purple"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Last Updated */}
      {data && (
        <p className="text-xs text-text-muted text-right">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  )
}

function AssetBar({
  label,
  complete,
  total,
  color,
}: {
  label: string
  complete: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? Math.round((complete / total) * 100) : 0

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted w-12">{label}</span>
      <div className="flex-1 h-1.5 bg-bg-surface rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-text-muted w-8 text-right">{percentage}%</span>
    </div>
  )
}
