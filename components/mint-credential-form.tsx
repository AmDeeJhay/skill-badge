"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePolkadotWallet } from "@/hooks/use-polkadot-wallet"
import { useToast } from "@/hooks/use-toast"
import { validateCredentialForm, type CredentialFormData } from "@/lib/validation"
import { mintCredential, estimateTransactionFee } from "@/lib/blockchain"
import { Loader2, CheckCircle, AlertCircle, Award, Calendar, User, FileText } from "lucide-react"

interface MintCredentialFormProps {
  onSuccess?: (credentialId: string, transactionHash: string) => void
}

export function MintCredentialForm({ onSuccess }: MintCredentialFormProps) {
  const { selectedAccount, extension, isConnected } = usePolkadotWallet()
  const { toast } = useToast()

  const [formData, setFormData] = useState<CredentialFormData>({
    skillName: "",
    issuerName: "",
    issueDate: new Date().toISOString().split("T")[0],
    description: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [estimatedFee, setEstimatedFee] = useState<string>("")
  const [isEstimatingFee, setIsEstimatingFee] = useState(false)

  const handleInputChange = (field: keyof CredentialFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleEstimateFee = async () => {
    const validation = validateCredentialForm(formData)
    if (!validation.success) {
      setErrors(validation.errors)
      return
    }

    setIsEstimatingFee(true)
    try {
      const fee = await estimateTransactionFee()
      setEstimatedFee(fee)
    } catch (error) {
      toast({
        title: "Fee estimation failed",
        description: "Could not estimate transaction fee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEstimatingFee(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !selectedAccount || !extension) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint credentials.",
        variant: "destructive",
      })
      return
    }

    const validation = validateCredentialForm(formData)
    if (!validation.success) {
      setErrors(validation.errors)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const result = await mintCredential(formData, extension, selectedAccount.address)

      if (result.success && result.credentialId && result.transactionHash) {
        toast({
          title: "Credential minted successfully!",
          description: `Your ${formData.skillName} credential has been created and verified on the blockchain.`,
        })

        // Reset form
        setFormData({
          skillName: "",
          issuerName: "",
          issueDate: new Date().toISOString().split("T")[0],
          description: "",
        })
        setEstimatedFee("")

        onSuccess?.(result.credentialId, result.transactionHash)
      } else {
        throw new Error(result.error || "Minting failed")
      }
    } catch (error) {
      toast({
        title: "Minting failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Wallet Required</h3>
          <p className="text-muted-foreground">Please connect your Polkadot wallet to mint credentials.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Mint New Credential
        </CardTitle>
        <CardDescription>
          Create a new skill credential that will be verified and stored on the Polkadot blockchain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skill Name */}
          <div className="space-y-2">
            <Label htmlFor="skillName" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Skill Name *
            </Label>
            <Input
              id="skillName"
              placeholder="e.g., React Development, Blockchain Architecture"
              value={formData.skillName}
              onChange={(e) => handleInputChange("skillName", e.target.value)}
              className={errors.skillName ? "border-destructive" : ""}
            />
            {errors.skillName && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.skillName}
              </p>
            )}
          </div>

          {/* Issuer Name */}
          <div className="space-y-2">
            <Label htmlFor="issuerName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Issuer Name *
            </Label>
            <Input
              id="issuerName"
              placeholder="e.g., Tech Academy, Polkadot Institute"
              value={formData.issuerName}
              onChange={(e) => handleInputChange("issuerName", e.target.value)}
              className={errors.issuerName ? "border-destructive" : ""}
            />
            {errors.issuerName && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.issuerName}
              </p>
            )}
          </div>

          {/* Issue Date */}
          <div className="space-y-2">
            <Label htmlFor="issueDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Issue Date *
            </Label>
            <Input
              id="issueDate"
              type="date"
              value={formData.issueDate}
              onChange={(e) => handleInputChange("issueDate", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className={errors.issueDate ? "border-destructive" : ""}
            />
            {errors.issueDate && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.issueDate}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the skills, knowledge, or achievements this credential represents..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className={errors.description ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">{formData.description?.length || 0}/200 characters</p>
            {errors.description && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Fee Estimation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Transaction Fee</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleEstimateFee} disabled={isEstimatingFee}>
                {isEstimatingFee ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Estimating...
                  </>
                ) : (
                  "Estimate Fee"
                )}
              </Button>
            </div>
            {estimatedFee && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Estimated transaction fee: {estimatedFee}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Minting Credential...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mint Credential
                </>
              )}
            </Button>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your credential will be permanently stored on the Polkadot blockchain and cannot be modified after
              minting. Please review all information carefully.
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
    </Card>
  )
}
