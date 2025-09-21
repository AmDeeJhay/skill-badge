import type React from "react"
// import type { Metadata } from "next"
// import { Poppins } from "next/font/google" // Removed unused import
import { Analytics } from "@vercel/analytics/next"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Toaster } from "@/components/ui/toaster"
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
  return (
    <html lang="en">
      <body className="poppins-regular">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}