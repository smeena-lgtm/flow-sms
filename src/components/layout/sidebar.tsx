"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  Settings,
  Menu,
  X,
  BarChart3,
  ListTodo,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Gauge,
  ClipboardList,
  Truck,
  LogOut,
  HelpCircle,
} from "lucide-react"
import { useState } from "react"

interface NavItem {
  name: string
  href: string
  icon: any
  children?: { name: string; href: string }[]
}

const navigation: NavItem[] = [
  { name: "Analytics", href: "/", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "HR", href: "/reports?tab=team", icon: Users },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Tasks", href: "/tasks", icon: ListTodo },
  {
    name: "Trackers (PXT)",
    href: "/trackers",
    icon: Gauge,
    children: [
      { name: "PIT - Initiation", href: "/trackers/initiation" },
      { name: "POT - Onboard", href: "/trackers/onboard" },
      { name: "PHT - Handover", href: "/trackers/handover" },
    ],
  },
  { name: "Documents", href: "/reports?tab=standards", icon: FileText },
]

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(["Trackers (PXT)"])

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href.split("?")[0])
  }

  const NavLink = ({ item, isChild = false }: { item: NavItem | { name: string; href: string }; isChild?: boolean }) => {
    const active = isActive(item.href)
    const hasChildren = "children" in item && item.children
    const isExpanded = "name" in item && expandedItems.includes(item.name)

    return (
      <div>
        <Link
          href={hasChildren ? "#" : item.href}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault()
              toggleExpanded(item.name)
            } else {
              setMobileOpen(false)
            }
          }}
          className={cn(
            "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
            isChild ? "ml-4 py-2.5" : "",
            active
              ? "bg-accent-blue/15 text-accent-blue border border-accent-blue/30"
              : "text-text-secondary hover:bg-bg-card-hover hover:text-text-primary"
          )}
        >
          {"icon" in item && (
            <item.icon
              className={cn(
                "h-5 w-5 transition-all duration-200",
                active ? "text-accent-blue" : "text-text-muted group-hover:text-text-secondary"
              )}
            />
          )}
          <span className="flex-1">{item.name}</span>
          {hasChildren && (
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded ? "rotate-180" : ""
              )}
            />
          )}
        </Link>

        {/* Children submenu */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg ml-6 px-4 py-2 text-sm transition-all duration-200",
                  isActive(child.href)
                    ? "text-accent-blue bg-accent-blue/10"
                    : "text-text-muted hover:text-text-secondary hover:bg-bg-card-hover"
                )}
              >
                <ChevronRight className="h-3 w-3" />
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple shadow-lg shadow-accent-blue/20">
          <span className="text-xl font-bold text-white">F</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-text-primary leading-tight">Flow</span>
          <span className="text-[10px] text-text-muted leading-tight uppercase tracking-wider">Dashboard</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="mt-8 px-4 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item, index) => (
            <li
              key={item.name}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <NavLink item={item} />
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div className="my-6 border-t border-border-color" />

        {/* Bottom navigation */}
        <ul className="space-y-1">
          {bottomNavigation.map((item) => (
            <li key={item.name}>
              <NavLink item={item} />
            </li>
          ))}
          <li>
            <button className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-secondary hover:bg-bg-card-hover hover:text-text-primary transition-all duration-200">
              <LogOut className="h-5 w-5 text-text-muted" />
              <span>Sign Out</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Help/Support Card */}
      <div className="p-4">
        <div className="relative bg-gradient-to-br from-bg-card to-bg-surface rounded-2xl p-4 border border-border-color overflow-hidden">
          {/* Avatar placeholder */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-20">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-blue to-accent-purple" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-5 w-5 text-accent-blue" />
              <span className="text-sm font-semibold text-text-primary">Need help?</span>
            </div>
            <p className="text-xs text-text-muted mb-3">
              Contact support for assistance
            </p>
            <button className="w-full px-4 py-2 bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-medium rounded-lg transition-colors">
              Get support
            </button>
          </div>
        </div>
      </div>

      {/* User section */}
      <div className="p-4 border-t border-border-color">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg-card-hover transition-colors cursor-pointer group">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent-blue to-accent-pink flex items-center justify-center shadow-md">
              <span className="text-sm font-semibold text-white">SM</span>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-accent-green border-2 border-bg-dark rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              Swapnil Meena
            </p>
            <p className="text-xs text-text-muted truncate">
              Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-bg-card border border-border-color text-text-primary hover:bg-bg-card-hover transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 z-50 h-screen w-72 bg-bg-dark border-r border-border-color transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 bg-bg-dark border-r border-border-color">
        <SidebarContent />
      </aside>
    </>
  )
}
