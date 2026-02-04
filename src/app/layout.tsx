import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { DashboardWrapper } from "@/components/layout/DashboardWrapper"

export const metadata: Metadata = {
  title: "Flow SMS | Studio Management System",
  description: "Comprehensive studio management platform for architecture and engineering firms",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-bg-dark text-text-primary font-sans">
        <AuthProvider>
          <DashboardWrapper>
            {children}
          </DashboardWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
