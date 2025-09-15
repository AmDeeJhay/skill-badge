"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CredentialBadge } from "@/components/credential-badge"
import { WalletStatusIndicator } from "@/components/wallet-status-indicator"
import { usePolkadotWallet } from "@/hooks/use-polkadot-wallet"
import { getCredentialsByAddress, getCredentialStats } from "@/lib/data-service"
import { Search, Share2, Filter, Award, Calendar, Shield, Copy, ExternalLink, TrendingUp, Users, Globe, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Type definitions
type GlowColor = "blue" | "black" | "indigo" | "green" | "purple";

interface GlowingCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: GlowColor;
}

type GlowClasses = {
  [K in GlowColor]: string;
};

function GlowingCard({ children, className = "", glowColor = "blue" }: GlowingCardProps) {
  const glowClasses: GlowClasses = {
    blue: "shadow-blue-500/20 hover:shadow-blue-500/40 border-blue-500/20 hover:border-blue-500/40",
    black: "shadow-black/20 hover:shadow-black/40 border-gray-800 hover:border-gray-700",
    indigo: "shadow-indigo-500/20 hover:shadow-indigo-500/40 border-indigo-500/20 hover:border-indigo-500/40",
    green: "shadow-green-500/20 hover:shadow-green-500/40 border-green-500/20 hover:border-green-500/40",
    purple: "shadow-purple-500/20 hover:shadow-purple-500/40 border-purple-500/20 hover:border-purple-500/40"
  }
  return (
    <Card className={`bg-white text-gray-900 border-1 shadow-lg transition-all duration-300 hover:shadow-xl ${glowClasses[glowColor]} ${className}`}>
      {children}
    </Card>
  )
}

export default function ProfilePage() {
  const { isConnected, selectedAccount, formatAddress, credentials, stats, isLoadingCredentials } = usePolkadotWallet()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState<"all" | "verified" | "recent">("all")

  if (!isConnected || !selectedAccount) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Subtle background effects */}
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000" />
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Connect your Web3 wallet to access your decentralized skill passport and view your verified credentials.
            </p>
            <WalletStatusIndicator />
          </div>
        </div>
      </div>
    )
  }

  // Use credentials from the wallet hook (which fetches from live API)
  const userCredentials = credentials || []
  const userStats = stats || { total: 0, verified: 0, thisMonth: 0, skillAreas: 0 }

  // Filter credentials based on search and filter
  const filteredCredentials = userCredentials.filter((credential) => {
    const matchesSearch =
      credential.skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      credential.issuerName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "verified" && credential.verified) ||
      (filterBy === "recent" && new Date(credential.issueDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

    return matchesSearch && matchesFilter
  })

  const handleShareProfile = async () => {
    const profileUrl = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Skill Passport Profile",
          text: "Check out my verified skills and credentials on Skill Passport",
          url: profileUrl,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(profileUrl)
      toast({
        title: "Profile link copied",
        description: "Profile URL has been copied to your clipboard",
      })
    }
  }

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(selectedAccount.address)
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.02] animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.02] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-10">
          <GlowingCard className="relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5" />
            <CardContent className="relative z-10 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent mb-3">
                      Skill Badge Profile
                    </h1>
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={handleCopyAddress}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors group"
                      >
                        <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg group-hover:bg-blue-50 transition-colors">
                          {formatAddress(selectedAccount.address, 16)}
                        </span>
                        <Copy className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-600">Connected</span>
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{userStats.total} Credentials</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{userStats.verified} Verified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">Member since 2024</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleShareProfile}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 font-semibold px-6"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
              </div>
            </CardContent>
          </GlowingCard>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <GlowingCard glowColor="blue" className="shadow-sm hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{userStats.total}</div>
              <div className="text-sm text-gray-600">Total Skills</div>
            </CardContent>
          </GlowingCard>

          <GlowingCard glowColor="green" className="shadow-sm hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{userStats.verified}</div>
              <div className="text-sm text-gray-600">Verified On-Chain</div>
            </CardContent>
          </GlowingCard>

          <GlowingCard glowColor="purple" className="shadow-sm hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                {userStats.thisMonth > 0 && (
                  <span className="text-xs text-purple-500 bg-purple-500/10 px-2 py-1 rounded-full">New</span>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{userStats.thisMonth}</div>
              <div className="text-sm text-gray-600">This Month</div>
            </CardContent>
          </GlowingCard>

          <GlowingCard glowColor="indigo" className="shadow-sm hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <Globe className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{userStats.skillAreas || 0}</div>
              <div className="text-sm text-gray-600">Skill Areas</div>
            </CardContent>
          </GlowingCard>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search credentials by skill or issuer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-500/20 rounded-xl text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div className="flex gap-3">
            <Button 
              variant={filterBy === "all" ? "default" : "outline"} 
              onClick={() => setFilterBy("all")}
              className={filterBy === "all" 
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm" 
                : "border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-600 bg-white"
              }
            >
              All
            </Button>
            <Button
              variant={filterBy === "verified" ? "default" : "outline"}
              onClick={() => setFilterBy("verified")}
              className={filterBy === "verified" 
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm" 
                : "border-gray-300 text-gray-600 hover:border-green-300 hover:text-green-600 bg-white"
              }
            >
              <Shield className="w-4 h-4 mr-2" />
              Verified
            </Button>
            <Button
              variant={filterBy === "recent" ? "default" : "outline"}
              onClick={() => setFilterBy("recent")}
              className={filterBy === "recent" 
                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm" 
                : "border-gray-300 text-gray-600 hover:border-purple-300 hover:text-purple-600 bg-white"
              }
            >
              <Calendar className="w-4 h-4 mr-2" />
              Recent
            </Button>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Skill Credentials ({filteredCredentials.length})
              </h2>
              <p className="text-gray-600">Your verified achievements and skill certifications</p>
            </div>
            <Badge 
              variant="secondary" 
              className="bg-blue-50 text-blue-600 border-blue-200 px-4 py-2 text-sm font-medium"
            >
              {userStats.verified} of {userStats.total} verified
            </Badge>
          </div>

          {filteredCredentials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCredentials.map((credential) => (
                <CredentialBadge key={credential.id} credential={credential} size="md" showActions={true} />
              ))}
            </div>
          ) : (
            <GlowingCard className="p-12 text-center shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Filter className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Credentials Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery || filterBy !== "all"
                  ? "Try adjusting your search or filter criteria to find what you're looking for."
                  : "You haven't added any credentials yet. Start building your skill passport today."}
              </p>
              {!searchQuery && filterBy === "all" && (
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25">
                  Add Your First Credential
                </Button>
              )}
            </GlowingCard>
          )}
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlowingCard glowColor="blue">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                Skills Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Development</span>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">3</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Design</span>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">1</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Blockchain</span>
                  <Badge className="bg-green-100 text-green-700 border-green-200">1</Badge>
                </div>
              </div>
            </CardContent>
          </GlowingCard>

          <GlowingCard glowColor="green">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Verified</span>
                  <Badge className="bg-green-100 text-green-700 border-green-200">{userStats.verified}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending</span>
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">0</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total</span>
                  <Badge className="bg-gray-100 text-gray-700 border-gray-200">{userStats.total}</Badge>
                </div>
              </div>
            </CardContent>
          </GlowingCard>

          <GlowingCard glowColor="purple">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Month</span>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">{userStats.thisMonth}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last 30 Days</span>
                  <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">{userStats.thisMonth}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">All Time</span>
                  <Badge className="bg-gray-100 text-gray-700 border-gray-200">{userStats.total}</Badge>
                </div>
              </div>
            </CardContent>
          </GlowingCard>
        </div>
      </div>
    </div>
  )
}