export interface InjectedAccountWithMeta {
  address: string
  meta: {
    genesisHash?: string | null
    name?: string
    source: string
  }
  type?: string
}

export interface InjectedExtension {
  name: string
  version: string
  accounts: {
    get: () => Promise<InjectedAccountWithMeta[]>
  }
  signer: any
}

export interface WalletState {
  isConnected: boolean
  isConnecting: boolean
  accounts: InjectedAccountWithMeta[]
  selectedAccount: InjectedAccountWithMeta | null
  extension: InjectedExtension | null
  error: string | null
}

// W3C Verifiable Credential Types
export interface DIDDocument {
  '@context': string[]
  id: string
  verificationMethod: VerificationMethod[]
  authentication: string[]
  assertionMethod: string[]
}

export interface VerificationMethod {
  id: string
  type: string
  controller: string
  publicKeyMultibase?: string
  publicKeyJwk?: any
}

export interface CredentialSubject {
  id: string
  type: string[]
  [key: string]: any
}

export interface VerifiableCredential {
  '@context': string[]
  id: string
  type: string[]
  issuer: string | DIDDocument
  issuanceDate: string
  expirationDate?: string
  credentialSubject: CredentialSubject
  credentialStatus?: {
    id: string
    type: string
    status: 'valid' | 'expired' | 'revoked'
  }
  proof: {
    type: string
    created: string
    verificationMethod: string
    proofPurpose: string
    proofValue: string
  }
}

export interface SkillCredentialSubject extends CredentialSubject {
  skillName: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  verifierDID: string
  evidenceUrl?: string
  description?: string
}

export interface ExperienceCredentialSubject extends CredentialSubject {
  projectTitle: string
  projectDescription: string
  verifierDID: string
  startDate: string
  endDate?: string
  technologies?: string[]
  evidenceUrl?: string
}

// External API Integration Types
export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
  name?: string
  bio?: string
  public_repos: number
  followers: number
  following: number
  created_at: string
}

export interface VerificationResult {
  isValid: boolean
  confidence: number
  evidence: any
  errors: string[]
  warnings: string[]
}