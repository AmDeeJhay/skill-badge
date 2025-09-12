"use client"

import { useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { mockCredentials } from "@/lib/mock-data"
import {
  CheckCircle,
  Share2,
  ExternalLink,
  Copy,
  Download,
  Calendar,
  User,
  Award,
  Shield,
  Hash,
  ArrowLeft,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

export default function CredentialPage() {
  const params = useParams()
  const { toast } = useToast()
  const credentialId = params.id as string

  // Find the credential by ID
  const credential = mockCredentials.find((c) => c.id === credentialId)

  const handleShare = async () => {
    const shareUrl = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${credential?.skillName} Credential`,
          text: `Check out this verified ${credential?.skillName} credential from ${credential?.issuerName}`,
          url: shareUrl,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied",
        description: "Credential link has been copied to your clipboard",
      })
    }
  }

  const handleCopyId = async () => {
    if (credential) {
      await navigator.clipboard.writeText(credential.id)
      toast({
        title: "ID copied",
        description: "Credential ID copied to clipboard",
      })
    }
  }

  const handleViewOnChain = () => {
    if (credential?.transactionHash) {
      window.open(`https://polkadot.js.org/apps/#/explorer/query/${credential.transactionHash}`, "_blank")
    }
  }

  const handleDownload = () => {
    if (!credential) return

    const credentialData = {
      id: credential.id,
      skillName: credential.skillName,
      issuerName: credential.issuerName,
      issueDate: credential.issueDate,
      description: credential.description,
      verified: credential.verified,
      transactionHash: credential.transactionHash,
      verificationUrl: window.location.href,
    }

    const blob = new Blob([JSON.stringify(credentialData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${credential.skillName.replace(/\s+/g, "_")}_credential.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Download started",
      description: "Credential data has been downloaded as JSON",
    })
  }

  if (!credential) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Credential Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The credential you're looking for doesn't exist or may have been removed.
            </p>
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Credential Details</h1>
            <p className="text-muted-foreground">Verified skill credential on Polkadot blockchain</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Credential Badge */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-8 text-center">
                <div
                  className={`w-24 h-24 rounded-full ${credential.badgeColor} flex items-center justify-center mx-auto mb-4`}
                >
                  <Award className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2 text-balance">{credential.skillName}</h2>
                <p className="text-muted-foreground mb-4">{credential.issuerName}</p>

                {credential.verified ? (
                  <Badge className="bg-green-500 text-white gap-1 mb-4">
                    <CheckCircle className="w-3 h-3" />
                    Verified on Blockchain
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 mb-4">
                    <Shield className="w-3 h-3" />
                    Pending Verification
                  </Badge>
                )}

                <div className="flex flex-col gap-2">
                  <Button onClick={handleShare} className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Share Credential
                  </Button>
                  <Button variant="outline" onClick={handleDownload} className="gap-2 bg-transparent">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Credential Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {credential.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{credential.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Credential Information */}
            <Card>
              <CardHeader>
                <CardTitle>Credential Information</CardTitle>
                <CardDescription>Details about this skill credential</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Issuer
                    </h4>
                    <p className="text-muted-foreground">{credential.issuerName}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Issue Date
                    </h4>
                    <p className="text-muted-foreground">{new Date(credential.issueDate).toLocaleDateString()}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Credential ID
                    </h4>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{credential.id}</code>
                      <Button size="sm" variant="ghost" onClick={handleCopyId}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {credential.transactionHash && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Transaction Hash
                      </h4>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {credential.transactionHash}
                        </code>
                        <Button size="sm" variant="ghost" onClick={handleViewOnChain}>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex gap-3">
                  {credential.transactionHash && (
                    <Button variant="outline" onClick={handleViewOnChain} className="gap-2 bg-transparent">
                      <ExternalLink className="w-4 h-4" />
                      View on Blockchain
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Verification Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Verification Information
                </CardTitle>
                <CardDescription>How to verify this credential independently</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-sm">Blockchain Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    This credential is permanently stored on the Polkadot blockchain and can be independently verified
                    by anyone using the credential ID or transaction hash above.
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      <strong>Verification URL:</strong>
                    </p>
                    <code className="text-xs bg-background px-2 py-1 rounded block break-all">
                      {window.location.href}
                    </code>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-primary mb-2">Authenticity Guarantee</h4>
                  <p className="text-sm text-muted-foreground">
                    This credential cannot be forged, modified, or deleted. It represents a permanent, verifiable record
                    of achievement on the blockchain.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
