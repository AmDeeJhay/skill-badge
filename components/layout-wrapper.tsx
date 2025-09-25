"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { useEffect, useState } from "react"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isLandingPage = pathname === "/"

  return (
    <div className="h-full relative">
      {mounted && !isLandingPage && (
        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-white">
          <Sidebar />
        </div>
      )}
      <main className={mounted && !isLandingPage ? "md:pl-72" : ""}>
        {children}
      </main>
    </div>
  )
}
