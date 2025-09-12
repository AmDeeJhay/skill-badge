"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import type { Credential } from "@/lib/mock-data"
import { CheckCircle, Share2, ExternalLink, Copy, Download, Calendar, User, Award, Shield, Hash } from "lucide-react"

interface CredentialDetailModalProps {
  credential: Credential
  children: React.ReactNode
}

export function CredentialDetailModal({ credential, children }: CredentialDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/credential/${credential.id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${credential.skillName} Credential`,
          text: `Check out my verified ${credential.skillName} credential from ${credential.issuerName}`,
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
    await navigator.clipboard.writeText(credential.id)
    toast({
      title: "ID copied",
      description: "Credential ID copied to clipboard",
    })
  }

  const handleViewOnChain = () => {
    if (credential.transactionHash) {
      window.open(`https://polkadot.js.org/apps/#/explorer/query/${credential.transactionHash}`, "_blank")
    }
  }

  const handleDownload = () => {
    // Create a JSON representation of the credential
    const credentialData = {
      id: credential.id,
      skillName: credential.skillName,
      issuerName: credential.issuerName,
      issueDate: credential.issueDate,
      description: credential.description,
      verified: credential.verified,
      transactionHash: credential.transactionHash,
      verificationUrl: `${window.location.origin}/credential/${credential.id}`,
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-balance">{credential.skillName}</DialogTitle>
              <DialogDescription className="text-base">{credential.issuerName}</DialogDescription>
            </div>
            <div className={`w-16 h-16 rounded-full ${credential.badgeColor} flex items-center justify-center`}>
              <Award className="w-8 h-8 text-white" />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {credential.verified ? (
              <Badge className="bg-green-500 text-white gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified on Blockchain
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Shield className="w-3 h-3" />
                Pending Verification
              </Badge>
            )}
          </div>

          {/* Description */}
          {credential.description && (
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Award className="w-4 h-4" />
                Description
              </h4>
              <p className="text-muted-foreground leading-relaxed">{credential.description}</p>
            </div>
          )}

          <Separator />

          {/* Credential Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
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
            </div>

            <div className="space-y-4">
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
                      {credential.transactionHash.slice(0, 20)}...
                    </code>
                    <Button size="sm" variant="ghost" onClick={handleViewOnChain}>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleShare} className="gap-2">
              <Share2 className="w-4 h-4" />
              Share Credential
            </Button>

            <Button variant="outline" onClick={handleDownload} className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Download
            </Button>

            {credential.transactionHash && (
              <Button variant="outline" onClick={handleViewOnChain} className="gap-2 bg-transparent">
                <ExternalLink className="w-4 h-4" />
                View on Blockchain
              </Button>
            )}
          </div>

          {/* Verification Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Verification Information</h4>
            <p className="text-xs text-muted-foreground">
              This credential is permanently stored on the Polkadot blockchain and can be independently verified by
              anyone using the credential ID or transaction hash above.
            </p>
            <p className="text-xs text-muted-foreground">
              Share URL:{" "}
              <code className="bg-background px-1 py-0.5 rounded">{`${window.location.origin}/credential/${credential.id}`}</code>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
