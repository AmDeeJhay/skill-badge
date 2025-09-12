"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { MintCredentialForm } from "@/components/mint-credential-form"
import { CredentialPreview } from "@/components/credential-preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, ArrowLeft, ExternalLink, Share2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mint New Credential</h1>
            <p className="text-muted-foreground">Create a verified skill credential on the Polkadot blockchain</p>
          </div>
        </div>

        {!mintedCredential ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div>
              <MintCredentialForm onSuccess={handleMintSuccess} />
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                  <CardDescription>Your credential minting process</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Fill Credential Details</h4>
                      <p className="text-sm text-muted-foreground">
                        Enter your skill name, issuer, and other relevant information
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Sign Transaction</h4>
                      <p className="text-sm text-muted-foreground">Confirm the transaction with your Polkadot wallet</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Blockchain Verification</h4>
                      <p className="text-sm text-muted-foreground">
                        Your credential is permanently stored and verified on-chain
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Once minted, credentials cannot be modified or deleted. They become a
                  permanent part of your skill passport on the blockchain.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Credential Minted Successfully!</h2>
              <p className="text-muted-foreground">
                Your skill credential has been created and verified on the Polkadot blockchain.
              </p>
            </div>

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

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleShare} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Credential
                </Button>
                <Button variant="outline" onClick={handleViewTransaction} className="gap-2 bg-transparent">
                  <ExternalLink className="w-4 h-4" />
                  View on Blockchain
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={handleReset}>
                  Mint Another Credential
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Transaction Hash:</strong>{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">{mintedCredential.transactionHash}</code>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  )
}
