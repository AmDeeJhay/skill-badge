"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
// import { Poppins } from "next/font/google"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
import { SkillPassportLogo } from "@/components/skill-passport-logo"
import { Award, Plus, TrendingUp, Shield, Eye, Wallet, Copy, ExternalLink, Zap, Globe, Users } from "lucide-react"
import { usePolkadotWallet } from "@/hooks/use-polkadot-wallet"
import { WalletStatusIndicator } from "@/components/wallet-status-indicator"
import { CredentialBadge } from "@/components/credential-badge"

function GlowingCard({ children, className = "", glowColor = "blue" as const }: { children: React.ReactNode; className?: string; glowColor?: "blue" | "black" | "indigo" }) {
  const glowClasses = {
    blue: "shadow-blue-500/20 hover:shadow-blue-500/40 border-blue-500/20 hover:border-blue-500/40",
    black: "shadow-black/20 hover:shadow-black/40 border-gray-800 hover:border-gray-700",
    indigo: "shadow-indigo-500/20 hover:shadow-indigo-500/40 border-indigo-500/20 hover:border-indigo-500/40"
  }
  return (
    <Card className={`bg-white text-white border-1 shadow-lg transition-all duration-300 hover:shadow-xl ${glowClasses[glowColor]} ${className}`}>
      {children}
    </Card>
  )
}

export default function DashboardPage() {
  const { isConnected, selectedAccount, formatAddress, credentials, stats } = usePolkadotWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const copyAddress = () => {
    if (selectedAccount?.address) {
      navigator.clipboard.writeText(selectedAccount.address)
    }
  }

  if (!mounted) return null

  if (!isConnected || !selectedAccount) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000" />
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Wallet className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Connect your Web3 wallet to access your decentralized skill passport and start building your on-chain reputation.
            </p>
            <WalletStatusIndicator />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-8">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.02] animate-pulse" />
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.02] animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl flex items-center justify-center shadow-sm">
                <SkillPassportLogo className="w-12 h-12 text-black font-bold" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-blue-500 font-poppins">
                  Skill Badge
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-600 text-sm font-mono">
                    {formatAddress(selectedAccount.address, 12)}
                  </span>
                  <button 
                    onClick={copyAddress}
                    className="text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
              asChild
              className="bg-blue-400 hover:bg-blue-500 text-white border-1 border-blue-300 shadow-sm shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 font-semibold"
            >
              <Link href="/mint">
                <Plus className="w-4 h-4 mr-2" />
                Mint Credential
              </Link>
            </Button>
              <Button 
                asChild
                variant="outline" 
                className="border-blue-500/50 hover:border-blue-400 text-blue-400 hover:text-blue-300 bg-white hover:bg-transparent hover:text-gray-500 transition-all duration-300"
              >
                <Link href="/profile">
                  <Eye className="w-4 h-4 mr-2" />
                  Public Profile
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-10">
            <GlowingCard glowColor="blue" className="shadow-sm hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-black mb-1">{stats?.total ?? 0}</div>
                <div className="text-xs text-black">Total Credentials</div>
              </CardContent>
            </GlowingCard>

            <GlowingCard glowColor="blue" className="shadow-sm hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats?.verified ?? 0}</div>
                <div className="text-xs text-black">Verified On-Chain</div>
              </CardContent>
            </GlowingCard>

            <GlowingCard glowColor="blue" className="shadow-sm hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  {stats?.thisMonth > 0 && (
                    <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded">New</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats?.thisMonth ?? 0}</div>
                <div className="text-xs text-black">This Month</div>
              </CardContent>
            </GlowingCard>

            <GlowingCard glowColor="blue" className="shadow-sm hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{credentials?.filter(c => c.verified).length ?? 0}</div>
                <div className="text-xs text-black">Skill Areas</div>
              </CardContent>
            </GlowingCard>

            <GlowingCard glowColor="blue" className="shadow-sm hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-purple-500 bg-purple-500/10 px-2 py-1 rounded">Live</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats?.verified ?? 0}</div>
                <div className="text-xs text-black">Public Profile</div>
              </CardContent>
            </GlowingCard>


          </div>

          {/* Recent Credentials */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Recent Credentials</h2>
                <p className="text-black text-sm">Your latest achievements and verifications</p>
              </div>
              <Button variant="outline" className="border-blue-500/50 hover:border-blue-400 text-blue-500 hover:text-blue-600 bg-white hover:bg-blue-50" asChild>
                <Link href="/profile">
                  View All Credentials
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Link>
              </Button>
            </div>

            {credentials && credentials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {credentials
                  .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                  .slice(0, 4)
                  .map((credential) => (
                    <CredentialBadge key={credential.id} credential={credential} size="md" showActions={true} />
                  ))
                }
              </div>
            ) : (
              <GlowingCard className="p-12 text-center shadow-md hover:shadow-md">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">No Credentials Yet</h3>
                <p className="text-gray-600 mb-6">Start building your decentralized skill passport by minting your first credential.</p>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 font-semibold" asChild>
                  <Link href="/mint">
                    <Plus className="w-4 h-4 mr-2" />
                    Mint First Credential
                  </Link>
                </Button>
              </GlowingCard>
            )}
          </div>

          {/* Quick Actions */}
          <GlowingCard>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-black">Quick Actions</CardTitle>
                  <CardDescription className="text-blue-500">Fast-track your badge journey</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  asChild
                  variant="outline" 
                  className="justify-start h-auto p-4 bg-gray-700 border-blue-500/30 hover:border-blue-400/50 hover:bg-gray-800 text-left transition-all duration-300 group"
                >
                  <Link href="/mint">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white group-hover:text-blue-400 transition-colors">Mint Credential</div>
                        <div className="text-sm text-gray-400">Add new skill verification</div>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button 
                  asChild
                  variant="outline" 
                  className="justify-start h-auto p-4 bg-gray-700 border-blue-500/30 hover:border-blue-400/50 hover:bg-gray-800 text-left transition-all duration-300 group"
                >
                  <Link href="/profile">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white group-hover:text-blue-400 transition-colors">Public Profile</div>
                        <div className="text-sm text-gray-400">Share your achievements</div>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </GlowingCard>
        </div>
      </div>
    </div>
  )
}