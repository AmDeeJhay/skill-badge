"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CredentialDetailModal } from "@/components/credential-detail-modal"
import { CheckCircle, ExternalLink, Share2, Eye } from "lucide-react"
import type { Credential } from "@/lib/mock-data"
import Link from "next/link"

interface CredentialBadgeProps {
  credential: Credential
  size?: "sm" | "md" | "lg"
  showActions?: boolean
}

export function CredentialBadge({ credential, size = "md", showActions = false }: CredentialBadgeProps) {
  const sizeClasses = {
    sm: "w-32 h-40",
    md: "w-48 h-56",
    lg: "w-64 h-72",
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${credential.skillName} Credential`,
        text: `Check out my verified ${credential.skillName} credential from ${credential.issuerName}`,
        url: `${window.location.origin}/credential/${credential.id}`,
      })
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/credential/${credential.id}`)
    }
  }

  const handleViewOnChain = () => {
    if (credential.transactionHash) {
      // In a real app, this would link to a block explorer
      window.open(`https://polkadot.js.org/apps/#/explorer/query/${credential.transactionHash}`, "_blank")
    }
  }

  return (
    <CredentialDetailModal credential={credential}>
      <Card
        className={`${sizeClasses[size]} relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg cursor-pointer`}
      >
        {/* Badge Background Pattern */}
        <div className={`absolute inset-0 ${credential.badgeColor} opacity-10`} />
        <div className="absolute top-2 right-2">
          {credential.verified && (
            <Badge variant="default" className="bg-primary text-primary-foreground gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </Badge>
          )}
        </div>

        <CardHeader className="relative z-10 pb-2">
          <div className={`w-12 h-12 rounded-full ${credential.badgeColor} flex items-center justify-center mb-2`}>
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-sm font-bold text-balance leading-tight">{credential.skillName}</CardTitle>
          <CardDescription className="text-xs">{credential.issuerName}</CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 pt-0">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Issued: {new Date(credential.issueDate).toLocaleDateString()}
            </p>

            {credential.description && size !== "sm" && (
              <p className="text-xs text-muted-foreground line-clamp-3">{credential.description}</p>
            )}

            {showActions && (
              <div className="flex gap-1 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShare()
                  }}
                >
                  <Share2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewOnChain()
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-transparent" asChild>
                  <Link href={`/credential/${credential.id}`} onClick={(e) => e.stopPropagation()}>
                    <Eye className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </CredentialDetailModal>
  )
}
