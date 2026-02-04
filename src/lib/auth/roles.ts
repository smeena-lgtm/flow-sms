// Role hierarchy and permissions
// Maps database roles to simplified roles for the app

export type SimplifiedRole = 'ADMIN' | 'MANAGER' | 'USER'

// Map database UserRole to simplified roles
export function getSimplifiedRole(dbRole: string): SimplifiedRole {
  switch (dbRole) {
    case 'admin':
      return 'ADMIN'
    case 'project_manager':
    case 'team_lead':
      return 'MANAGER'
    case 'designer':
    case 'engineer':
    case 'viewer':
    default:
      return 'USER'
  }
}

// Permission definitions
export const PERMISSIONS = {
  // Analytics
  'analytics:view': ['ADMIN', 'MANAGER', 'USER'],
  'analytics:full': ['ADMIN', 'MANAGER'],

  // Projects
  'projects:view': ['ADMIN', 'MANAGER', 'USER'],
  'projects:edit': ['ADMIN', 'MANAGER'],
  'projects:delete': ['ADMIN'],

  // HR
  'hr:view': ['ADMIN', 'MANAGER'],
  'hr:edit': ['ADMIN'],

  // Finance
  'finance:view': ['ADMIN'],
  'finance:edit': ['ADMIN'],

  // Tasks
  'tasks:view': ['ADMIN', 'MANAGER', 'USER'],
  'tasks:edit': ['ADMIN', 'MANAGER'],
  'tasks:delete': ['ADMIN', 'MANAGER'],
} as const

export type Permission = keyof typeof PERMISSIONS

export function hasPermission(role: SimplifiedRole, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly string[]
  return allowedRoles.includes(role)
}

export function canAccessRoute(role: SimplifiedRole, route: string): boolean {
  // Route-based access control
  if (route.startsWith('/finance')) {
    return role === 'ADMIN'
  }
  if (route.startsWith('/hr')) {
    return role === 'ADMIN' || role === 'MANAGER'
  }
  // All other routes accessible to all authenticated users
  return true
}
