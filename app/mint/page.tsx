"use client"

import { useState } from "react"
import { MintCredentialForm } from "@/components/mint-credential-form"
import { CredentialPreview } from "@/components/credential-preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, ArrowLeft, ExternalLink, Share2, Award, Shield, Zap, Globe, Copy, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

function GlowingCard({ children, className = "", glowColor = "blue" as const }) {
  const glowClasses = {
    blue: "shadow-blue-500/20 hover:shadow-blue-500/40 border-blue-500/20 hover:border-blue-500/40",
    green: "shadow-green-500/20 hover:shadow-green-500/40 border-green-500/20 hover:border-green-500/40",
    indigo: "shadow-indigo-500/20 hover:shadow-indigo-500/40 border-indigo-500/20 hover:border-indigo-500/40",
    orange: "shadow-orange-500/20 hover:shadow-orange-500/40 border-orange-500/20 hover:border-orange-500/40"
  }
  return (
    <Card className={`bg-gray-900 text-white border-1 shadow-lg transition-all duration-300 hover:shadow-xl ${glowClasses[glowColor]} ${className}`}>
      {children}
    </Card>
  )
}

export default function MintPage() {
  const [mintedCredential, setMintedCredential] = useState<{
    credentialId: string
    transactionHash: string
  } | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleMintSuccess = (credentialId: string, transactionHash: string) => {
    setMintedCredential({ credentialId, transactionHash })
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/credential/${mintedCredential?.credentialId}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My New Skill Credential",
          text: "Check out my new verified skill credential on Skill Passport!",
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

  const handleViewTransaction = () => {
    if (mintedCredential?.transactionHash) {
      window.open(`https://polkadot.js.org/apps/#/explorer/query/${mintedCredential.transactionHash}`, "_blank")
    }
  }

  const handleReset = () => {
    setMintedCredential(null)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05] animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.02] animate-pulse delay-500" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {!mintedCredential ? (
          <>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-blue-500 mb-0">Mint Credential</h1>
                  <p className="text-gray-700 text-sm">Create a verified skill credential on the Polkadot blockchain</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-900 font-mono">Minting Portal</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Credential Details and Additional Info */}
              <div className="lg:col-span-3 space-y-6">
                {/* Credential Details Form - Full Width */}
                <GlowingCard glowColor="blue" className="shadow-md bg-white">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-black text-xl">Credential Details</CardTitle>
                        <CardDescription className="text-blue-500">Enter your skill information below</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <MintCredentialForm onSuccess={handleMintSuccess} />
                  </CardContent>
                </GlowingCard>

                {/* Important Notice */}
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/25">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Important Notice</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Once minted, credentials cannot be modified or deleted. They become a permanent part of your skill passport on the blockchain.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Network Info */}
                <Card className="shadow-md bg-white border border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Globe className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-900">Polkadot Network</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs text-green-600 font-medium">Connected</span>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Network Fee</span>
                        <span className="text-gray-900 font-mono">~0.01 DOT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confirmation Time</span>
                        <span className="text-gray-900 font-mono">~6-12 seconds</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - How It Works CTA */}
              <div className="lg:col-span-1">
                <Card className="shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900">How It Works</CardTitle>
                        <CardDescription className="text-gray-600">Learn about the minting process</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-6">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Want to know how the credential minting process works?
                    </p>

                    {/* <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-bold">1</span>
                        </div>
                        <span className="text-sm text-gray-700">Fill credential details</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-bold">2</span>
                        </div>
                        <span className="text-sm text-gray-700">Sign blockchain transaction</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-bold">3</span>
                        </div>
                        <span className="text-sm text-gray-700">Get verified credential</span>
                      </div>
                    </div> */}

                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                        asChild
                      >
                        <Link href="/">
                          Learn More
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>

                    <div className="bg-blue-100 rounded-lg p-4 mt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Blockchain Secured</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        All credentials are permanently stored on Polkadot's secure blockchain infrastructure.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="max-w-4xl mx-auto">
            {/* Success Header */}
            <div className="text-center space-y-6 mb-12">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-green-500/25 animate-pulse">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">Credential Minted Successfully!</h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                  Your skill credential has been created and verified on the Polkadot blockchain. It's now part of your permanent digital identity.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-green-600 font-mono">Transaction Confirmed</span>
              </div>
            </div>

            {/* Credential Preview */}
            <div className="mb-12">
              <div className="flex justify-center">
                <CredentialPreview
                  credentialData={{
                    skillName: "Sample Skill", // This would come from the form data
                    issuerName: "Sample Issuer",
                    issueDate: new Date().toISOString().split("T")[0],
                    description: "Sample description",
                  }}
                  credentialId={mintedCredential.credentialId}
                  transactionHash={mintedCredential.transactionHash}
                  onShare={handleShare}
                  onViewTransaction={handleViewTransaction}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleShare} 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Credential
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleViewTransaction} 
                  className="border-blue-500/50 hover:border-blue-400 text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 font-semibold"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Blockchain
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="border-gray-400 hover:border-gray-500 text-gray-600 hover:text-gray-700 bg-white hover:bg-gray-50 font-semibold"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Mint Another Credential
                </Button>
                <Button variant="outline" asChild className="border-gray-400 hover:border-gray-500 text-gray-600 hover:text-gray-700 bg-white hover:bg-gray-50 font-semibold">
                  <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Dashboard
                  </Link>
                </Button>
              </div>
            </div>

            {/* Transaction Hash Display */}
            <Card className="mt-12 shadow-lg border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Transaction Verified</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Your credential has been permanently recorded on the blockchain
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 text-green-700 px-3 py-1 rounded-lg font-mono border border-green-200 flex-1 truncate">
                        {mintedCredential.transactionHash}
                      </code>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => navigator.clipboard.writeText(mintedCredential.transactionHash)}
                        className="border-green-300 hover:border-green-400 text-green-600 hover:text-green-700 bg-white hover:bg-green-50"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}