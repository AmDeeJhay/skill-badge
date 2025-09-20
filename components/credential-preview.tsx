"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, ExternalLink, Share2, Award } from "lucide-react"
import type { CredentialFormData, SkillCredentialData } from "@/lib/validation"

interface CredentialPreviewProps {
  credentialData?: CredentialFormData | SkillCredentialData
  skillName?: string
  issuer?: string
  level?: string
  issueDate?: string
  description?: string
  transactionHash?: string
  credentialId?: string
  isVerified?: boolean
  onShare?: () => void
  onViewTransaction?: () => void
}

export function CredentialPreview({
  credentialData,
  skillName,
  issuer,
  level,
  issueDate,
  description,
  transactionHash,
  credentialId,
  isVerified = false,
  onShare,
  onViewTransaction,
}: CredentialPreviewProps) {
  // Use credentialData if provided, otherwise use individual props
  const skill = credentialData?.skillName || skillName || "Your Skill"
  const issuerName = ('issuerName' in (credentialData || {})) ? (credentialData as CredentialFormData).issuerName : issuer || "Issuing Organization"
  const skillLevel = 'skillLevel' in (credentialData || {}) ? (credentialData as SkillCredentialData).skillLevel : level || ""
  const issued = ('issueDate' in (credentialData || {})) ? (credentialData as CredentialFormData).issueDate : issueDate || new Date().toISOString().split('T')[0]
  const desc = credentialData?.description || description || ""

  const badgeColors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-pink-500", "bg-orange-500", "bg-cyan-500"]
  const badgeColor = badgeColors[skill.length % badgeColors.length]

  return (
    <Card className="w-64 h-72 relative overflow-hidden border-2 border-primary/50 shadow-lg">
      {/* Badge Background Pattern */}
      <div className={`absolute inset-0 ${badgeColor} opacity-10`} />
      {(isVerified || credentialId) && (
        <div className="absolute top-2 right-2">
          <Badge variant="default" className="bg-primary text-primary-foreground gap-1">
            <CheckCircle className="w-3 h-3" />
            Verified
          </Badge>
        </div>
      )}

      <CardHeader className="relative z-10 pb-2">
        <div className={`w-12 h-12 rounded-full ${badgeColor} flex items-center justify-center mb-2`}>
          <Award className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-sm font-bold text-balance leading-tight">{skill}</CardTitle>
        <p className="text-xs text-muted-foreground">{issuerName}</p>
        {skillLevel && (
          <p className="text-xs text-muted-foreground capitalize">{skillLevel} Level</p>
        )}
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Issued: {new Date(issued).toLocaleDateString()}
          </p>

          {desc && (
            <p className="text-xs text-muted-foreground line-clamp-3">{desc}</p>
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
