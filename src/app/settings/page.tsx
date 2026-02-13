"use client"

import { useTheme, AppMode, AppTheme } from "@/context/ThemeContext"
import { Moon, Sun, Palette, Check, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

// Theme preview color definitions
const themePreviewColors = {
  default: {
    night: {
      bg: '#0a0e1a',
      card: '#111827',
      accent: '#6366f1',
      text: '#f1f5f9',
      muted: '#94a3b8',
      border: '#1e293b',
    },
    day: {
      bg: '#f8fafc',
      card: '#ffffff',
      accent: '#6366f1',
      text: '#0f172a',
      muted: '#94a3b8',
      border: '#e2e8f0',
    },
  },
  flow: {
    night: {
      bg: '#2D2D2D',
      card: '#3D3D3D',
      accent: '#7DADBB',
      text: '#F3EDDF',
      muted: '#B0B0A0',
      border: '#4D4D4D',
    },
    day: {
      bg: '#F3EDDF',
      card: '#FFFFFF',
      accent: '#7DADBB',
      text: '#3D3D3D',
      muted: '#999990',
      border: '#D4CCBA',
    },
  },
}

const flowBrandColors = [
  { name: 'Midnight', hex: '#3D3D3D' },
  { name: 'Moonlight', hex: '#F3EDDF' },
  { name: 'Ocean Swell', hex: '#7DADBB' },
  { name: 'Sunlight', hex: '#E89700' },
  { name: 'Heart', hex: '#F99AA9' },
  { name: 'Roots', hex: '#8C4500' },
  { name: 'Olive', hex: '#767317' },
]

function ThemePreviewCard({
  themeName,
  themeKey,
  mode,
  isActive,
  onSelect,
}: {
  themeName: string
  themeKey: AppTheme
  mode: AppMode
  isActive: boolean
  onSelect: () => void
}) {
  const colors = themePreviewColors[themeKey][mode]

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:scale-[1.02]",
        isActive
          ? "border-accent-blue shadow-lg shadow-accent-blue/20"
          : "border-border-color hover:border-border-light"
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-accent-blue flex items-center justify-center">
          <Check className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      {/* Mini preview */}
      <div
        className="p-4 space-y-3"
        style={{ background: colors.bg }}
      >
        {/* Mini sidebar + content preview */}
        <div className="flex gap-2 h-24">
          {/* Mini sidebar */}
          <div
            className="w-12 rounded-lg p-1.5 flex flex-col gap-1.5"
            style={{ background: colors.card, borderRight: `1px solid ${colors.border}` }}
          >
            <div className="w-full h-2 rounded" style={{ background: colors.accent, opacity: 0.3 }} />
            <div className="w-full h-1.5 rounded" style={{ background: colors.muted, opacity: 0.3 }} />
            <div className="w-full h-1.5 rounded" style={{ background: colors.accent }} />
            <div className="w-full h-1.5 rounded" style={{ background: colors.muted, opacity: 0.3 }} />
            <div className="w-full h-1.5 rounded" style={{ background: colors.muted, opacity: 0.3 }} />
          </div>
          {/* Mini content */}
          <div className="flex-1 space-y-2">
            <div className="h-2.5 rounded w-3/4" style={{ background: colors.text, opacity: 0.8 }} />
            <div className="h-1.5 rounded w-1/2" style={{ background: colors.muted, opacity: 0.5 }} />
            <div className="flex gap-1.5 mt-2">
              <div className="flex-1 h-8 rounded-lg" style={{ background: colors.card, border: `1px solid ${colors.border}` }} />
              <div className="flex-1 h-8 rounded-lg" style={{ background: colors.card, border: `1px solid ${colors.border}` }} />
            </div>
            <div className="flex gap-1.5">
              <div className="flex-1 h-8 rounded-lg" style={{ background: colors.card, border: `1px solid ${colors.border}` }} />
              <div className="flex-1 h-8 rounded-lg" style={{ background: colors.card, border: `1px solid ${colors.border}` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Theme name */}
      <div className="px-4 py-3 bg-bg-card border-t border-border-color">
        <p className="text-sm font-medium text-text-primary">{themeName}</p>
        <p className="text-xs text-text-muted mt-0.5">
          {themeKey === 'default' ? 'Navy & Indigo' : 'Flow Brand Colors'}
        </p>
      </div>
    </button>
  )
}

export default function SettingsPage() {
  const { mode, theme, setMode, setTheme, toggleMode } = useTheme()

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Customize your Flow SMS experience</p>
      </div>

      {/* Appearance Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent-purple/15">
            <Palette className="h-5 w-5 text-accent-purple" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Appearance</h2>
            <p className="text-sm text-text-muted">Choose your preferred look and feel</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="bg-bg-card rounded-2xl border border-border-color p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-accent-yellow/15">
                {mode === 'night' ? (
                  <Moon className="h-5 w-5 text-accent-yellow" />
                ) : (
                  <Sun className="h-5 w-5 text-accent-yellow" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Display Mode</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {mode === 'night' ? 'Night mode reduces eye strain in low light' : 'Day mode for brighter environments'}
                </p>
              </div>
            </div>

            {/* Mode pills */}
            <div className="flex bg-bg-surface rounded-xl p-1 border border-border-color">
              <button
                onClick={() => setMode('night')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  mode === 'night'
                    ? "bg-accent-blue text-white shadow-md"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                <Moon className="h-4 w-4" />
                Night
              </button>
              <button
                onClick={() => setMode('day')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  mode === 'day'
                    ? "bg-accent-yellow text-white shadow-md"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                <Sun className="h-4 w-4" />
                Day
              </button>
            </div>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="bg-bg-card rounded-2xl border border-border-color p-6">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary">Theme</h3>
            <p className="text-xs text-text-muted mt-0.5">Select a color theme for the interface</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ThemePreviewCard
              themeName="Default"
              themeKey="default"
              mode={mode}
              isActive={theme === 'default'}
              onSelect={() => setTheme('default')}
            />
            <ThemePreviewCard
              themeName="Flow"
              themeKey="flow"
              mode={mode}
              isActive={theme === 'flow'}
              onSelect={() => setTheme('flow')}
            />
          </div>
        </div>

        {/* Flow Brand Palette Reference */}
        {theme === 'flow' && (
          <div className="bg-bg-card rounded-2xl border border-border-color p-6 animate-fade-in">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Flow Brand Palette</h3>
              <p className="text-xs text-text-muted mt-0.5">Colors from the official Flow brand guide</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {flowBrandColors.map((color) => (
                <div key={color.name} className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-xl border border-border-color shadow-sm"
                    style={{ background: color.hex }}
                  />
                  <div className="text-center">
                    <p className="text-xs font-medium text-text-primary leading-tight">{color.name}</p>
                    <p className="text-[10px] text-text-muted uppercase">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Flow Gradients Preview */}
            <div className="mt-6 pt-4 border-t border-border-color">
              <p className="text-xs font-semibold text-text-primary mb-3">Brand Gradients</p>
              <div className="flex gap-2 flex-wrap">
                <div className="h-8 flex-1 min-w-[80px] rounded-lg" style={{ background: 'linear-gradient(135deg, #7DADBB, #F99AA9, #E89700)' }} title="Sunset" />
                <div className="h-8 flex-1 min-w-[80px] rounded-lg" style={{ background: 'linear-gradient(135deg, #3D3D3D, #7DADBB)' }} title="Deep Ocean" />
                <div className="h-8 flex-1 min-w-[80px] rounded-lg" style={{ background: 'linear-gradient(135deg, #7DADBB, #F3EDDF)' }} title="Ocean Chill" />
                <div className="h-8 flex-1 min-w-[80px] rounded-lg" style={{ background: 'linear-gradient(135deg, #F99AA9, #F3EDDF)' }} title="Pink Sky" />
                <div className="h-8 flex-1 min-w-[80px] rounded-lg" style={{ background: 'linear-gradient(135deg, #E89700, #F3EDDF)' }} title="Golden Hour" />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Account Section Placeholder */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent-blue/15">
            <Monitor className="h-5 w-5 text-accent-blue" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">General</h2>
            <p className="text-sm text-text-muted">Account and system preferences</p>
          </div>
        </div>

        <div className="bg-bg-card rounded-2xl border border-border-color p-6">
          <p className="text-sm text-text-muted">Additional settings coming soon.</p>
        </div>
      </section>
    </div>
  )
}
