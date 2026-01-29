"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  RefreshCw,
  Layers,
  CheckCircle2,
  XCircle,
  Image,
  FileSpreadsheet,
  Box,
  Lightbulb,
  Plug,
  Droplet,
  Sofa,
  Wrench,
  Star,
  Frame,
  Scissors,
  Grid3X3,
  Refrigerator,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// Flow Standards Types
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

interface FlowStandardsOverview {
  totalCategories: number
  totalSKUs: number
  totalActive: number
  totalInactive: number
}

interface FlowStandardsData {
  overview: FlowStandardsOverview
  categories: CategoryStats[]
  lastUpdated: string
}

// Document tabs
const documentTabs = [
  { id: "flow-standards", name: "Flow Standards", icon: Layers, description: "Materials & SKU Library" },
  { id: "templates", name: "Templates", icon: FileText, description: "Document Templates", comingSoon: true },
]

// Icon mapping for categories
const categoryIcons: Record<string, React.ElementType> = {
  "01": Grid3X3,       // SURFACE
  "02": Lightbulb,     // LIGHTING
  "03": Plug,          // ELECTRICAL FITTINGS
  "04": Droplet,       // SANITARY FITTINGS
  "05": Sofa,          // FURNITURE
  "06": Grid3X3,       // RUGS
  "07": Refrigerator,  // APPLIANCES
  "08": Wrench,        // HARDWARE
  "09": Star,          // ACCESSORIES
  "10": Box,           // JOINERY
  "11": Frame,         // ARTWORK
  "12": Scissors,      // FABRIC
}

// Color mapping for categories
const categoryColors: Record<string, string> = {
  "01": "ocean-swell",
  "02": "sunlight",
  "03": "heart",
  "04": "ocean-swell",
  "05": "sunlight",
  "06": "heart",
  "07": "green-500",
  "08": "purple-500",
  "09": "ocean-swell",
  "10": "sunlight",
  "11": "heart",
  "12": "purple-500",
}

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState("flow-standards")
  const [standardsData, setStandardsData] = useState<FlowStandardsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const fetchStandardsData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/flow-standards")
      if (!response.ok) throw new Error("Failed to fetch Flow Standards data")
      const result = await response.json()
      setStandardsData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "flow-standards") {
      fetchStandardsData()
    }
  }, [activeTab])

  const getAssetPercentage = (complete: number, missing: number) => {
    const total = complete + missing
    if (total === 0) return 0
    return (complete / total) * 100
  }

  const selectedCategoryData = standardsData?.categories.find(c => c.id === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary flex items-center gap-2">
            <FileText className="h-7 w-7 text-ocean-swell" />
            Documents
          </h2>
          <p className="text-text-secondary">Document libraries and standards</p>
        </div>
      </div>

      {/* Document Type Tabs */}
      <div className="flex gap-3 border-b border-border-color pb-4">
        {documentTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.comingSoon && setActiveTab(tab.id)}
            disabled={tab.comingSoon}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-lg transition-all
              ${activeTab === tab.id
                ? "bg-ocean-swell/20 text-ocean-swell border border-ocean-swell/30"
                : tab.comingSoon
                  ? "bg-bg-dark text-text-secondary opacity-50 cursor-not-allowed"
                  : "bg-bg-dark text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              }
            `}
          >
            <tab.icon className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">{tab.name}</div>
              <div className="text-xs opacity-70">{tab.description}</div>
            </div>
            {tab.comingSoon && (
              <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Flow Standards Content */}
      {activeTab === "flow-standards" && (
        <div className="space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button onClick={fetchStandardsData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-ocean-swell" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <p className="text-text-secondary">Failed to load Flow Standards data</p>
              <p className="text-xs text-text-secondary">{error}</p>
              <Button onClick={fetchStandardsData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : standardsData ? (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-ocean-swell/20 p-2.5">
                        <Layers className="h-5 w-5 text-ocean-swell" />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Categories</p>
                        <p className="text-xl font-bold text-text-primary">{standardsData.overview.totalCategories}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-heart/20 p-2.5">
                        <Box className="h-5 w-5 text-heart" />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Total SKUs</p>
                        <p className="text-xl font-bold text-text-primary">{standardsData.overview.totalSKUs.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-green-500/20 p-2.5">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Active SKUs</p>
                        <p className="text-xl font-bold text-text-primary">{standardsData.overview.totalActive.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-text-secondary/20 p-2.5">
                        <XCircle className="h-5 w-5 text-text-secondary" />
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Inactive SKUs</p>
                        <p className="text-xl font-bold text-text-primary">{standardsData.overview.totalInactive.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Categories Grid */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <Layers className="h-5 w-5 text-ocean-swell" />
                    Material Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {standardsData.categories.map((category) => {
                      const IconComponent = categoryIcons[category.id] || Box
                      const colorClass = categoryColors[category.id] || "ocean-swell"
                      const isSelected = selectedCategory === category.id

                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                          className={`
                            p-4 rounded-lg text-left transition-all border
                            ${isSelected
                              ? `bg-${colorClass}/20 border-${colorClass}/50`
                              : "bg-bg-dark border-border-color hover:bg-bg-hover hover:border-border-color/80"
                            }
                          `}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`rounded-md p-1.5 bg-${colorClass}/20`}>
                              <IconComponent className={`h-4 w-4 text-${colorClass}`} />
                            </div>
                            <span className="text-xs font-mono text-text-secondary">{category.code}</span>
                          </div>
                          <p className="text-sm font-medium text-text-primary truncate">{category.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-bold text-text-primary">{category.totalSKUs}</span>
                            <span className="text-xs text-text-secondary">SKUs</span>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="type1" className="text-xs px-1.5 py-0">
                              {category.active} active
                            </Badge>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Category Details */}
              {selectedCategoryData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Types Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <Grid3X3 className="h-5 w-5 text-ocean-swell" />
                        Types in {selectedCategoryData.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Object.keys(selectedCategoryData.types).length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(selectedCategoryData.types)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 10)
                            .map(([type, count]) => (
                              <div key={type} className="flex items-center justify-between">
                                <span className="text-sm text-text-primary truncate flex-1">{type}</span>
                                <Badge variant="secondary" className="ml-2">{count}</Badge>
                              </div>
                            ))}
                          {Object.keys(selectedCategoryData.types).length > 10 && (
                            <p className="text-xs text-text-secondary mt-2">
                              +{Object.keys(selectedCategoryData.types).length - 10} more types
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-text-secondary">No type data available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Materials Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <Layers className="h-5 w-5 text-heart" />
                        Materials in {selectedCategoryData.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Object.keys(selectedCategoryData.materials).length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(selectedCategoryData.materials)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 10)
                            .map(([material, count]) => (
                              <div key={material} className="flex items-center justify-between">
                                <span className="text-sm text-text-primary truncate flex-1">{material}</span>
                                <Badge variant="secondary" className="ml-2">{count}</Badge>
                              </div>
                            ))}
                          {Object.keys(selectedCategoryData.materials).length > 10 && (
                            <p className="text-xs text-text-secondary mt-2">
                              +{Object.keys(selectedCategoryData.materials).length - 10} more materials
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-text-secondary">No material data available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Asset Completion Card - Full Width */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Asset Completion for {selectedCategoryData.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Images */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Image className="h-5 w-5 text-ocean-swell" />
                            <span className="font-medium text-text-primary">Images</span>
                          </div>
                          <Progress
                            value={getAssetPercentage(
                              selectedCategoryData.assets.images.complete,
                              selectedCategoryData.assets.images.missing
                            )}
                            className="h-3"
                          />
                          <div className="flex justify-between text-sm">
                            <span className="text-green-500">
                              {selectedCategoryData.assets.images.complete} complete
                            </span>
                            <span className="text-text-secondary">
                              {selectedCategoryData.assets.images.missing} missing
                            </span>
                          </div>
                        </div>

                        {/* Spec Sheets */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-heart" />
                            <span className="font-medium text-text-primary">Spec Sheets</span>
                          </div>
                          <Progress
                            value={getAssetPercentage(
                              selectedCategoryData.assets.specSheets.complete,
                              selectedCategoryData.assets.specSheets.missing
                            )}
                            className="h-3"
                          />
                          <div className="flex justify-between text-sm">
                            <span className="text-green-500">
                              {selectedCategoryData.assets.specSheets.complete} complete
                            </span>
                            <span className="text-text-secondary">
                              {selectedCategoryData.assets.specSheets.missing} missing
                            </span>
                          </div>
                        </div>

                        {/* Revit Files */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Box className="h-5 w-5 text-sunlight" />
                            <span className="font-medium text-text-primary">Revit Files</span>
                          </div>
                          <Progress
                            value={getAssetPercentage(
                              selectedCategoryData.assets.revitFiles.complete,
                              selectedCategoryData.assets.revitFiles.missing
                            )}
                            className="h-3"
                          />
                          <div className="flex justify-between text-sm">
                            <span className="text-green-500">
                              {selectedCategoryData.assets.revitFiles.complete} complete
                            </span>
                            <span className="text-text-secondary">
                              {selectedCategoryData.assets.revitFiles.missing} missing
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Last Updated */}
              <p className="text-xs text-text-secondary text-center">
                Last updated: {new Date(standardsData.lastUpdated).toLocaleString()}
              </p>
            </>
          ) : null}
        </div>
      )}

      {/* Templates Coming Soon */}
      {activeTab === "templates" && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-bg-hover p-6">
              <FileText className="h-12 w-12 text-text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary">Coming Soon</h3>
            <p className="text-text-secondary max-w-md">
              Document templates are currently under development. Check back soon for updates.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
