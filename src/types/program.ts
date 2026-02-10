// Project Program Types - for Gantt Chart visualization

export type StageStatus = 'completed' | 'in_progress' | 'upcoming' | 'on_hold' | 'cancelled'
export type LeadEntity = 'DLF' | 'AOR-Z' | 'OCWT' | 'Client' | string

export interface ProgramStage {
  id: number
  name: string
  shortName?: string          // For compact display
  startDate: string | null    // ISO date string
  endDate: string | null      // ISO date string
  dueDate: string | null      // Key milestone date
  lead: LeadEntity
  assist: string | null
  status: StageStatus
  remarks: string
  category: 'design' | 'approvals' | 'construction' | 'handover'
  milestoneOnly?: boolean     // True for single-date milestones (diamond markers)
  substages?: {
    name: string
    dueDate: string | null
    status: StageStatus
  }[]
}

export interface ProjectProgram {
  projectId: string            // Matches plotNo or marketingName
  projectName: string
  lastUpdated: string          // ISO date
  overallStatus: StageStatus
  stages: ProgramStage[]
}

export interface ProgramsResponse {
  programs: ProjectProgram[]
}

// Color mapping for categories (used in both web and reference for iOS)
export const CATEGORY_COLORS = {
  design: { bg: '#6366f1', text: '#c7d2fe', label: 'Design' },       // ocean-swell / indigo
  approvals: { bg: '#a855f7', text: '#e9d5ff', label: 'Approvals' },  // purple
  construction: { bg: '#06b6d4', text: '#cffafe', label: 'Construction' }, // cyan
  handover: { bg: '#22c55e', text: '#dcfce7', label: 'Handover' },    // green
} as const

export const STATUS_COLORS = {
  completed: { bg: '#22c55e', text: '#dcfce7', label: 'Completed' },
  in_progress: { bg: '#6366f1', text: '#c7d2fe', label: 'In Progress' },
  upcoming: { bg: '#64748b', text: '#e2e8f0', label: 'Upcoming' },
  on_hold: { bg: '#fbbf24', text: '#fef3c7', label: 'On Hold' },
  cancelled: { bg: '#ef4444', text: '#fecaca', label: 'Cancelled' },
} as const

export const LEAD_COLORS = {
  'DLF': '#a855f7',       // purple
  'AOR-Z': '#06b6d4',     // cyan
  'OCWT': '#fbbf24',      // yellow
  'Client': '#f472b6',    // pink
} as const
