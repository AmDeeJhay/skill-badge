"use client"

import { useState } from "react"
import { EnhancedMintCredentialForm } from "@/components/enhanced-mint-credential-form"
import { CredentialVerification } from "@/components/credential-verification"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Award, 
  Shield, 
  CheckCircle, 
  FileText, 
  ExternalLink,
  Clock,
  User,
  Calendar,
  Globe
} from "lucide-react"
import { VerifiableCredential } from "@/lib/w3c-vc"

export default function EnhancedMintPage() {
  const [activeTab, setActiveTab] = useState("mint")
  const [mintedCredential, setMintedCredential] = useState<VerifiableCredential | null>(null)

  const handleCredentialMinted = (credential: VerifiableCredential) => {
    setMintedCredential(credential)
    setActiveTab("verify")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                W3C Verifiable Credentials Portal
              </h1>
              <p className="text-gray-600">
                Issue, verify, and manage W3C-compliant verifiable credentials on Polkadot
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                W3C Compliant
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Polkadot Network
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mint" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Mint Credential
            </TabsTrigger>
            <TabsTrigger value="verify" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Verify Credential
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Manage Credentials
            </TabsTrigger>
          </TabsList>

          {/* Mint Credential Tab */}
          <TabsContent value="mint" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2">
                <EnhancedMintCredentialForm onSuccess={handleCredentialMinted} />
              </div>

              {/* Info Panel */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      W3C Standards
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Cryptographic Proof</p>
                          <p className="text-xs text-gray-600">Ed25519 digital signatures</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">DID Integration</p>
                          <p className="text-xs text-gray-600">Decentralized identifiers</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Expiration Support</p>
                          <p className="text-xs text-gray-600">Automatic status management</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Revocation Support</p>
                          <p className="text-xs text-gray-600">Credential lifecycle management</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-purple-500" />
                      External Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm">GitHub API Integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm">LinkedIn API Integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm">Modular Service Layer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm">Event Logging</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      Network Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Network:</span>
                      <span className="font-mono">Polkadot</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Est. Fee:</span>
                      <span className="font-mono">~0.01 DOT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confirmation:</span>
                      <span className="font-mono">~6 seconds</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Standards:</span>
                      <span className="font-mono">W3C VC</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Verify Credential Tab */}
          <TabsContent value="verify" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CredentialVerification 
                  credentialId={mintedCredential?.id} 
                />
              </div>
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      Verification Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Cryptographic Verification</p>
                          <p className="text-xs text-gray-600">Verify digital signatures</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">DID Resolution</p>
                          <p className="text-xs text-gray-600">Resolve issuer identity</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Status Checking</p>
                          <p className="text-xs text-gray-600">Check expiration & revocation</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">JSON-LD Validation</p>
                          <p className="text-xs text-gray-600">Structure validation</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Manage Credentials Tab */}
          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Credential Management
                </CardTitle>
                <CardDescription>
                  Manage your issued and received credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Credential Management
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    View, revoke, and manage your credentials. This feature will be available in the next update.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline">
                      <User className="w-4 h-4 mr-2" />
                      My Credentials
                    </Button>
                    <Button variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Issued Credentials
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
