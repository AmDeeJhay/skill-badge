"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePolkadotWallet } from "@/hooks/use-polkadot-wallet"
import { useToast } from "@/hooks/use-toast"
import { 
  validateCredentialIssue, 
  type CredentialIssueData,
  type SkillCredentialData,
  type ExperienceCredentialData
} from "@/lib/validation"
import { 
  didManager, 
  credentialIssuer, 
  credentialVerifier,
  type VerifiableCredential 
} from "@/lib/w3c-vc"
import { verificationServiceManager } from "@/lib/external-integrations"
import { backendIntegration } from "@/lib/backend-integration"
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Award, 
  Calendar, 
  User, 
  FileText,
  Shield,
  ExternalLink,
  Github,
  Linkedin,
  Clock,
  XCircle
} from "lucide-react"

interface EnhancedMintCredentialFormProps {
  onSuccess?: (credential: VerifiableCredential) => void
}

export function EnhancedMintCredentialForm({ onSuccess }: EnhancedMintCredentialFormProps) {
  const { selectedAccount, extension, isConnected } = usePolkadotWallet()
  const { toast } = useToast()

  const [credentialType, setCredentialType] = useState<'SkillCredential' | 'ExperienceCredential'>('SkillCredential')
  const [formData, setFormData] = useState<SkillCredentialData | ExperienceCredentialData>({
    skillName: "",
    skillLevel: "beginner",
    verifierDID: "",
    evidenceUrl: "",
    description: ""
  })
  
  const [externalVerification, setExternalVerification] = useState({
    githubUsername: "",
    linkedinProfileId: "",
    enableVerification: false
  })
  
  const [expirationDate, setExpirationDate] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleCredentialTypeChange = (type: 'SkillCredential' | 'ExperienceCredential') => {
    setCredentialType(type)
    setFormData(type === 'SkillCredential' ? {
      skillName: "",
      skillLevel: "beginner",
      verifierDID: "",
      evidenceUrl: "",
      description: ""
    } : {
      projectTitle: "",
      projectDescription: "",
      verifierDID: "",
      startDate: "",
      endDate: "",
      technologies: [],
      evidenceUrl: ""
    })
    setErrors({})
  }

  const handleExternalVerification = async () => {
    if (!externalVerification.githubUsername && !externalVerification.linkedinProfileId) {
      toast({
        title: "Verification Error",
        description: "Please provide at least one external verification source",
        variant: "destructive"
      })
      return
    }

    setIsVerifying(true)
    try {
      const skillName = credentialType === 'SkillCredential' 
        ? (formData as SkillCredentialData).skillName 
        : (formData as ExperienceCredentialData).projectTitle

      const result = await verificationServiceManager.verifySkillWithMultipleSources(
        externalVerification.githubUsername || undefined,
        externalVerification.linkedinProfileId || undefined,
        skillName
      )

      setVerificationResult(result)
      
      if (result.combined.isValid) {
        toast({
          title: "Verification Successful",
          description: `Skill verified with ${result.combined.confidence * 100}% confidence`
        })
      } else {
        toast({
          title: "Verification Failed",
          description: "Could not verify skill with external sources",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Failed to verify skill with external sources",
        variant: "destructive"
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !selectedAccount || !extension) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint credentials.",
        variant: "destructive"
      })
      return
    }

    // Generate DIDs
    const subjectDID = didManager.generateDID()
    const issuerDID = didManager.generateDID()

    // Create issuer DID document
    const issuerDocument = didManager.createDIDDocument(issuerDID, "mock-public-key")

    const credentialIssueData: CredentialIssueData = {
      credentialType,
      subjectDID,
      issuerDID,
      credentialData: formData,
      expirationDate: expirationDate || undefined
    }

    const validation = validateCredentialIssue(credentialIssueData)
    if (!validation.success) {
      setErrors(validation.errors)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // First, ensure user exists in backend
      await backendIntegration.initializeUser(selectedAccount.address, subjectDID, {
        name: "User", // You might want to get this from wallet or user input
      })

      // Create credential data for backend
      const credentialData = {
        skill: credentialType === 'SkillCredential' 
          ? (formData as SkillCredentialData).skillName 
          : (formData as ExperienceCredentialData).projectTitle,
        organization: formData.verifierDID,
        issuer: issuerDID,
        expirationDate: expirationDate || undefined,
        metadata: {
          credentialType,
          skillLevel: credentialType === 'SkillCredential' ? (formData as SkillCredentialData).skillLevel : undefined,
          description: formData.description,
          evidenceUrl: formData.evidenceUrl,
          ...(credentialType === 'ExperienceCredential' && {
            projectTitle: (formData as ExperienceCredentialData).projectTitle,
            projectDescription: (formData as ExperienceCredentialData).projectDescription,
            startDate: (formData as ExperienceCredentialData).startDate,
            endDate: (formData as ExperienceCredentialData).endDate,
            technologies: (formData as ExperienceCredentialData).technologies,
          })
        }
      }

      // Create credential in backend
      const backendCredential = await backendIntegration.createW3CCredential(
        subjectDID, // Using DID as userId for now
        credentialData
      )

      // Also create local W3C VC for verification
      let credential: VerifiableCredential

      if (credentialType === 'SkillCredential') {
        credential = await credentialIssuer.issueSkillCredential(
          subjectDID,
          formData as SkillCredentialData,
          issuerDID,
          expirationDate || undefined
        )
      } else {
        credential = await credentialIssuer.issueExperienceCredential(
          subjectDID,
          formData as ExperienceCredentialData,
          issuerDID,
          expirationDate || undefined
        )
      }

      // Verify the credential
      const verification = await credentialVerifier.verifyCredential(credential)

      if (!verification.isValid) {
        throw new Error(`Credential verification failed: ${verification.errors.join(', ')}`)
      }

      // If external verification was performed, verify with backend
      if (verificationResult?.combined.isValid) {
        try {
          await backendIntegration.verifyCredentialWithExternalSources(
            backendCredential.data.id,
            {
              github: externalVerification.githubUsername,
              linkedin: externalVerification.linkedinProfileId,
            }
          )
        } catch (error) {
          console.warn('Backend verification failed:', error)
          // Continue with local verification
        }
      }

      toast({
        title: "Credential minted successfully!",
        description: `Your ${credentialType} has been created and verified on the blockchain.`,
      })

      // Reset form
      setFormData(credentialType === 'SkillCredential' ? {
        skillName: "",
        skillLevel: "beginner",
        verifierDID: "",
        evidenceUrl: "",
        description: ""
      } : {
        projectTitle: "",
        projectDescription: "",
        verifierDID: "",
        startDate: "",
        endDate: "",
        technologies: [],
        evidenceUrl: ""
      })
      setExpirationDate("")
      setVerificationResult(null)

      onSuccess?.(credential)
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
          <p className="text-muted-foreground">Please connect your Polkadot wallet to mint W3C Verifiable Credentials.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Credential Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            W3C Verifiable Credential Type
          </CardTitle>
          <CardDescription>
            Choose the type of credential you want to mint. All credentials follow W3C standards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={credentialType === 'SkillCredential' ? 'default' : 'outline'}
              onClick={() => handleCredentialTypeChange('SkillCredential')}
              className="h-20 flex flex-col gap-2"
            >
              <Award className="w-6 h-6" />
              <span>Skill Credential</span>
              <span className="text-xs opacity-70">Programming, Design, etc.</span>
            </Button>
            <Button
              variant={credentialType === 'ExperienceCredential' ? 'default' : 'outline'}
              onClick={() => handleCredentialTypeChange('ExperienceCredential')}
              className="h-20 flex flex-col gap-2"
            >
              <FileText className="w-6 h-6" />
              <span>Experience Credential</span>
              <span className="text-xs opacity-70">Projects, Work Experience</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            {credentialType === 'SkillCredential' ? 'Skill' : 'Experience'} Credential Details
          </CardTitle>
          <CardDescription>
            Fill in the details for your {credentialType.toLowerCase()}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {credentialType === 'SkillCredential' ? (
              <>
                {/* Skill Name */}
                <div className="space-y-2">
                  <Label htmlFor="skillName" className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Skill Name *
                  </Label>
                  <Input
                    id="skillName"
                    placeholder="e.g., React Development, Blockchain Architecture"
                    value={(formData as SkillCredentialData).skillName}
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

                {/* Skill Level */}
                <div className="space-y-2">
                  <Label htmlFor="skillLevel">Skill Level *</Label>
                  <select
                    id="skillLevel"
                    value={(formData as SkillCredentialData).skillLevel}
                    onChange={(e) => handleInputChange("skillLevel", e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                {/* Project Title */}
                <div className="space-y-2">
                  <Label htmlFor="projectTitle" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Project Title *
                  </Label>
                  <Input
                    id="projectTitle"
                    placeholder="e.g., E-commerce Platform, Mobile App"
                    value={(formData as ExperienceCredentialData).projectTitle}
                    onChange={(e) => handleInputChange("projectTitle", e.target.value)}
                    className={errors.projectTitle ? "border-destructive" : ""}
                  />
                  {errors.projectTitle && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.projectTitle}
                    </p>
                  )}
                </div>

                {/* Project Description */}
                <div className="space-y-2">
                  <Label htmlFor="projectDescription" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Project Description *
                  </Label>
                  <Textarea
                    id="projectDescription"
                    placeholder="Describe the project, your role, and key achievements..."
                    value={(formData as ExperienceCredentialData).projectDescription}
                    onChange={(e) => handleInputChange("projectDescription", e.target.value)}
                    rows={3}
                    className={errors.projectDescription ? "border-destructive" : ""}
                  />
                  {errors.projectDescription && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.projectDescription}
                    </p>
                  )}
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={(formData as ExperienceCredentialData).startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className={errors.startDate ? "border-destructive" : ""}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.startDate}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    End Date (Optional)
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={(formData as ExperienceCredentialData).endDate || ""}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Verifier DID */}
            <div className="space-y-2">
              <Label htmlFor="verifierDID" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Verifier DID *
              </Label>
              <Input
                id="verifierDID"
                placeholder="did:polkadot:verifier-123 or organization DID"
                value={formData.verifierDID}
                onChange={(e) => handleInputChange("verifierDID", e.target.value)}
                className={errors.verifierDID ? "border-destructive" : ""}
              />
              {errors.verifierDID && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.verifierDID}
                </p>
              )}
            </div>

            {/* Evidence URL */}
            <div className="space-y-2">
              <Label htmlFor="evidenceUrl" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Evidence URL (Optional)
              </Label>
              <Input
                id="evidenceUrl"
                type="url"
                placeholder="https://certificate-url.com or portfolio link"
                value={formData.evidenceUrl || ""}
                onChange={(e) => handleInputChange("evidenceUrl", e.target.value)}
                className={errors.evidenceUrl ? "border-destructive" : ""}
              />
              {errors.evidenceUrl && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.evidenceUrl}
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
                placeholder="Additional details about this credential..."
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className={errors.description ? "border-destructive" : ""}
              />
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label htmlFor="expirationDate" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Expiration Date (Optional)
              </Label>
              <Input
                id="expirationDate"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for credentials that don't expire
              </p>
            </div>

            {/* External Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  External Verification
                </CardTitle>
                <CardDescription>
                  Verify your skills with external platforms for higher credibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableVerification"
                    checked={externalVerification.enableVerification}
                    onChange={(e) => setExternalVerification(prev => ({
                      ...prev,
                      enableVerification: e.target.checked
                    }))}
                  />
                  <Label htmlFor="enableVerification">Enable external verification</Label>
                </div>

                {externalVerification.enableVerification && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="githubUsername" className="flex items-center gap-2">
                          <Github className="w-4 h-4" />
                          GitHub Username
                        </Label>
                        <Input
                          id="githubUsername"
                          placeholder="your-github-username"
                          value={externalVerification.githubUsername}
                          onChange={(e) => setExternalVerification(prev => ({
                            ...prev,
                            githubUsername: e.target.value
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedinProfileId" className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4" />
                          LinkedIn Profile ID
                        </Label>
                        <Input
                          id="linkedinProfileId"
                          placeholder="linkedin-profile-id"
                          value={externalVerification.linkedinProfileId}
                          onChange={(e) => setExternalVerification(prev => ({
                            ...prev,
                            linkedinProfileId: e.target.value
                          }))}
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleExternalVerification}
                      disabled={isVerifying}
                      className="w-full"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Verify with External Sources
                        </>
                      )}
                    </Button>

                    {verificationResult && (
                      <Alert className={verificationResult.combined.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                        <div className="flex items-center gap-2">
                          {verificationResult.combined.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <AlertDescription className={verificationResult.combined.isValid ? "text-green-700" : "text-red-700"}>
                            <strong>Verification Result:</strong> {verificationResult.combined.isValid ? 'Verified' : 'Not Verified'} 
                            (Confidence: {Math.round(verificationResult.combined.confidence * 100)}%)
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Minting W3C Credential...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mint W3C Verifiable Credential
                  </>
                )}
              </Button>
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your credential will be issued as a W3C Verifiable Credential with cryptographic proof.
                It will be permanently stored and can be verified by any compatible system.
              </AlertDescription>
            </Alert>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
