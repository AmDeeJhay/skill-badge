"use client"

import type React from "react"
// import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { usePathname } from "next/navigation"
import "./globals.css"

// Configure Poppins font
// const poppins = Poppins({
//   subsets: ['latin'],
//   weight: ['300', '400', '500', '600', '700'],
//   variable: '--font-poppins',
// })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isLandingPage = pathname === "/"

  return (
    <html lang="en">
      <body className="poppins-regular">
        <div className="h-full relative">
          {!isLandingPage && (
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-white">
              <Sidebar />
            </div>
          )}
          <main className={!isLandingPage ? "md:pl-72" : ""}>
            <Suspense fallback={null}>{children}</Suspense>
          </main>
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}