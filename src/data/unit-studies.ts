// Unit Study data — hardcoded for now, will move to database later

export interface UnitPrototype {
  id: string
  bedrooms: string
  bedroomCount: number
  gfaSf: number
  unitCount: number
  category: "Apartment" | "Liner"
  towers: string
  levels: string
  notes: string
}

export interface FloorBreakdown {
  level: number
  levelDisplay: string
  classification: string
  rental: number
  condo: number
  liner: number
  total: number
  notes: string
}

export interface BedroomSummary {
  label: string
  bedroomCount: number
  rental: number
  condoApt: number
  condoLiner: number
  subtotal: number
  mixPct: number
  minApprovedSf: number
  minGfa: number
  maxGfa: number
  uniqueTypes: number
  color: string
}

export interface TowerInfo {
  name: string
  units: number
  levels: string
  type: string
  color: string
}

export interface UnitStudyProject {
  projectId: string
  name: string
  subtitle: string
  address: string
  maxHeightFt: number
  levels: number
  totalUnits: number
  towers: TowerInfo[]
  parking: number
  bedroomSummaries: BedroomSummary[]
  prototypes: UnitPrototype[]
  floors: FloorBreakdown[]
}

// Color mapping for bedroom types
export const BEDROOM_COLORS: Record<number, string> = {
  1: "#7DADBB", // ocean-swell
  2: "#22C55E", // green
  3: "#EAB308", // yellow/sunlight
  4: "#A855F7", // purple
  5: "#EC4899", // pink
}

// Lookup function — matches by project name (case-insensitive, partial)
export function getUnitStudy(buildingName: string): UnitStudyProject | null {
  const normalized = buildingName.toLowerCase()
  if (normalized.includes("aventura") || normalized.includes("acc")) {
    return AVENTURA_UNIT_STUDY
  }
  return null
}

// ─── Flow Aventura Unit Study ────────────────────────────────────────

const AVENTURA_UNIT_STUDY: UnitStudyProject = {
  projectId: "aventura",
  name: "Flow Aventura",
  subtitle: "Aventura Corporate Center (ACC)",
  address: "20801 Biscayne Blvd, Aventura FL 33180",
  maxHeightFt: 338,
  levels: 29,
  totalUnits: 735,
  towers: [
    { name: "Tower A", units: 369, levels: "06–28", type: "Rental", color: "#7DADBB" },
    { name: "Tower B", units: 323, levels: "06–28", type: "Condo", color: "#22C55E" },
    { name: "Liner", units: 43, levels: "02–05", type: "Parking Liner", color: "#EAB308" },
  ],
  parking: 1037,
  bedroomSummaries: [
    { label: "1 BD", bedroomCount: 1, rental: 188, condoApt: 184, condoLiner: 28, subtotal: 400, mixPct: 0.5442, minApprovedSf: 500, minGfa: 541, maxGfa: 657, uniqueTypes: 3, color: "#7DADBB" },
    { label: "2 BD", bedroomCount: 2, rental: 131, condoApt: 93, condoLiner: 0, subtotal: 224, mixPct: 0.3048, minApprovedSf: 800, minGfa: 865, maxGfa: 1026, uniqueTypes: 7, color: "#22C55E" },
    { label: "3 BD", bedroomCount: 3, rental: 27, condoApt: 27, condoLiner: 15, subtotal: 69, mixPct: 0.0939, minApprovedSf: 1050, minGfa: 1115, maxGfa: 1510, uniqueTypes: 8, color: "#EAB308" },
    { label: "4 BD", bedroomCount: 4, rental: 13, condoApt: 11, condoLiner: 0, subtotal: 24, mixPct: 0.0327, minApprovedSf: 1250, minGfa: 1468, maxGfa: 1961, uniqueTypes: 4, color: "#A855F7" },
    { label: "5 BD", bedroomCount: 5, rental: 10, condoApt: 8, condoLiner: 0, subtotal: 18, mixPct: 0.0245, minApprovedSf: 1500, minGfa: 1724, maxGfa: 2685, uniqueTypes: 6, color: "#EC4899" },
  ],
  prototypes: [
    // 1 BD
    { id: "1BD-A", bedrooms: "1 BD", bedroomCount: 1, gfaSf: 541, unitCount: 213, category: "Apartment", towers: "Rental & Condo", levels: "06–28", notes: "Primary small 1BD; most common unit in project" },
    { id: "1BD-B", bedrooms: "1 BD", bedroomCount: 1, gfaSf: 635, unitCount: 159, category: "Apartment", towers: "Rental & Condo", levels: "06–28", notes: "Larger 1BD variant; appears on all residential floors" },
    { id: "LN-1BD", bedrooms: "1 BD (Liner)", bedroomCount: 1, gfaSf: 657, unitCount: 28, category: "Liner", towers: "Parking Garage", levels: "02–05", notes: "Liner unit wrapping parking structure" },
    // 2 BD
    { id: "2BD-A", bedrooms: "2 BD", bedroomCount: 2, gfaSf: 865, unitCount: 130, category: "Apartment", towers: "Rental & Condo", levels: "07–28", notes: "Primary 2BD type; most common 2BD across all tower floors" },
    { id: "2BD-B", bedrooms: "2 BD", bedroomCount: 2, gfaSf: 894, unitCount: 38, category: "Apartment", towers: "Rental & Condo", levels: "07–25", notes: "Corner position variant in both towers" },
    { id: "2BD-C", bedrooms: "2 BD", bedroomCount: 2, gfaSf: 901, unitCount: 2, category: "Apartment", towers: "Rental", levels: "12–13", notes: "Slight size increase vs 2BD-B on these levels" },
    { id: "2BD-D", bedrooms: "2 BD", bedroomCount: 2, gfaSf: 945, unitCount: 10, category: "Apartment", towers: "Rental & Condo", levels: "21–25", notes: "Upper-floor variant as building steps back" },
    { id: "2BD-E", bedrooms: "2 BD", bedroomCount: 2, gfaSf: 990, unitCount: 2, category: "Apartment", towers: "Rental", levels: "11", notes: "Single-level variant, larger 2BD" },
    { id: "2BD-F", bedrooms: "2 BD", bedroomCount: 2, gfaSf: 995, unitCount: 38, category: "Apartment", towers: "Rental & Condo", levels: "07–28", notes: "Premium 2BD; typically 1 per tower per floor" },
    { id: "2BD-G", bedrooms: "2 BD", bedroomCount: 2, gfaSf: 1026, unitCount: 4, category: "Apartment", towers: "Rental", levels: "17–20", notes: "Largest 2BD; appears on mid-upper levels only" },
    // 3 BD
    { id: "3BD-A", bedrooms: "3 BD", bedroomCount: 3, gfaSf: 1137, unitCount: 38, category: "Apartment", towers: "Rental & Condo", levels: "07–28", notes: "Primary 3BD; corner position on most floors" },
    { id: "3BD-B", bedrooms: "3 BD", bedroomCount: 3, gfaSf: 1142, unitCount: 2, category: "Apartment", towers: "Rental", levels: "11", notes: "Slight variant of 3BD-A on Level 11" },
    { id: "3BD-C", bedrooms: "3 BD", bedroomCount: 3, gfaSf: 1257, unitCount: 8, category: "Apartment", towers: "Rental", levels: "17–20", notes: "Larger 3BD on mid-upper Rental floors" },
    { id: "3BD-D", bedrooms: "3 BD", bedroomCount: 3, gfaSf: 1276, unitCount: 6, category: "Apartment", towers: "Rental", levels: "14–16", notes: "Larger 3BD on mid-level Rental floors" },
    { id: "LN-3BD-A", bedrooms: "3 BD (Liner)", bedroomCount: 3, gfaSf: 1115, unitCount: 3, category: "Liner", towers: "Parking Garage", levels: "03–05", notes: "Smaller liner 3BD" },
    { id: "LN-3BD-B", bedrooms: "3 BD (Liner)", bedroomCount: 3, gfaSf: 1182, unitCount: 6, category: "Liner", towers: "Parking Garage", levels: "02–05", notes: "Mid-size liner 3BD" },
    { id: "LN-3BD-C", bedrooms: "3 BD (Liner)", bedroomCount: 3, gfaSf: 1201, unitCount: 3, category: "Liner", towers: "Parking Garage", levels: "03–05", notes: "Larger liner 3BD variant" },
    { id: "LN-3BD-D", bedrooms: "3 BD (Liner)", bedroomCount: 3, gfaSf: 1510, unitCount: 3, category: "Liner", towers: "Parking Garage", levels: "02–04", notes: "Largest liner unit" },
    // 4 BD
    { id: "4BD-A", bedrooms: "4 BD", bedroomCount: 4, gfaSf: 1468, unitCount: 12, category: "Apartment", towers: "Rental & Condo", levels: "10, 21–25", notes: "Upper-floor 4BD; 6+ levels" },
    { id: "4BD-B", bedrooms: "4 BD", bedroomCount: 4, gfaSf: 1499, unitCount: 6, category: "Apartment", towers: "Rental & Condo", levels: "14–16", notes: "Mid-level 4BD variant" },
    { id: "4BD-C", bedrooms: "4 BD", bedroomCount: 4, gfaSf: 1547, unitCount: 4, category: "Apartment", towers: "Rental & Condo", levels: "12–13", notes: "Larger mid-level 4BD" },
    { id: "4BD-D", bedrooms: "4 BD", bedroomCount: 4, gfaSf: 1961, unitCount: 2, category: "Apartment", towers: "Rental & Condo", levels: "08–09", notes: "Largest 4BD; lower residential floors" },
    // 5 BD
    { id: "5BD-A", bedrooms: "5 BD", bedroomCount: 5, gfaSf: 1724, unitCount: 2, category: "Apartment", towers: "Rental & Condo", levels: "10", notes: "Smallest 5BD; single level only" },
    { id: "5BD-B", bedrooms: "5 BD", bedroomCount: 5, gfaSf: 1859, unitCount: 6, category: "Apartment", towers: "Rental", levels: "26–28", notes: "Upper penthouse-tier 5BD (Rental)" },
    { id: "5BD-C", bedrooms: "5 BD", bedroomCount: 5, gfaSf: 1879, unitCount: 6, category: "Apartment", towers: "Condo", levels: "26–28", notes: "Upper penthouse-tier 5BD (Condo)" },
    { id: "5BD-D", bedrooms: "5 BD", bedroomCount: 5, gfaSf: 2107, unitCount: 1, category: "Apartment", towers: "Condo", levels: "06", notes: "Podium-level premium 5BD (Condo)" },
    { id: "5BD-E", bedrooms: "5 BD", bedroomCount: 5, gfaSf: 2115, unitCount: 1, category: "Apartment", towers: "Rental", levels: "06", notes: "Podium-level premium 5BD (Rental)" },
    { id: "5BD-F", bedrooms: "5 BD", bedroomCount: 5, gfaSf: 2685, unitCount: 2, category: "Apartment", towers: "Rental & Condo", levels: "08–09", notes: "Largest unit in the project" },
  ],
  floors: [
    { level: 1, levelDisplay: "01", classification: "Ground Level", rental: 0, condo: 0, liner: 0, total: 0, notes: "Lobbies, retail, no residential" },
    { level: 2, levelDisplay: "02", classification: "Parking + Liners", rental: 0, condo: 0, liner: 6, total: 6, notes: "LN_1BD×5, LN_3BD/1510×1" },
    { level: 3, levelDisplay: "03", classification: "Parking + Liners", rental: 0, condo: 0, liner: 14, total: 14, notes: "LN_1BD×9, LN_3BD variants" },
    { level: 4, levelDisplay: "04", classification: "Parking + Liners", rental: 0, condo: 0, liner: 14, total: 14, notes: "Same as Level 03" },
    { level: 5, levelDisplay: "05", classification: "Parking + Liners", rental: 0, condo: 0, liner: 9, total: 9, notes: "LN_1BD×5, LN_3BD variants" },
    { level: 6, levelDisplay: "06", classification: "Podium", rental: 4, condo: 4, liner: 0, total: 8, notes: "1BD + 5BD premium units" },
    { level: 7, levelDisplay: "07", classification: "Resi + Clubhouse", rental: 21, condo: 19, liner: 0, total: 40, notes: "First full resi floor; Clubhouse" },
    { level: 8, levelDisplay: "08", classification: "Residential", rental: 24, condo: 21, liner: 0, total: 45, notes: "4BD/1961 and 5BD/2685 added" },
    { level: 9, levelDisplay: "09", classification: "Residential", rental: 24, condo: 21, liner: 0, total: 45, notes: "Same layout as Level 08" },
    { level: 10, levelDisplay: "10", classification: "Residential", rental: 18, condo: 16, liner: 0, total: 34, notes: "Building steps back; 4BD/1468, 5BD/1724" },
    { level: 11, levelDisplay: "11", classification: "Residential", rental: 18, condo: 16, liner: 0, total: 34, notes: "Variants: 3BD/1142, 2BD/990" },
    { level: 12, levelDisplay: "12", classification: "Residential", rental: 17, condo: 15, liner: 0, total: 32, notes: "Stepback; 4BD/1547, 2BD/901" },
    { level: 13, levelDisplay: "13", classification: "Residential", rental: 17, condo: 15, liner: 0, total: 32, notes: "Same layout as Level 12" },
    { level: 14, levelDisplay: "14", classification: "Residential", rental: 16, condo: 14, liner: 0, total: 30, notes: "Stepback; 4BD/1499, 3BD/1276" },
    { level: 15, levelDisplay: "15", classification: "Residential", rental: 16, condo: 14, liner: 0, total: 30, notes: "Same layout as Level 14" },
    { level: 16, levelDisplay: "16", classification: "Residential", rental: 16, condo: 14, liner: 0, total: 30, notes: "Same layout as Level 14" },
    { level: 17, levelDisplay: "17", classification: "Residential", rental: 16, condo: 14, liner: 0, total: 30, notes: "3BD/1257, 2BD/1026 variants" },
    { level: 18, levelDisplay: "18", classification: "Residential", rental: 16, condo: 14, liner: 0, total: 30, notes: "Same layout as Level 17" },
    { level: 19, levelDisplay: "19", classification: "Residential", rental: 16, condo: 14, liner: 0, total: 30, notes: "Same layout as Level 17" },
    { level: 20, levelDisplay: "20", classification: "Residential", rental: 16, condo: 14, liner: 0, total: 30, notes: "Same layout as Level 17" },
    { level: 21, levelDisplay: "21", classification: "Residential", rental: 15, condo: 13, liner: 0, total: 28, notes: "Stepback; 4BD/1468, 2BD/945" },
    { level: 22, levelDisplay: "22", classification: "Residential", rental: 15, condo: 13, liner: 0, total: 28, notes: "Same layout as Level 21" },
    { level: 23, levelDisplay: "23", classification: "Residential", rental: 15, condo: 13, liner: 0, total: 28, notes: "Same layout as Level 21" },
    { level: 24, levelDisplay: "24", classification: "Residential", rental: 15, condo: 13, liner: 0, total: 28, notes: "Same layout as Level 21" },
    { level: 25, levelDisplay: "25", classification: "Residential", rental: 15, condo: 13, liner: 0, total: 28, notes: "Same layout as Level 21" },
    { level: 26, levelDisplay: "26", classification: "Residential", rental: 13, condo: 11, liner: 0, total: 24, notes: "Top tier; 5BD/1859 (R), 5BD/1879 (C)" },
    { level: 27, levelDisplay: "27", classification: "Residential", rental: 13, condo: 11, liner: 0, total: 24, notes: "Same layout as Level 26" },
    { level: 28, levelDisplay: "28", classification: "Residential", rental: 13, condo: 11, liner: 0, total: 24, notes: "Same layout as Level 26" },
    { level: 29, levelDisplay: "29", classification: "Rooftop", rental: 0, condo: 0, liner: 0, total: 0, notes: "Rooftop amenities, no residential" },
  ],
}
