import type { Metadata } from "next"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

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
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
            <Header title="Dashboard" subtitle="Welcome back, Swapnil" />
            <main className="flex-1 p-4 md:p-6 bg-midnight overflow-x-hidden">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
