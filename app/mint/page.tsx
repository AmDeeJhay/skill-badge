"use client"

import { useState } from "react"
import { CredentialPreview } from "@/components/credential-preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { addMintedCredential } from "@/lib/mock-data"
import { CheckCircle, ArrowLeft, ExternalLink, Share2, Award, Shield, Zap, Globe, Copy, TrendingUp, AlertTriangle, ArrowRight, X, Search, Calendar, Building, Code, GraduationCap, Briefcase, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Data for skills and organizations
const SKILL_CATEGORIES = [
  {
    category: "Programming & Development",
    skills: [
      "JavaScript Development", "Python Programming", "React Development", "Node.js Development",
      "Full Stack Development", "Mobile App Development", "Web Development", "Software Engineering",
      "Database Management", "DevOps", "Cloud Computing", "API Development"
    ]
  },
  {
    category: "Data & Analytics",
    skills: [
      "Data Science", "Machine Learning", "Data Analysis", "Business Intelligence",
      "SQL & Database Design", "Statistical Analysis", "Data Visualization", "Big Data Processing"
    ]
  },
  {
    category: "Design & Creative",
    skills: [
      "UI/UX Design", "Graphic Design", "Web Design", "Product Design",
      "Digital Marketing", "Content Creation", "Brand Design", "Video Editing"
    ]
  },
  {
    category: "Business & Management",
    skills: [
      "Project Management", "Digital Marketing", "Business Analysis", "Leadership",
      "Sales & Marketing", "Financial Analysis", "Strategic Planning", "Operations Management"
    ]
  },
  {
    category: "Cybersecurity",
    skills: [
      "Ethical Hacking", "Network Security", "Cybersecurity Analysis", "Penetration Testing",
      "Security Compliance", "Risk Assessment", "Incident Response", "Security Architecture"
    ]
  }
]

const ORGANIZATIONS = [
  {
    category: "Educational Platforms",
    organizations: [
      { name: "Coursera", hasAPI: true, type: "course_completion" },
      { name: "edX", hasAPI: true, type: "course_completion" },
      { name: "Udemy", hasAPI: true, type: "course_completion" },
      { name: "Khan Academy", hasAPI: false, type: "course_completion" },
      { name: "LinkedIn Learning", hasAPI: true, type: "course_completion" },
      { name: "Pluralsight", hasAPI: true, type: "skill_assessment" },
      { name: "Codecademy", hasAPI: true, type: "course_completion" },
      { name: "FreeCodeCamp", hasAPI: true, type: "certification" }
    ]
  },
  {
    category: "Professional Certifications",
    organizations: [
      { name: "Amazon Web Services (AWS)", hasAPI: true, type: "certification" },
      { name: "Microsoft", hasAPI: true, type: "certification" },
      { name: "Google Cloud Platform", hasAPI: true, type: "certification" },
      { name: "Cisco", hasAPI: false, type: "certification" },
      { name: "CompTIA", hasAPI: false, type: "certification" },
      { name: "Oracle", hasAPI: true, type: "certification" },
      { name: "Salesforce", hasAPI: true, type: "certification" },
      { name: "Adobe", hasAPI: true, type: "certification" }
    ]
  },
  {
    category: "Development Platforms",
    organizations: [
      { name: "GitHub", hasAPI: true, type: "achievement" },
      { name: "GitLab", hasAPI: true, type: "achievement" },
      { name: "Stack Overflow", hasAPI: true, type: "reputation" },
      { name: "HackerRank", hasAPI: true, type: "skill_assessment" },
      { name: "LeetCode", hasAPI: false, type: "skill_assessment" },
      { name: "Codewars", hasAPI: true, type: "skill_assessment" }
    ]
  },
  {
    category: "Universities & Institutions",
    organizations: [
      { name: "MIT", hasAPI: false, type: "degree" },
      { name: "Stanford University", hasAPI: false, type: "degree" },
      { name: "Harvard University", hasAPI: false, type: "degree" },
      { name: "University of California", hasAPI: false, type: "degree" },
      { name: "Carnegie Mellon University", hasAPI: false, type: "degree" }
    ]
  }
]

function GlowingCard({ children, className = "", glowColor = "blue" as const }) {
  const glowClasses = {
    blue: "shadow-blue-500/20 hover:shadow-blue-500/40 border-blue-500/20 hover:border-blue-500/40",
    green: "shadow-green-500/20 hover:shadow-green-500/40 border-green-500/20 hover:border-green-500/40",
    indigo: "shadow-indigo-500/20 hover:shadow-indigo-500/40 border-indigo-500/20 hover:border-indigo-500/40",
    orange: "shadow-orange-500/20 hover:shadow-orange-500/40 border-orange-500/20 hover:border-orange-500/40"
  }
  return (
    <Card className={`bg-gray-900 text-white border-1 shadow-lg transition-all duration-300 hover:shadow-xl ${glowClasses[glowColor]} ${className}`}>
      {children}
    </Card>
  )
}

// Custom Select Component with Search
function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  allowCustom = false,
  onCustomValue = null,
  icon = null
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [customValue, setCustomValue] = useState("")

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (option) => {
    onChange(option)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleCustomSubmit = () => {
    if (customValue.trim() && onCustomValue) {
      onCustomValue(customValue.trim())
      setCustomValue("")
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <div 
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200 cursor-pointer flex items-center gap-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon && <div className="text-gray-400">{icon}</div>}
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value || placeholder}
        </span>
        <Search className="w-4 h-4 text-gray-400 ml-auto" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
          </div>
          
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))}
            
            {filteredOptions.length === 0 && !allowCustom && (
              <div className="px-4 py-2 text-sm text-gray-500">No options found</div>
            )}
          </div>

          {allowCustom && (
            <div className="border-t border-gray-100 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter custom value..."
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <Button 
                  size="sm" 
                  onClick={handleCustomSubmit}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs"
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Organization Select Component
function OrganizationSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [customValue, setCustomValue] = useState("")

  const allOrganizations = ORGANIZATIONS.flatMap(category => 
    category.organizations.map(org => ({
      ...org,
      category: category.category
    }))
  )

  const filteredOrganizations = allOrganizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (org) => {
    onChange(org)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange({
        name: customValue.trim(),
        hasAPI: false,
        type: "manual",
        category: "Custom"
      })
      setCustomValue("")
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <div 
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200 cursor-pointer flex items-center gap-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Building className="w-4 h-4 text-gray-400" />
        <div className="flex-1">
          <span className={value ? "text-gray-900" : "text-gray-500"}>
            {value?.name || "Select organization"}
          </span>
          {value?.hasAPI && (
            <div className="flex items-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span className="text-xs text-green-600">API Integration Available</span>
            </div>
          )}
        </div>
        <Search className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {ORGANIZATIONS.map((category) => {
              const categoryOrgs = category.organizations.filter(org => 
                org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.category.toLowerCase().includes(searchTerm.toLowerCase())
              )
              
              if (categoryOrgs.length === 0) return null
              
              return (
                <div key={category.category}>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {category.category}
                  </div>
                  {categoryOrgs.map((org, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                      onClick={() => handleSelect(org)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 hover:text-blue-600">{org.name}</span>
                        {org.hasAPI && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                            <span className="text-xs text-green-600">API</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

          <div className="border-t border-gray-100 p-3">
            <div className="text-xs text-gray-500 mb-2">Not listed? Add custom organization:</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter organization name"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="flex-1 px-3 py-2 text-gray-700 bg-gray-20 border-1 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <Button 
                size="sm" 
                onClick={handleCustomSubmit}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Important Notice Modal Component
function ImportantNoticeModal({ isOpen, onClose, onAgree }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/25">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Important Notice</h2>
            <p className="text-gray-600">Please read carefully before proceeding</p>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Permanent Blockchain Record</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Once minted, credentials cannot be modified or deleted</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>They become a permanent part of your skill passport on the blockchain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Network fees are non-refundable (~0.01 DOT)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Ensure all information is accurate before confirming</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={onAgree}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 font-semibold shadow-lg"
            >
              I Understand & Agree
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Success Modal Component
function SuccessModal({ isOpen, onClose, onViewCredential }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/25 animate-pulse">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">Credential Minted Successfully!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your skill credential has been created and verified on the Polkadot blockchain. It's now part of your permanent digital identity.
          </p>

          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-green-600 font-mono">Transaction Confirmed</span>
          </div>

          <Button 
            onClick={onViewCredential}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 font-semibold shadow-lg"
          >
            View My Credential
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MintPage() {
  const [formData, setFormData] = useState({
    skillName: "",
    issuerOrganization: null,
    skillLevel: "",
    issueDate: "",
    expiryDate: "",
    description: "",
    evidenceUrl: "",
    credentialType: ""
  })
  
  const [mintedCredential, setMintedCredential] = useState(null)
  const [showNoticeModal, setShowNoticeModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Get all skills for the selector
  const allSkills = SKILL_CATEGORIES.flatMap(category => category.skills)

  const handleMintAttempt = () => {
    // Basic validation
    if (!formData.skillName || !formData.issuerOrganization) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the skill name and issuing organization",
        variant: "destructive"
      })
      return
    }
    setShowNoticeModal(true)
  }

  const handleNoticeAgree = async () => {
    setShowNoticeModal(false)
    
    // API Integration for supported organizations
    if (formData.issuerOrganization?.hasAPI) {
      try {
        // This is where backend engineers will integrate with various APIs
        const apiEndpoint = getAPIEndpoint(formData.issuerOrganization.name)
        const verificationData = await verifyCredentialWithAPI({
          organization: formData.issuerOrganization.name,
          skillName: formData.skillName,
          evidenceUrl: formData.evidenceUrl,
          // Add other relevant data for API verification
        })
        
        if (!verificationData.isValid) {
          toast({
            title: "Verification Failed",
            description: "Could not verify credential with the issuing organization",
            variant: "destructive"
          })
          return
        }
      } catch (error) {
        console.error('API verification failed:', error)
        // Continue with manual verification
      }
    }
    
    // Simulate minting process
    setTimeout(() => {
      const credentialId = "CRED_" + Math.random().toString(36).substr(2, 9)
      const transactionHash = "0x" + Math.random().toString(16).substr(2, 64)
      
      // Add to mock data storage
      const newCredential = addMintedCredential({
        skillName: formData.skillName,
        issuerName: formData.issuerOrganization?.name || "Unknown Issuer",
        issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
        description: formData.description,
        badgeColor: `bg-${['blue', 'purple', 'green', 'pink', 'orange', 'cyan'][Math.floor(Math.random() * 6)]}-500`,
        verified: formData.issuerOrganization?.hasAPI || false,
        transactionHash
      })
      
      const mockCredential = {
        credentialId,
        transactionHash
      }
      setMintedCredential(mockCredential)
      setShowSuccessModal(true)
    }, 1000)
  }

  // Helper function for API endpoint mapping (for backend integration)
  const getAPIEndpoint = (organizationName) => {
    const apiEndpoints = {
      "GitHub": "/api/verify/github",
      "Coursera": "/api/verify/coursera", 
      "Udemy": "/api/verify/udemy",
      "Amazon Web Services (AWS)": "/api/verify/aws",
      "Microsoft": "/api/verify/microsoft",
      "Google Cloud Platform": "/api/verify/gcp",
      // Add more as needed
    }
    return apiEndpoints[organizationName] || "/api/verify/manual"
  }

  // Helper function for API verification (for backend integration)
  const verifyCredentialWithAPI = async (data) => {
    // This function will be implemented by backend engineers
    // It should return { isValid: boolean, verificationData: object }
    return new Promise((resolve) => {
      // Simulate API call
      setTimeout(() => {
        resolve({ isValid: true, verificationData: {} })
      }, 500)
    })
  }

  const handleSuccessViewCredential = () => {
    setShowSuccessModal(false)
    router.push(`/credential/${mintedCredential?.credentialId}`)
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
    setFormData({
      skillName: "",
      issuerOrganization: null,
      skillLevel: "",
      issueDate: "",
      expiryDate: "",
      description: "",
      evidenceUrl: "",
      credentialType: ""
    })
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05] animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.02] animate-pulse delay-500" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {!mintedCredential ? (
          <>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-blue-500 mb-0">Mint Credential</h1>
                  <p className="text-gray-700 text-sm">Create a verified skill credential on the Polkadot blockchain</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-900 font-mono">Minting Portal</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Credential Form */}
              <div className="lg:col-span-2">
                <GlowingCard glowColor="blue" className="shadow-md bg-white">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-black text-2xl">Create Your Credential</CardTitle>
                        <CardDescription className="text-blue-600 text-base">Enter your skill information below</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-8">
                      {/* Skill Selection */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            Skill Name *
                          </label>
                          <SearchableSelect
                            options={allSkills}
                            value={formData.skillName}
                            onChange={(value) => updateFormData("skillName", value)}
                            placeholder="Select or type your skill"
                            allowCustom={true}
                            onCustomValue={(value) => updateFormData("skillName", value)}
                            icon={<Code className="w-4 h-4" />}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Issuing Organization *
                          </label>
                          <OrganizationSelect
                            value={formData.issuerOrganization}
                            onChange={(value) => updateFormData("issuerOrganization", value)}
                          />
                          {formData.issuerOrganization?.hasAPI && (
                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span className="text-xs font-medium text-green-700">API Integration Available</span>
                              </div>
                              <p className="text-xs text-green-600">
                                We can automatically verify your credential from {formData.issuerOrganization.name}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Skill Level and Dates */}
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Skill Level</label>
                          <select 
                            value={formData.skillLevel}
                            onChange={(e) => updateFormData("skillLevel", e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                          >
                            <option value="">Select level</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Issue Date
                          </label>
                          <input
                            type="date"
                            value={formData.issueDate}
                            onChange={(e) => updateFormData("issueDate", e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) => updateFormData("expiryDate", e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => updateFormData("description", e.target.value)}
                          placeholder="Describe your skill achievement..."
                          rows={3}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 resize-none"
                        />
                      </div>

                      {/* Evidence URL */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          Evidence URL
                        </label>
                        <input
                          type="url"
                          value={formData.evidenceUrl}
                          onChange={(e) => updateFormData("evidenceUrl", e.target.value)}
                          placeholder="https://certificate-url.com or portfolio link"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                        />
                      </div>

                      {/* API Integration Notice */}
                      {formData.issuerOrganization?.hasAPI && (
                        <Alert className="border-blue-200 bg-blue-50">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-700">
                            <strong>Auto-Verification Available:</strong> We'll automatically verify this credential with {formData.issuerOrganization.name} during minting.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Mint Button */}
                      <div className="pt-6">
                        <Button 
                          onClick={handleMintAttempt}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                          size="lg"
                        >
                          <Award className="w-5 h-5 mr-2" />
                          Mint Credential (~0.01 DOT)
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </GlowingCard>
              </div>

              {/* Right Column - Preview */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <GlowingCard glowColor="indigo" className="shadow-md bg-white">
                    <CardHeader>
                      <CardTitle className="text-black text-xl flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-500" />
                        Live Preview
                      </CardTitle>
                      <CardDescription className="text-indigo-600">See how your credential will look</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CredentialPreview 
                        skillName={formData.skillName || "Your Skill"}
                        issuer={formData.issuerOrganization?.name || "Issuing Organization"}
                        level={formData.skillLevel}
                        issueDate={formData.issueDate || new Date().toISOString().split('T')[0]}
                        description={formData.description || "Skill description will appear here..."}
                      />
                    </CardContent>
                  </GlowingCard>

                  {/* Network Info */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm font-semibold text-gray-700">Network Status</span>
                    </div>
                    <div className="space-y-2 text-xs text-gray-600">
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/25">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Credential Minted Successfully!</h1>
              <p className="text-gray-600 mb-6">Your skill credential is now live on the Polkadot blockchain</p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Credential
                </Button>
                <Button onClick={handleViewTransaction} variant="outline" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View Transaction
                </Button>
                <Button onClick={handleReset} className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Create Another
                </Button>
              </div>
            </div>

            <GlowingCard glowColor="blue" className="shadow-xl bg-white">
              <CardContent className="p-8">
                <CredentialPreview 
                  skillName={formData.skillName}
                  issuer={formData.issuerOrganization?.name}
                  level={formData.skillLevel}
                  issueDate={formData.issueDate}
                  description={formData.description}
                  credentialId={mintedCredential.credentialId}
                  transactionHash={mintedCredential.transactionHash}
                  isVerified={true}
                  onShare={handleShare}
                  onViewTransaction={handleViewTransaction}
                />
              </CardContent>
            </GlowingCard>
          </div>
        )}
      </div>

      {/* Modals */}
      <ImportantNoticeModal 
        isOpen={showNoticeModal}
        onClose={() => setShowNoticeModal(false)}
        onAgree={handleNoticeAgree}
      />
      
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onViewCredential={handleSuccessViewCredential}
      />
    </div>
  )
}