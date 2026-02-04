"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Loader2 } from "lucide-react"

const PUBLIC_ROUTES = ['/login', '/register']

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    )
  }

  // For public routes (login), render without sidebar
  if (isPublicRoute) {
    return <>{children}</>
  }

  // For protected routes, render with sidebar (redirects handled by AuthContext)
  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        <Header
          title="Dashboard"
          subtitle={`Welcome back, ${user.name.split(' ')[0]}`}
        />
        <main className="flex-1 p-4 md:p-6 bg-midnight overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
