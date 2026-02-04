import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'

// Seed route to create test users
export async function POST() {

  try {
    const defaultPassword = await hashPassword('flow123')

    // Create test users
    const users = [
      {
        email: 'admin@flow.life',
        name: 'Admin User',
        role: 'admin' as const,
        passwordHash: defaultPassword,
      },
      {
        email: 'manager@flow.life',
        name: 'Project Manager',
        role: 'project_manager' as const,
        passwordHash: defaultPassword,
      },
      {
        email: 'user@flow.life',
        name: 'Team Member',
        role: 'viewer' as const,
        passwordHash: defaultPassword,
      },
      {
        email: 'swapnil@flow.life',
        name: 'Swapnil Meena',
        role: 'admin' as const,
        passwordHash: defaultPassword,
      },
    ]

    const results = []
    for (const userData of users) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: { passwordHash: userData.passwordHash },
        create: userData,
      })
      results.push({ email: user.email, name: user.name, role: user.role })
    }

    return NextResponse.json({
      message: 'Test users created/updated',
      users: results,
      note: 'Default password for all users: flow123',
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed users' },
      { status: 500 }
    )
  }
}
