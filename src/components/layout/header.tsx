"use client"

import { Bell, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b border-border-color bg-bg-card/95 backdrop-blur-sm">
      {/* Title - hidden on mobile when search is open */}
      <div className={cn(
        "transition-opacity duration-200",
        searchOpen ? "opacity-0 md:opacity-100" : "opacity-100"
      )}>
        <h1 className="text-lg md:text-xl font-semibold text-text-primary pl-10 lg:pl-0">{title}</h1>
        {subtitle && (
          <p className="text-xs md:text-sm text-text-secondary pl-10 lg:pl-0 hidden sm:block">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile search button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </Button>

        {/* Desktop search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            className="h-10 w-72 rounded-lg bg-bg-dark border border-border-color pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-ocean-swell focus:border-transparent transition-all duration-200 hover:border-text-secondary"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-text-secondary bg-bg-hover rounded border border-border-color">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative group">
          <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-heart animate-pulse" />
        </Button>
      </div>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="absolute inset-x-0 top-0 h-16 px-4 flex items-center bg-bg-card md:hidden animate-fade-in">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              className="h-10 w-full rounded-lg bg-bg-dark border border-border-color pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-ocean-swell focus:border-transparent"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 shrink-0"
            onClick={() => setSearchOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
    </header>
  )
}
