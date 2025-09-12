"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, ExternalLink, Share2, Award } from "lucide-react"
import type { CredentialFormData } from "@/lib/validation"

interface CredentialPreviewProps {
  credentialData: CredentialFormData
  transactionHash?: string
  credentialId?: string
  onShare?: () => void
  onViewTransaction?: () => void
}

export function CredentialPreview({
  credentialData,
  transactionHash,
  credentialId,
  onShare,
  onViewTransaction,
}: CredentialPreviewProps) {
  const badgeColors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-pink-500", "bg-orange-500", "bg-cyan-500"]

  const badgeColor = badgeColors[credentialData.skillName.length % badgeColors.length]

  return (
    <Card className="w-64 h-72 relative overflow-hidden border-2 border-primary/50 shadow-lg">
      {/* Badge Background Pattern */}
      <div className={`absolute inset-0 ${badgeColor} opacity-10`} />
      <div className="absolute top-2 right-2">
        <Badge variant="default" className="bg-primary text-primary-foreground gap-1">
          <CheckCircle className="w-3 h-3" />
          Verified
        </Badge>
      </div>

      <CardHeader className="relative z-10 pb-2">
        <div className={`w-12 h-12 rounded-full ${badgeColor} flex items-center justify-center mb-2`}>
          <Award className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-sm font-bold text-balance leading-tight">{credentialData.skillName}</CardTitle>
        <p className="text-xs text-muted-foreground">{credentialData.issuerName}</p>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Issued: {new Date(credentialData.issueDate).toLocaleDateString()}
          </p>

          {credentialData.description && (
            <p className="text-xs text-muted-foreground line-clamp-3">{credentialData.description}</p>
          )}

          {credentialId && (
            <p className="text-xs text-muted-foreground font-mono">ID: {credentialId.slice(0, 12)}...</p>
          )}

          <div className="flex gap-1 pt-2">
            {onShare && (
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-transparent" onClick={onShare}>
                <Share2 className="w-3 h-3" />
              </Button>
            )}
            {onViewTransaction && transactionHash && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs bg-transparent"
                onClick={onViewTransaction}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
