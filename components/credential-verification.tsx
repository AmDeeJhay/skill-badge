"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { credentialVerifier, credentialManager, type VerifiableCredential } from "@/lib/w3c-vc"
import { apiClient } from "@/lib/backend-integration"
type CredentialVerificationResult = {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

type BackendCredentialResponse = {
  data: VerifiableCredential
}

type BackendStatusResponse = {
  data: {
    status: string
  }
}

type CredentialIssuer = {
  id: string
  name?: string
} | string

type CredentialStatus = {
  status: string
  type?: string
  id?: string
}

type CredentialProof = {
  type: string
  created: string
  verificationMethod: string
  proofPurpose: string
  proofValue?: string
}
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Shield,
  Clock,
  XCircle,
  FileText,
} from "lucide-react"

interface CredentialVerificationProps {
  credentialId?: string
}

export function CredentialVerification({ credentialId }: CredentialVerificationProps) {
  const { toast } = useToast()
  const [verificationMethod, setVerificationMethod] = useState<'id' | 'json'>('id')
  const [credentialIdInput, setCredentialIdInput] = useState(credentialId || "")
  const [credentialJson, setCredentialJson] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<CredentialVerificationResult | null>(null)
  const [credential, setCredential] = useState<VerifiableCredential | null>(null)

  const handleVerifyById = async () => {
    if (!credentialIdInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a credential ID",
        variant: "destructive"
      })
      return
    }

    setIsVerifying(true)
    try {
      // Try to get credential from backend first
      let cred: VerifiableCredential | null = null

      try {
        const backendCredential = await apiClient.getCredential(credentialIdInput) as BackendCredentialResponse
        cred = backendCredential.data
      } catch (backendError) {
        console.warn('Backend credential not found, trying local:', backendError)
      }

      // If not found in backend, try local storage
      if (!cred) {
        cred = await credentialManager.getCredential(credentialIdInput)
        if (!cred) {
          throw new Error("Credential not found in backend or local storage")
        }
      }

      setCredential(cred)

      // Verify the credential
      const result = await credentialVerifier.verifyCredential(cred)
      
      // Note: Backend data could be used for additional verification context
      // if needed, but the basic verification result doesn't include evidence

      setVerificationResult(result)

      if (result.isValid) {
        toast({
          title: "Verification Successful",
          description: "Credential is valid and authentic"
        })
      } else {
        toast({
          title: "Verification Failed",
          description: `Credential verification failed: ${result.errors.join(', ')}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "Failed to verify credential",
        variant: "destructive"
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleVerifyByJson = async () => {
    if (!credentialJson.trim()) {
      toast({
        title: "Error",
        description: "Please enter credential JSON",
        variant: "destructive"
      })
      return
    }

    setIsVerifying(true)
    try {
      // Parse credential JSON
      const cred = JSON.parse(credentialJson) as VerifiableCredential
      setCredential(cred)

      // Verify the credential
      const result = await credentialVerifier.verifyCredential(cred)
      setVerificationResult(result)

      if (result.isValid) {
        toast({
          title: "Verification Successful",
          description: "Credential is valid and authentic"
        })
      } else {
        toast({
          title: "Verification Failed",
          description: `Credential verification failed: ${result.errors.join(', ')}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "Failed to parse or verify credential",
        variant: "destructive"
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCheckStatus = async () => {
    if (!credentialIdInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a credential ID",
        variant: "destructive"
      })
      return
    }

    try {
      // Try backend first
      let status: string | null = null
      try {
        const statusResult = await apiClient.getCredentialStatus(credentialIdInput) as BackendStatusResponse
        status = statusResult.data.status
      } catch (backendError) {
        console.warn('Backend status check failed, trying local:', backendError)
        // Fallback to local
        status = await credentialManager.getCredentialStatus(credentialIdInput)
      }

      if (status === null) {
        toast({
          title: "Credential Not Found",
          description: "No credential found with this ID",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Credential Status",
        description: `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to check credential status",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'expired':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'revoked':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'expired':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'revoked':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Verification Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Credential Verification
          </CardTitle>
          <CardDescription>
            Verify W3C Verifiable Credentials by ID or JSON
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant={verificationMethod === 'id' ? 'default' : 'outline'}
              onClick={() => setVerificationMethod('id')}
            >
              Verify by ID
            </Button>
            <Button
              variant={verificationMethod === 'json' ? 'default' : 'outline'}
              onClick={() => setVerificationMethod('json')}
            >
              Verify by JSON
            </Button>
          </div>

          {verificationMethod === 'id' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="credentialId">Credential ID</Label>
                <Input
                  id="credentialId"
                  placeholder="credential:abc123..."
                  value={credentialIdInput}
                  onChange={(e) => setCredentialIdInput(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleVerifyById}
                  disabled={isVerifying}
                  className="flex-1"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Verify Credential
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCheckStatus}
                  disabled={isVerifying}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Check Status
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="credentialJson">Credential JSON</Label>
                <Textarea
                  id="credentialJson"
                  placeholder="Paste the credential JSON here..."
                  value={credentialJson}
                  onChange={(e) => setCredentialJson(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                onClick={handleVerifyByJson}
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
                    Verify Credential
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verificationResult.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              Verification Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className={verificationResult.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <AlertDescription className={verificationResult.isValid ? "text-green-700" : "text-red-700"}>
                <strong>Status:</strong> {verificationResult.isValid ? 'Valid' : 'Invalid'}
              </AlertDescription>
            </Alert>

            {verificationResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-red-600">Errors:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {verificationResult.errors.map((error: string, index: number) => (
                    <li key={index} className="text-sm text-red-600">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {verificationResult.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-600">Warnings:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {verificationResult.warnings.map((warning: string, index: number) => (
                    <li key={index} className="text-sm text-yellow-600">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Credential Details */}
      {credential && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Credential Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Credential ID</Label>
                <p className="text-sm text-muted-foreground font-mono">{credential.id}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Type</Label>
                <p className="text-sm text-muted-foreground">
                  {Array.isArray(credential.type) ? credential.type.join(', ') : String(credential.type)}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Issuer</Label>
                <p className="text-sm text-muted-foreground font-mono">
                  {typeof credential.issuer === 'string' 
                    ? credential.issuer 
                    : (credential.issuer as Exclude<CredentialIssuer, string>).id || 'Unknown'}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Issuance Date</Label>
                <p className="text-sm text-muted-foreground">
                  {credential.issuanceDate ? new Date(credential.issuanceDate).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              {credential.expirationDate && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Expiration Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(credential.expirationDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {credential.credentialStatus && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor((credential.credentialStatus as CredentialStatus).status || 'unknown')}`}>
                    {getStatusIcon((credential.credentialStatus as CredentialStatus).status || 'unknown')}
                    {((credential.credentialStatus as CredentialStatus).status || 'unknown').charAt(0).toUpperCase() + ((credential.credentialStatus as CredentialStatus).status || 'unknown').slice(1)}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Subject</Label>
              <div className="p-3 bg-muted rounded-md">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {JSON.stringify(credential.credentialSubject, null, 2)}
                </pre>
              </div>
            </div>

            {credential.proof && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Proof</Label>
                <div className="p-3 bg-muted rounded-md">
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <strong>Type:</strong> {(credential.proof as CredentialProof).type || 'Unknown'}
                    </div>
                    <div>
                      <strong>Created:</strong> {(credential.proof as CredentialProof).created ? new Date((credential.proof as CredentialProof).created).toLocaleString() : 'Unknown'}
                    </div>
                    <div>
                      <strong>Verification Method:</strong> {(credential.proof as CredentialProof).verificationMethod || 'Unknown'}
                    </div>
                    <div>
                      <strong>Proof Purpose:</strong> {(credential.proof as CredentialProof).proofPurpose || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
