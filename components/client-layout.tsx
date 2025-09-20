"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const isLandingPage = pathname === "/"

  return (
    <div className="h-full relative">
      {!isLandingPage && (
        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-white">
          <Sidebar />
        </div>
      )}
      <main className={!isLandingPage ? "md:pl-72" : ""}>
        {children}
      </main>
      <Toaster />
    </div>
  )
}
