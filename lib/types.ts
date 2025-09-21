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
  signer: Record<string, unknown>
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
  publicKeyJwk?: Record<string, unknown>
}

export interface CredentialSubject {
  id: string
  type: string[]
  [key: string]: unknown
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


export interface VerificationResult {
  isValid: boolean
  confidence: number
  evidence: Record<string, unknown>
  errors: string[]
  warnings: string[]
}