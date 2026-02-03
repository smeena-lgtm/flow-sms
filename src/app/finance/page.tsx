"use client"

import { DollarSign, TrendingUp, PieChart, BarChart3 } from "lucide-react"

export default function FinancePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Finance</h1>
          <p className="text-sm text-text-muted mt-1">
            Financial overview and reports
          </p>
        </div>
      </div>

      {/* Coming Soon State */}
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-accent-blue/10 flex items-center justify-center mb-6">
          <DollarSign className="h-10 w-10 text-accent-blue" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Coming Soon
        </h2>
        <p className="text-text-muted text-center max-w-md mb-8">
          Financial data and reports will be available once connected to your
          finance systems.
        </p>

        {/* Placeholder Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          <div className="rounded-xl bg-bg-card border border-border-color p-4 opacity-50">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-accent-green" />
              <span className="font-medium text-text-primary text-sm">
                Revenue Tracking
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Monitor revenue across projects
            </p>
          </div>
          <div className="rounded-xl bg-bg-card border border-border-color p-4 opacity-50">
            <div className="flex items-center gap-3 mb-2">
              <PieChart className="h-5 w-5 text-accent-purple" />
              <span className="font-medium text-text-primary text-sm">
                Budget Analysis
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Track budgets and spending
            </p>
          </div>
          <div className="rounded-xl bg-bg-card border border-border-color p-4 opacity-50">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-5 w-5 text-accent-cyan" />
              <span className="font-medium text-text-primary text-sm">
                P&L Reports
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Profit and loss statements
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
