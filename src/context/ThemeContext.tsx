"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

export type AppMode = 'night' | 'day'
export type AppTheme = 'default' | 'flow'

interface ThemeContextType {
  mode: AppMode
  theme: AppTheme
  setMode: (mode: AppMode) => void
  setTheme: (theme: AppTheme) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>('night')
  const [theme, setThemeState] = useState<AppTheme>('default')
  const [mounted, setMounted] = useState(false)

  // Load saved preferences on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('flow_mode') as AppMode | null
    const savedTheme = localStorage.getItem('flow_theme') as AppTheme | null
    if (savedMode && ['night', 'day'].includes(savedMode)) {
      setModeState(savedMode)
    }
    if (savedTheme && ['default', 'flow'].includes(savedTheme)) {
      setThemeState(savedTheme)
    }
    setMounted(true)
  }, [])

  // Apply data attributes to <html> for CSS variable switching
  useEffect(() => {
    if (!mounted) return
    const html = document.documentElement
    html.setAttribute('data-mode', mode)
    html.setAttribute('data-theme', theme)
  }, [mode, theme, mounted])

  const setMode = useCallback((newMode: AppMode) => {
    setModeState(newMode)
    localStorage.setItem('flow_mode', newMode)
  }, [])

  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme)
    localStorage.setItem('flow_theme', newTheme)
  }, [])

  const toggleMode = useCallback(() => {
    const newMode = mode === 'night' ? 'day' : 'night'
    setModeState(newMode)
    localStorage.setItem('flow_mode', newMode)
  }, [mode])

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode, setTheme, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
