"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Calendar,
  FileText,
  Settings,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Team", href: "/team", icon: Users },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border-color">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-swell to-ocean-swell/70 shadow-lg shadow-ocean-swell/20">
          <span className="text-xl font-bold text-midnight">F</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-text-primary leading-tight">Flow</span>
          <span className="text-xs text-text-secondary leading-tight">Studio Management</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3 flex-1">
        <p className="px-3 mb-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Menu
        </p>
        <ul className="space-y-1">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <li
                key={item.name}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-ocean-swell/20 text-ocean-swell shadow-sm"
                      : "text-text-secondary hover:bg-bg-hover hover:text-text-primary hover:translate-x-1"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  {item.name}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-ocean-swell animate-pulse-slow" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section at bottom */}
      <div className="p-4 border-t border-border-color">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer group">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-ocean-swell to-heart flex items-center justify-center shadow-md">
              <span className="text-sm font-semibold text-midnight">SM</span>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-bg-dark rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate group-hover:text-ocean-swell transition-colors">
              Swapnil Meena
            </p>
            <p className="text-xs text-text-secondary truncate">
              Admin
            </p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-bg-card border border-border-color text-text-primary hover:bg-bg-hover transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 z-50 h-screen w-72 bg-bg-dark border-r border-border-color flex flex-col transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 bg-bg-dark border-r border-border-color flex-col">
        <SidebarContent />
      </aside>
    </>
  )
}
