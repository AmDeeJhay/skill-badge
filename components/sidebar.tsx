"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, LayoutDashboard, Wallet2, Plus, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { SkillPassportLogo } from "./skill-passport-logo"

const routes = [
  {
    label: "Home",
    icon: Home,
    href: "/",
    color: "text-gray-500"
  },
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-gray-500"
  },
  {
    label: "Mint",
    icon: Plus,
    href: "/mint",
    color: "text-gray-500"
  },
  {
    label: "Wallet",
    icon: Wallet2,
    href: "/wallet",
    color: "text-gray-500"
  },

  {
    label: "Profile",
    icon: User,
    href: "/profile",
    color: "text-gray-500"
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-gray-500"
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="relative flex flex-col h-full bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/5 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Section */}
        <div className="px-6 py-8">
          <Link href="/" className="group flex items-center transition-all duration-300 hover:scale-105">
            <div className="relative w-10 h-10 mr-4 p-1 border-1 border-blue-300 shadow-sm rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 group-hover:from-blue-500/20 group-hover:to-blue-600/30 transition-all duration-300">
              <SkillPassportLogo />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Skill Badge
              </h1>
              <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500" />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {routes.map((route) => {
            const isActive = pathname === route.href
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group relative flex items-center px-4 py-3.5 rounded-2xl font-medium text-sm transition-all duration-300 overflow-hidden",
                  "hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/40",
                  "hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10",
                  "active:scale-95",
                  isActive 
                    ? "bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent text-blue-600 shadow-lg shadow-blue-500/20" 
                    : "text-gray-700 hover:text-blue-600"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full" />
                )}
                
                {/* Background glow for active state */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-2xl" />
                )}
                
                {/* Icon */}
                <div className={cn(
                  "relative p-1.5 rounded-xl mr-4 transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-600" 
                    : "group-hover:bg-blue-500/10 group-hover:text-blue-600"
                )}>
                  <route.icon className="h-5 w-5" />
                </div>
                
                {/* Label */}
                <span className="relative z-10 font-medium tracking-wide">
                  {route.label}
                </span>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/5 to-transparent" />
              </Link>
            )
          })}
        </nav>

        {/* Bottom gradient fade */}
        <div className="h-8 bg-gradient-to-t from-white/50 to-transparent" />
      </div>
    </div>
  )
}