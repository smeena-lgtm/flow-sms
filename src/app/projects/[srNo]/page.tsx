"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  Ruler,
  Home,
  TrendingUp,
  Car,
  Zap,
  Droplets,
  Wind,
  Flame,
  Layers,
  ArrowUpDown,
  SquareStack,
  PanelTop,
} from "lucide-react"
import type { BuildingInfo } from "@/types/building"

export default function BuildingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [building, setBuilding] = useState<BuildingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const projectId = decodeURIComponent(params.srNo as string)

  useEffect(() => {
    async function fetchBuilding() {
      try {
        setLoading(true)
        const res = await fetch("/api/pxt")
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        // Search by plotNo first, then by marketingName as fallback
        const found = data.buildings.find(
          (b: BuildingInfo) =>
            b.identity.plotNo === projectId ||
            b.identity.marketingName === projectId ||
            // Also check URL-friendly versions
            encodeURIComponent(b.identity.plotNo) === projectId ||
            encodeURIComponent(b.identity.marketingName) === projectId
        )
        if (!found) throw new Error("Building not found")
        setBuilding(found)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load building")
      } finally {
        setLoading(false)
      }
    }
    fetchBuilding()
  }, [projectId])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-bg-surface rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-bg-surface rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !building) {
    return (
      <div className="text-center py-20">
        <p className="text-accent-red mb-4">{error || "Building not found"}</p>
        <button
          onClick={() => router.push("/projects")}
          className="text-ocean-swell hover:underline"
        >
          ← Back to Buildings
        </button>
      </div>
    )
  }

  const formatNumber = (num: number) => num.toLocaleString()
  const formatPercent = (num: number) => `${(num * 100).toFixed(1)}%`

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/projects")}
          className="p-2 rounded-xl bg-bg-card hover:bg-bg-card-hover transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">
            {building.identity.marketingName || building.identity.plotNo}
          </h1>
          <p className="text-sm text-text-muted">
            {building.identity.plotNo} • DM: {building.identity.designManager || "N/A"}
          </p>
        </div>
        <div className="text-right">
          <span className="px-4 py-2 rounded-full text-sm font-medium bg-ocean-swell/15 text-ocean-swell">
            {building.liftsHeight.buildingConfiguration || "N/A"}
          </span>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <KPICard
          icon={Layers}
          label="FAR"
          value={building.identity.far.toFixed(2)}
        />
        <KPICard
          icon={TrendingUp}
          label="Efficiency"
          value={formatPercent(building.totalSellable.efficiencySaGfa)}
          highlight={building.totalSellable.efficiencySaGfa >= 0.9}
        />
        <KPICard
          icon={Home}
          label="Total Units"
          value={formatNumber(building.unitCounts.total)}
        />
        <KPICard
          icon={Ruler}
          label="Total GFA"
          value={`${formatNumber(building.gfa.totalProposedGfaFt2)} ft²`}
        />
        <KPICard
          icon={ArrowUpDown}
          label="Height"
          value={`${formatNumber(building.liftsHeight.heightFt)} ft`}
        />
        <KPICard
          icon={Car}
          label="Parking"
          value={formatNumber(building.parkingFacade.parkingProposed)}
        />
      </div>

      {/* GFA Section */}
      <Section title="Gross Floor Area" icon={Building2}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AreaCard
            label="Residential GFA"
            value={building.gfa.resProposedGfaFt2}
            percent={building.gfa.resProposedGfaPct}
            color="bg-accent-blue"
          />
          <AreaCard
            label="Commercial GFA"
            value={building.gfa.comProposedGfaFt2}
            percent={building.gfa.comProposedGfaPct}
            color="bg-accent-green"
          />
          <AreaCard
            label="Total GFA"
            value={building.gfa.totalProposedGfaFt2}
            color="bg-ocean-swell"
            highlight
          />
        </div>
      </Section>

      {/* Sellable Area Section */}
      <Section title="Sellable Area" icon={Ruler}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Residential */}
          <div className="rounded-xl bg-bg-surface p-4">
            <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-blue" />
              Residential
            </h4>
            <div className="space-y-2 text-sm">
              <DataRow label="Suite Sellable" value={`${formatNumber(building.residentialSellable.suiteSelableFt2)} ft²`} />
              <DataRow label="Balcony Area" value={`${formatNumber(building.residentialSellable.balconySaFt2)} ft²`} />
              <DataRow label="Total Sellable" value={`${formatNumber(building.residentialSellable.totalSellableFt2)} ft²`} />
              <DataRow label="Non-Sellable" value={`${formatNumber(building.residentialSellable.nonSellableFt2)} ft²`} />
              <DataRow label="Efficiency" value={formatPercent(building.residentialSellable.efficiencySaGfa)} highlight />
            </div>
          </div>

          {/* Commercial */}
          <div className="rounded-xl bg-bg-surface p-4">
            <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-green" />
              Commercial
            </h4>
            <div className="space-y-2 text-sm">
              <DataRow label="Suite Sellable" value={`${formatNumber(building.commercialSellable.suiteSellableFt2)} ft²`} />
              <DataRow label="Balcony Area" value={`${formatNumber(building.commercialSellable.balconySaFt2)} ft²`} />
              <DataRow label="Total Sellable" value={`${formatNumber(building.commercialSellable.totalSellableFt2)} ft²`} />
              <DataRow label="Non-Sellable" value={`${formatNumber(building.commercialSellable.nonSellableFt2)} ft²`} />
              <DataRow label="Efficiency" value={formatPercent(building.commercialSellable.efficiencySaGfa)} highlight />
            </div>
          </div>

          {/* Total */}
          <div className="rounded-xl bg-ocean-swell/10 border-2 border-ocean-swell p-4">
            <h4 className="text-sm font-medium text-ocean-swell mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-ocean-swell" />
              Total
            </h4>
            <div className="space-y-2 text-sm">
              <DataRow label="Suite Sellable" value={`${formatNumber(building.totalSellable.suiteSellableFt2)} ft²`} />
              <DataRow label="Balcony Area" value={`${formatNumber(building.totalSellable.balconySaFt2)} ft²`} />
              <DataRow label="Total Sellable" value={`${formatNumber(building.totalSellable.totalSellableFt2)} ft²`} />
              <DataRow label="Non-Sellable" value={`${formatNumber(building.totalSellable.nonSellableFt2)} ft²`} />
              <DataRow label="Efficiency" value={formatPercent(building.totalSellable.efficiencySaGfa)} highlight />
            </div>
          </div>
        </div>
      </Section>

      {/* Unit Mix Section */}
      <Section title="Unit Mix" icon={Home}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
          <UnitCard label="Studio" count={building.unitCounts.studio} pct={building.unitMixPct.studio} />
          <UnitCard label="1 Bed" count={building.unitCounts.oneBed} pct={building.unitMixPct.oneBed} />
          <UnitCard label="2 Bed" count={building.unitCounts.twoBed} pct={building.unitMixPct.twoBed} />
          <UnitCard label="3 Bed" count={building.unitCounts.threeBed} pct={building.unitMixPct.threeBed} />
          <UnitCard label="4 Bed" count={building.unitCounts.fourBed} pct={building.unitMixPct.fourBed} />
          <UnitCard label="Liner" count={building.unitCounts.liner} pct={building.unitMixPct.liner} />
          <UnitCard label="Total" count={building.unitCounts.total} highlight />
        </div>

        {/* Unit Mix Bar */}
        {building.unitCounts.total > 0 && (
          <div>
            <div className="flex h-8 rounded-lg overflow-hidden">
              {building.unitCounts.studio > 0 && (
                <UnitBar value={building.unitCounts.studio} total={building.unitCounts.total} color="bg-accent-cyan" label="ST" />
              )}
              {building.unitCounts.oneBed > 0 && (
                <UnitBar value={building.unitCounts.oneBed} total={building.unitCounts.total} color="bg-accent-blue" label="1BR" />
              )}
              {building.unitCounts.twoBed > 0 && (
                <UnitBar value={building.unitCounts.twoBed} total={building.unitCounts.total} color="bg-accent-green" label="2BR" />
              )}
              {building.unitCounts.threeBed > 0 && (
                <UnitBar value={building.unitCounts.threeBed} total={building.unitCounts.total} color="bg-accent-yellow" label="3BR" />
              )}
              {building.unitCounts.fourBed > 0 && (
                <UnitBar value={building.unitCounts.fourBed} total={building.unitCounts.total} color="bg-accent-purple" label="4BR" />
              )}
              {building.unitCounts.liner > 0 && (
                <UnitBar value={building.unitCounts.liner} total={building.unitCounts.total} color="bg-accent-pink" label="LN" />
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-text-muted">
              <Legend color="bg-accent-cyan" label="Studio" />
              <Legend color="bg-accent-blue" label="1BR" />
              <Legend color="bg-accent-green" label="2BR" />
              <Legend color="bg-accent-yellow" label="3BR" />
              <Legend color="bg-accent-purple" label="4BR" />
              <Legend color="bg-accent-pink" label="Liner" />
            </div>
          </div>
        )}

        {/* AMI */}
        <div className="mt-4 p-4 rounded-xl bg-bg-surface">
          <p className="text-sm text-text-muted">Average Marketable Index (AMI)</p>
          <p className="text-2xl font-bold text-text-primary">{formatNumber(building.ami.areaFt2)} ft²</p>
        </div>
      </Section>

      {/* MEP Systems */}
      <Section title="MEP Systems" icon={Zap}>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <MEPCard icon={Zap} label="Electrical Load" value={`${formatNumber(building.mep.electricalLoadKw)} kW`} />
          <MEPCard icon={Wind} label="Cooling Load" value={`${formatNumber(building.mep.coolingLoadTr)} TR`} />
          <MEPCard icon={Droplets} label="Water Demand" value={`${formatNumber(building.mep.waterDemandFt3Day)} ft³/day`} />
          <MEPCard icon={Droplets} label="Sewerage" value={`${formatNumber(building.mep.sewerageDemandFt3Day)} ft³/day`} />
          <MEPCard icon={Flame} label="Gas Demand" value={`${formatNumber(building.mep.gasDemandFt3Hr)} ft³/hr`} />
        </div>
      </Section>

      {/* Parking & Facade */}
      <Section title="Parking & Facade" icon={Car}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Parking */}
          <div className="rounded-xl bg-bg-surface p-4">
            <h4 className="text-sm font-medium text-text-primary mb-4">Parking</h4>
            <div className="grid grid-cols-2 gap-4">
              <DataBox label="Required" value={formatNumber(building.parkingFacade.parkingRequired)} />
              <DataBox label="Proposed" value={formatNumber(building.parkingFacade.parkingProposed)} highlight />
              <DataBox label="Additional" value={formatNumber(building.parkingFacade.additionalParking)} />
              <DataBox label="EV Lots" value={formatNumber(building.parkingFacade.evParkingLots)} />
              <DataBox label="Efficiency" value={`${formatNumber(building.parkingFacade.parkingEfficiencyFt2Car)} ft²/car`} />
            </div>
          </div>

          {/* Facade */}
          <div className="rounded-xl bg-bg-surface p-4">
            <h4 className="text-sm font-medium text-text-primary mb-4">Facade Composition</h4>
            <div className="space-y-3">
              <FacadeBar label="Glazing" value={building.parkingFacade.facadeGlazingPct} color="bg-accent-cyan" />
              <FacadeBar label="Spandrel" value={building.parkingFacade.facadeSpandrelPct} color="bg-accent-purple" />
              <FacadeBar label="Solid" value={building.parkingFacade.facadeSolidPct} color="bg-accent-gray" />
            </div>
          </div>
        </div>
      </Section>

      {/* Lifts & Building Info */}
      <Section title="Lifts & Building" icon={SquareStack}>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <DataBox label="Passenger Lifts" value={building.liftsHeight.passengerCount} />
          <DataBox label="Passenger Cap" value={`${building.liftsHeight.passengerCapacity} pax`} />
          <DataBox label="Service Lifts" value={building.liftsHeight.serviceCount} />
          <DataBox label="Service Cap" value={`${building.liftsHeight.serviceCapacity} pax`} />
          <DataBox label="Total Lifts" value={building.liftsHeight.totalLifts} highlight />
          <DataBox label="Height" value={`${formatNumber(building.liftsHeight.heightFt)} ft`} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <DataBox label="Plot Area" value={`${formatNumber(building.identity.plotAreaFt2)} ft²`} />
          <DataBox label="No. of Buildings" value={building.identity.numberOfBuildings} />
          <DataBox label="BUA" value={`${formatNumber(building.bua.buaFt2)} ft²`} />
          <DataBox label="GFA / BUA" value={formatPercent(building.bua.gfaOverBua)} />
        </div>
      </Section>

      {/* Retail */}
      {(building.retailGrid.retailSmallQty > 0 || building.retailGrid.retailCornerQty > 0 || building.retailGrid.retailRegularQty > 0) && (
        <Section title="Retail" icon={PanelTop}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <DataBox label="Grid Spacing" value={`${building.retailGrid.gridFt} ft`} />
            <DataBox label="Small Retail" value={building.retailGrid.retailSmallQty} />
            <DataBox label="Corner Retail" value={building.retailGrid.retailCornerQty} />
            <DataBox label="Regular Retail" value={building.retailGrid.retailRegularQty} />
          </div>
        </Section>
      )}
    </div>
  )
}

// Helper Components
function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-bg-card border border-border-color p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-ocean-swell" />
        {title}
      </h2>
      {children}
    </div>
  )
}

function KPICard({ icon: Icon, label, value, highlight }: { icon: React.ElementType; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? "bg-accent-green/10 border-2 border-accent-green" : "bg-bg-card border border-border-color"}`}>
      <div className="flex items-center gap-2 text-text-muted mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-lg font-semibold ${highlight ? "text-accent-green" : "text-text-primary"}`}>{value}</p>
    </div>
  )
}

function AreaCard({ label, value, percent, color, highlight }: { label: string; value: number; percent?: number; color: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? "bg-ocean-swell/10 border-2 border-ocean-swell" : "bg-bg-surface"}`}>
      <p className="text-xs text-text-muted mb-2">{label}</p>
      <p className={`text-2xl font-bold mb-2 ${highlight ? "text-ocean-swell" : "text-text-primary"}`}>
        {value.toLocaleString()} <span className="text-sm font-normal">ft²</span>
      </p>
      {percent !== undefined && (
        <div className="h-2 bg-bg-dark rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full`} style={{ width: `${percent * 100}%` }} />
        </div>
      )}
    </div>
  )
}

function DataRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-text-muted">{label}</span>
      <span className={highlight ? "font-semibold text-ocean-swell" : "text-text-primary"}>{value}</span>
    </div>
  )
}

function DataBox({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 text-center ${highlight ? "bg-ocean-swell/10 border border-ocean-swell" : "bg-bg-surface"}`}>
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={`text-xl font-bold ${highlight ? "text-ocean-swell" : "text-text-primary"}`}>{value}</p>
    </div>
  )
}

function UnitCard({ label, count, pct, highlight }: { label: string; count: number; pct?: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 text-center ${highlight ? "bg-ocean-swell/10 border-2 border-ocean-swell" : "bg-bg-surface"}`}>
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={`text-xl font-bold ${highlight ? "text-ocean-swell" : "text-text-primary"}`}>
        {count > 0 ? count.toLocaleString() : "-"}
      </p>
      {pct !== undefined && pct > 0 && (
        <p className="text-xs text-text-muted mt-1">{(pct * 100).toFixed(0)}%</p>
      )}
    </div>
  )
}

function UnitBar({ value, total, color, label }: { value: number; total: number; color: string; label: string }) {
  const pct = (value / total) * 100
  return (
    <div className={`${color} flex items-center justify-center text-xs font-medium text-white`} style={{ width: `${pct}%` }}>
      {pct > 5 && label}
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`w-3 h-3 rounded ${color}`} />
      {label}
    </span>
  )
}

function MEPCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg-surface p-4">
      <div className="flex items-center gap-2 text-text-muted mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-semibold text-text-primary">{value}</p>
    </div>
  )
}

function FacadeBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = value * 100
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-text-muted">{label}</span>
        <span className="text-text-primary font-medium">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-3 bg-bg-dark rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
