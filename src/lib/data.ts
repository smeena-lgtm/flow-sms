// Mock data for the Flow SMS application

export interface Project {
  id: string
  code: string
  name: string
  client: string
  clientId: string
  type: "Type 1" | "Type 2" | "Type 3"
  status: "lead" | "feasibility" | "active" | "on-hold" | "completed"
  currentMilestone: string
  progress: number
  flowScore: number | null
  units: number
  gfa: number
  budget: number
  location: string
  startDate: string
  targetDate: string
  team: TeamMember[]
  createdAt: string
}

export interface TeamMember {
  id: string
  name: string
  initials: string
  role: string
  allocation: number
  avatarColor?: string
}

export const teamMembers: TeamMember[] = [
  { id: "1", name: "Ahmed Saleh", initials: "AS", role: "Project Lead", allocation: 80, avatarColor: "#7DADBB" },
  { id: "2", name: "Mohamed Khalil", initials: "MK", role: "Senior Architect", allocation: 60, avatarColor: "#F99AA9" },
  { id: "3", name: "Rania Hassan", initials: "RH", role: "Interior Designer", allocation: 40, avatarColor: "#E89700" },
  { id: "4", name: "Faisal Khan", initials: "FK", role: "Structural Engineer", allocation: 30, avatarColor: "#767317" },
  { id: "5", name: "Nadia Bakr", initials: "NB", role: "MEP Engineer", allocation: 25, avatarColor: "#8C4500" },
  { id: "6", name: "Layla Tariq", initials: "LT", role: "Junior Architect", allocation: 50, avatarColor: "#7DADBB" },
]

export const projects: Project[] = [
  {
    id: "1",
    code: "FLW-2026-001",
    name: "Al Olaya Tower",
    client: "Saudi Development Co.",
    clientId: "c1",
    type: "Type 1",
    status: "active",
    currentMilestone: "M3 - Schematic Design",
    progress: 65,
    flowScore: 78,
    units: 156,
    gfa: 24500,
    budget: 45000000,
    location: "Riyadh, Al Olaya",
    startDate: "2025-10-15",
    targetDate: "2026-05-30",
    team: [teamMembers[0], teamMembers[1], teamMembers[2], teamMembers[3]],
    createdAt: "2025-10-01",
  },
  {
    id: "2",
    code: "FLW-2026-002",
    name: "Jeddah Heritage Hotel",
    client: "Al Balad Hospitality",
    clientId: "c2",
    type: "Type 2",
    status: "active",
    currentMilestone: "M4 - Design Development",
    progress: 40,
    flowScore: 82,
    units: 85,
    gfa: 12800,
    budget: 28000000,
    location: "Jeddah, Al Balad",
    startDate: "2025-11-01",
    targetDate: "2026-06-15",
    team: [teamMembers[3], teamMembers[4]],
    createdAt: "2025-10-20",
  },
  {
    id: "3",
    code: "FLW-2026-003",
    name: "KAFD Residential Complex",
    client: "KAFD Management",
    clientId: "c3",
    type: "Type 1",
    status: "feasibility",
    currentMilestone: "M1 - Site Analysis",
    progress: 90,
    flowScore: null,
    units: 320,
    gfa: 48200,
    budget: 85000000,
    location: "Riyadh, KAFD",
    startDate: "2025-12-01",
    targetDate: "2026-09-30",
    team: [teamMembers[0], teamMembers[5], teamMembers[1]],
    createdAt: "2025-11-15",
  },
  {
    id: "4",
    code: "FLW-2025-048",
    name: "Riyadh Season Pavilion",
    client: "GEA Events",
    clientId: "c4",
    type: "Type 3",
    status: "active",
    currentMilestone: "M6 - Construction Admin",
    progress: 85,
    flowScore: 91,
    units: 1,
    gfa: 5600,
    budget: 12000000,
    location: "Riyadh, Boulevard",
    startDate: "2025-06-01",
    targetDate: "2026-02-28",
    team: [teamMembers[2], teamMembers[0]],
    createdAt: "2025-05-15",
  },
  {
    id: "5",
    code: "FLW-2026-004",
    name: "Neom Beach Villas",
    client: "NEOM Company",
    clientId: "c5",
    type: "Type 1",
    status: "lead",
    currentMilestone: "M0 - Lead Stage",
    progress: 20,
    flowScore: null,
    units: 45,
    gfa: 18500,
    budget: 120000000,
    location: "NEOM, The Line",
    startDate: "2026-02-01",
    targetDate: "2027-03-31",
    team: [teamMembers[3]],
    createdAt: "2026-01-10",
  },
  {
    id: "6",
    code: "FLW-2025-042",
    name: "Diriyah Boutique Hotel",
    client: "Diriyah Gate",
    clientId: "c6",
    type: "Type 2",
    status: "completed",
    currentMilestone: "M6 - Complete",
    progress: 100,
    flowScore: 95,
    units: 42,
    gfa: 6800,
    budget: 18000000,
    location: "Diriyah",
    startDate: "2025-01-15",
    targetDate: "2025-12-31",
    team: [teamMembers[4], teamMembers[1], teamMembers[0]],
    createdAt: "2025-01-01",
  },
]

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `SAR ${(amount / 1000000).toFixed(0)}M`
  }
  if (amount >= 1000) {
    return `SAR ${(amount / 1000).toFixed(0)}K`
  }
  return `SAR ${amount}`
}

export function formatNumber(num: number): string {
  return num.toLocaleString()
}
