"use client"

import { useState } from "react"
import { EnhancedMintCredentialForm } from "@/components/enhanced-mint-credential-form"
import { CredentialVerification } from "@/components/credential-verification"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import React from "react"
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
  Globe,
  Info,
  X,
  HelpCircle,
  Zap,
  Database,
  Key,
  // Timer,
  // RefreshCw,
  Settings
} from "lucide-react"
import { VerifiableCredential } from "@/lib/w3c-vc"

// Type definitions
interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

interface Feature {
  title: string;
  description: string;
}

interface InfoCardProps {
  icon: React.ReactElement<Record<string, unknown>>;
  title: string;
  description: string;
  features: Feature[];
  color?: 'blue' | 'purple' | 'orange' | 'green';
}

interface FieldInfoProps {
  title: string;
  description: string;
  examples?: string[];
}

type ColorClasses = {
  icon: string;
  bg: string;
  border: string;
  hover: string;
};

type ColorClassesMap = {
  [K in 'blue' | 'purple' | 'orange' | 'green']: ColorClasses;
};

// Info Modal Component for field explanations
function InfoModal({ isOpen, onClose, title, content }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <div className="text-sm text-gray-600 leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Info Card with toggles
function InfoCard({ icon, title, description, features, color = "blue" }: InfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const colorClasses: ColorClassesMap = {
    blue: {
      icon: "text-blue-500",
      bg: "bg-blue-50",
      border: "border-blue-200",
      hover: "hover:bg-blue-100"
    },
    purple: {
      icon: "text-purple-500", 
      bg: "bg-purple-50",
      border: "border-purple-200",
      hover: "hover:bg-purple-100"
    },
    orange: {
      icon: "text-orange-500",
      bg: "bg-orange-50", 
      border: "border-orange-200",
      hover: "hover:bg-orange-100"
    },
    green: {
      icon: "text-green-500",
      bg: "bg-green-50",
      border: "border-green-200", 
      hover: "hover:bg-green-100"
    }
  };

  const currentColorClasses = colorClasses[color];

  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${currentColorClasses.bg} rounded-xl flex items-center justify-center`}>
              {React.cloneElement(icon, { 
                className: `w-5 h-5 ${currentColorClasses.icon}`,
                ...icon.props 
              })}
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
              <CardDescription className="text-sm text-gray-600">{description}</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <HelpCircle className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className={`p-4 ${currentColorClasses.bg} ${currentColorClasses.border} border rounded-xl space-y-3`}>
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                {React.cloneElement(<CheckCircle />, { 
                  className: `w-4 h-4 ${currentColorClasses.icon} mt-0.5` 
                })}
                <div>
                  <p className="font-medium text-sm text-gray-900">{feature.title}</p>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Field Info Component
function FieldInfo({ title, description, examples = [] }: FieldInfoProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowInfo(true)}
        className="p-1 hover:bg-blue-50 rounded-full"
      >
        <Info className="w-3 h-3 text-blue-500" />
      </Button>
      
      <InfoModal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        title={title}
        content={
          <div className="space-y-3">
            <p>{description}</p>
            {examples.length > 0 && (
              <div>
                <p className="font-medium text-gray-900 mb-2">Examples:</p>
                <ul className="space-y-1">
                  {examples.map((example, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}

export default function EnhancedMintPage() {
  const [activeTab, setActiveTab] = useState("mint")
  const [mintedCredential, setMintedCredential] = useState<VerifiableCredential | null>(null)

  const handleCredentialMinted = (credential: VerifiableCredential) => {
    setMintedCredential(credential)
    setActiveTab("verify")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05] animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.02] animate-pulse delay-500" />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  W3C Verifiable Credentials Portal
                </h1>
                <p className="text-gray-600">
                  Issue, verify, and manage W3C-compliant verifiable credentials on Polkadot
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border-blue-200">
                <Shield className="w-3 h-3" />
                W3C Compliant
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5 border-gray-300">
                <Globe className="w-3 h-3" />
                Polkadot Network
              </Badge>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-600 font-mono">Live Network</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50 rounded-xl">
              <TabsTrigger 
                value="mint" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3"
              >
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Mint Credential</span>
                <span className="sm:hidden">Mint</span>
              </TabsTrigger>
              <TabsTrigger 
                value="verify" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Verify Credential</span>
                <span className="sm:hidden">Verify</span>
              </TabsTrigger>
              <TabsTrigger 
                value="manage" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Manage Credentials</span>
                <span className="sm:hidden">Manage</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Mint Credential Tab */}
          <TabsContent value="mint" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2">
                <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/25">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl text-gray-900">Create W3C Credential</CardTitle>
                          <CardDescription className="text-blue-600">Configure your verifiable credential parameters</CardDescription>
                        </div>
                      </div>
                      <FieldInfo
                        title="W3C Credential Creation"
                        description="This form creates a W3C-compliant verifiable credential that follows international standards for digital credentials. The credential will be cryptographically signed and stored on the blockchain for permanent verification."
                        examples={[
                          "Educational certificates and diplomas",
                          "Professional certifications and licenses", 
                          "Skill assessments and achievements",
                          "Identity and membership credentials"
                        ]}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <EnhancedMintCredentialForm onSuccess={handleCredentialMinted} />
                  </CardContent>
                </Card>
              </div>

              {/* Info Panel */}
              <div className="lg:col-span-1 space-y-6">
                <div className="sticky top-8 space-y-6">
                  <InfoCard
                    icon={<Shield />}
                    title="W3C Standards"
                    description="Compliance & Security Features"
                    color="blue"
                    features={[
                      {
                        title: "Cryptographic Proof",
                        description: "Ed25519 digital signatures ensure credential authenticity and prevent tampering"
                      },
                      {
                        title: "DID Integration", 
                        description: "Decentralized identifiers provide self-sovereign identity management"
                      },
                      {
                        title: "Expiration Support",
                        description: "Automatic status management with configurable expiration dates"
                      },
                      {
                        title: "Revocation Support",
                        description: "Complete credential lifecycle management with revocation capabilities"
                      }
                    ]}
                  />

                  <InfoCard
                    icon={<ExternalLink />}
                    title="External Verification"
                    description="API Integration Services"
                    color="purple"
                    features={[
                      {
                        title: "GitHub API Integration",
                        description: "Verify developer achievements and repository contributions automatically"
                      },
                      {
                        title: "LinkedIn API Integration",
                        description: "Validate professional certifications and employment history"
                      },
                      {
                        title: "Modular Service Layer",
                        description: "Extensible architecture supporting multiple verification providers"
                      },
                      {
                        title: "Event Logging",
                        description: "Complete audit trail of verification attempts and results"
                      }
                    ]}
                  />

                  <InfoCard
                    icon={<Clock />}
                    title="Network Status"
                    description="Polkadot Network Information"
                    color="green"
                    features={[
                      {
                        title: "Network: Polkadot",
                        description: "Enterprise-grade blockchain with high security and interoperability"
                      },
                      {
                        title: "Est. Fee: ~0.01 DOT", 
                        description: "Low-cost transactions for credential minting and verification"
                      },
                      {
                        title: "Confirmation: ~6 seconds",
                        description: "Fast finality ensures quick credential availability"
                      },
                      {
                        title: "Standards: W3C VC",
                        description: "Full compliance with W3C Verifiable Credentials specifications"
                      }
                    ]}
                  />

                  {/* Live Network Stats */}
                  <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold text-gray-900">Live Network Stats</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-3 bg-white rounded-xl border border-gray-200">
                          <Database className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                          <div className="font-mono text-lg font-bold text-gray-900">1,247</div>
                          <div className="text-xs text-gray-600">Credentials Minted</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-xl border border-gray-200">
                          <Key className="w-4 h-4 text-green-500 mx-auto mb-1" />
                          <div className="font-mono text-lg font-bold text-gray-900">98.7%</div>
                          <div className="text-xs text-gray-600">Verification Rate</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Verify Credential Tab */}
          <TabsContent value="verify" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="bg-white border border-gray-200 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-md shadow-green-500/25">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl text-gray-900">Verify Credential</CardTitle>
                          <CardDescription className="text-green-600">Validate authenticity and status</CardDescription>
                        </div>
                      </div>
                      <FieldInfo
                        title="Credential Verification"
                        description="Comprehensive verification process that checks digital signatures, issuer identity, expiration status, and revocation status against the blockchain and external APIs."
                        examples={[
                          "Cryptographic signature validation",
                          "Issuer DID resolution and verification",
                          "Expiration and revocation status checks",
                          "JSON-LD schema validation"
                        ]}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CredentialVerification 
                      credentialId={mintedCredential?.id} 
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <InfoCard
                    icon={<Shield />}
                    title="Verification Features"
                    description="Comprehensive Security Checks"
                    color="green"
                    features={[
                      {
                        title: "Cryptographic Verification",
                        description: "Validate Ed25519 signatures and proof integrity"
                      },
                      {
                        title: "DID Resolution",
                        description: "Resolve and verify issuer decentralized identifiers"
                      },
                      {
                        title: "Status Checking",
                        description: "Real-time expiration and revocation status validation"
                      },
                      {
                        title: "JSON-LD Validation",
                        description: "Schema validation against W3C standards"
                      }
                    ]}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Manage Credentials Tab */}
          <TabsContent value="manage" className="space-y-6">
            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md shadow-purple-500/25">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900">Credential Management</CardTitle>
                      <CardDescription className="text-purple-600">
                        Manage your issued and received credentials
                      </CardDescription>
                    </div>
                  </div>
                  <FieldInfo
                    title="Credential Management"
                    description="Centralized dashboard for managing all your credentials, including viewing issued credentials, managing received credentials, and handling revocation processes."
                    examples={[
                      "View all your issued credentials",
                      "Manage received credentials from others",
                      "Revoke credentials when necessary",
                      "Track credential usage and verification history"
                    ]}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Credential Management Dashboard
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    View, revoke, and manage your credentials. This comprehensive management interface will be available in the next update with advanced filtering and analytics.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button variant="outline" className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
                      <User className="w-4 h-4" />
                      My Credentials
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
                      <Calendar className="w-4 h-4" />
                      Issued Credentials
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
                      <Settings className="w-4 h-4" />
                      Settings
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