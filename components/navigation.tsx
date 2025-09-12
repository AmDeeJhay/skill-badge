"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SkillPassportLogo } from "@/components/skill-passport-logo"
import { WalletConnectionButton } from "@/components/wallet-connection-button"
import { Button } from "@/components/ui/button"
import { Home, User, Award, Plus } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: Award },
    { href: "/profile", label: "Profile", icon: User },
  ]

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <SkillPassportLogo className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Skill badge</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {pathname !== "/" && (
              <Button size="sm" className="hidden sm:flex" asChild>
                <Link href="/mint">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Credential
                </Link>
              </Button>
            )}
            <WalletConnectionButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-6 mt-4 pt-4 border-t border-border">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
