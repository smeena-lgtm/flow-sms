// Building Information Summary Types
// Based on Bldg_Info_Summary_Schema.md - 96 columns

// S1 – Project Identity
export interface ProjectIdentity {
  plotNo: string              // Primary key - AV.BD.A.###
  marketingName: string       // Display name - AV-###
  designManager: string       // 2-letter initials
  location: "MIA" | "RYD" | string  // MIA = Miami, RYD = Riyadh
  status: "PIT" | "POT" | "PHT" | string  // Project status
  numberOfBuildings: number   // Tower count (1-6)
  plotAreaFt2: number         // Land parcel area
  far: number                 // Floor Area Ratio
}

// S2 – Gross Floor Area
export interface GrossFloorArea {
  resProposedGfaFt2: number
  resProposedGfaPct: number   // 0-1 decimal
  comProposedGfaFt2: number
  comProposedGfaPct: number   // 0-1 decimal
  totalProposedGfaFt2: number
}

// S3 – Residential Sellable
export interface ResidentialSellable {
  suiteSelableFt2: number
  suiteSellableRatio: number
  balconySaFt2: number
  leasableFt2: number | null
  balconyRatio: number
  totalSellableFt2: number
  nonSellableFt2: number
  nonSellableRatio: number
  efficiencySaGfa: number     // Key KPI
}

// S4 – Commercial Sellable
export interface CommercialSellable {
  suiteSellableFt2: number
  suiteSellableRatio: number
  balconySaFt2: number
  leasableFt2: number | null
  balconyRatio: number
  totalSellableFt2: number
  nonSellableFt2: number
  nonSellableRatio: number
  efficiencySaGfa: number
}

// S5 – Total Sellable
export interface TotalSellable {
  suiteSellableFt2: number
  suiteSellableRatio: number
  balconySaFt2: number
  balconyRatio: number
  totalSellableFt2: number    // Key revenue metric
  nonSellableFt2: number
  nonSellableRatio: number
  efficiencySaGfa: number     // Top-level KPI
}

// S6 – Unit Mix
export interface UnitCounts {
  studio: number
  oneBed: number
  twoBed: number
  threeBed: number
  fourBed: number
  liner: number
  total: number
}

export interface UnitMixPercentages {
  studio: number    // 0-1 decimal
  oneBed: number
  twoBed: number
  threeBed: number
  fourBed: number
  liner: number
}

export interface BalconyPercentages {
  studio: number
  oneBed: number
  twoBed: number
  threeBed: number
  fourBed: number
  liner: number
}

export interface RentalCondoSplit {
  studio: { rental: number; condo: number }
  oneBed: { rental: number; condo: number }
  twoBed: { rental: number; condo: number }
  threeBed: { rental: number; condo: number }
  fourBed: { rental: number; condo: number }
  liner: { rental: number; condo: number }
}

export interface AMI {
  areaFt2: number
  pct: number
}

// S7 – Retail & Grid
export interface RetailGrid {
  gridFt: number
  retailSmallQty: number
  retailCornerQty: number
  retailRegularQty: number
}

// S8 – MEP Systems
export interface MEPSystems {
  electricalLoadKw: number
  coolingLoadTr: number
  waterDemandFt3Day: number
  sewerageDemandFt3Day: number
  gasDemandFt3Hr: number
}

// S9 – Parking & Facade
export interface ParkingFacade {
  parkingRequired: number
  parkingProposed: number
  parkingEfficiencyFt2Car: number
  additionalParking: number
  evParkingLots: number
  facadeGlazingPct: number    // 0-1
  facadeSpandrelPct: number   // 0-1
  facadeSolidPct: number      // 0-1
}

// S10 – Lifts & Height
export interface LiftsHeight {
  passengerCount: number
  passengerCapacity: number
  serviceCount: number
  serviceCapacity: number
  totalLifts: number
  heightFt: number
  buildingConfiguration: string  // e.g., "3B+G+10"
}

// S11 – BUA
export interface BUA {
  buaFt2: number
  gfaOverBua: number
}

// Complete Building Info
export interface BuildingInfo {
  // S1
  identity: ProjectIdentity
  // S2
  gfa: GrossFloorArea
  // S3
  residentialSellable: ResidentialSellable
  // S4
  commercialSellable: CommercialSellable
  // S5
  totalSellable: TotalSellable
  // S6
  ami: AMI
  unitCounts: UnitCounts
  unitMixPct: UnitMixPercentages
  balconyPct: BalconyPercentages
  rentalCondoSplit: RentalCondoSplit
  // S7
  retailGrid: RetailGrid
  // S8
  mep: MEPSystems
  // S9
  parkingFacade: ParkingFacade
  // S10
  liftsHeight: LiftsHeight
  // S11
  bua: BUA
}

// API Response Types
export interface BuildingInfoStats {
  totalBuildings: number
  totalUnits: number
  totalGfaFt2: number
  totalSellableFt2: number
  avgEfficiency: number
  avgFar: number
  totalParking: number
  byDesignManager: Record<string, number>
  byLocation: {
    miami: number
    riyadh: number
  }
  byStatus: {
    pit: number
    pot: number
    pht: number
  }
}

export interface BuildingInfoResponse {
  buildings: BuildingInfo[]
  stats: BuildingInfoStats
  lastUpdated: string
}
