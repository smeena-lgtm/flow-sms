"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/context/AuthContext"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    )
  }

  if (!user) {
    // Will be redirected by AuthContext
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
        <main className="flex-1 p-4 md:p-6 bg-bg-surface overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
