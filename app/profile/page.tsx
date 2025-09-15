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
import { Search, Share2, Filter, Award, Calendar, Shield, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { isConnected, selectedAccount, formatAddress, credentials, stats, isLoadingCredentials } = usePolkadotWallet()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState<"all" | "verified" | "recent">("all")

  if (!isConnected || !selectedAccount) {
    return (
      <div className="min-h-screen bg-background">
        
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">
              Please connect your Polkadot wallet to view your skill passport profile.
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
    <div className="min-h-screen bg-background">
      

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
            <CardContent className="relative z-10 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                    <Award className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {/* {selectedAccount.meta.name || "Skill Passport User"} */}
                    </h1>
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={handleCopyAddress}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <span className="text-sm font-mono">{formatAddress(selectedAccount.address, 16)}</span>
                        <Copy className="w-4 h-4" />
                      </button>
                      <WalletStatusIndicator />
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{userStats.total} Credentials</span>
                      <span>{userStats.verified} Verified</span>
                      <span>Member since 2024</span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleShareProfile} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search credentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button variant={filterBy === "all" ? "default" : "outline"} size="sm" onClick={() => setFilterBy("all")}>
              All
            </Button>
            <Button
              variant={filterBy === "verified" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterBy("verified")}
            >
              <Shield className="w-4 h-4 mr-1" />
              Verified
            </Button>
            <Button
              variant={filterBy === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterBy("recent")}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Recent
            </Button>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Skill Credentials ({filteredCredentials.length})</h2>
            <Badge variant="secondary">
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
            <Card className="p-12 text-center">
              <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Credentials Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filterBy !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "You haven't added any credentials yet."}
              </p>
              {!searchQuery && filterBy === "all" && <Button>Add Your First Credential</Button>}
            </Card>
          )}
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Skills Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Development</span>
                  <Badge variant="secondary">3</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Design</span>
                  <Badge variant="secondary">1</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Blockchain</span>
                  <Badge variant="secondary">1</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Verified</span>
                  <Badge className="bg-green-500 text-white">{userStats.verified}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <Badge variant="secondary">0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <Badge variant="outline">{userStats.total}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <Badge variant="secondary">{userStats.thisMonth}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last 30 Days</span>
                  <Badge variant="secondary">{userStats.thisMonth}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">All Time</span>
                  <Badge variant="outline">{userStats.total}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
