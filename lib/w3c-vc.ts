import { v4 as uuidv4 } from 'uuid'

// W3C Verifiable Credential types and interfaces
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

// DID Management
export class DIDManager {
  private static instance: DIDManager
  private didDocuments: Map<string, DIDDocument> = new Map()

  static getInstance(): DIDManager {
    if (!DIDManager.instance) {
      DIDManager.instance = new DIDManager()
    }
    return DIDManager.instance
  }

  generateDID(): string {
    // Generate a DID:Polkadot format identifier
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `did:polkadot:${timestamp}-${random}`
  }

  createDIDDocument(did: string, publicKey: string): DIDDocument {
    const verificationMethodId = `${did}#key-1`
    
    const didDocument: DIDDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1'
      ],
      id: did,
      verificationMethod: [
        {
          id: verificationMethodId,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: publicKey
        }
      ],
      authentication: [verificationMethodId],
      assertionMethod: [verificationMethodId]
    }

    this.didDocuments.set(did, didDocument)
    return didDocument
  }

  getDIDDocument(did: string): DIDDocument | null {
    return this.didDocuments.get(did) || null
  }

  resolveDID(did: string): Promise<DIDDocument | null> {
    return new Promise((resolve) => {
      // In a real implementation, this would resolve from a DID registry
      // For now, we'll use our local storage
      setTimeout(() => {
        resolve(this.getDIDDocument(did))
      }, 100)
    })
  }
}

// Credential Issuer
export class CredentialIssuer {
  private didManager: DIDManager

  constructor() {
    this.didManager = DIDManager.getInstance()
  }

  async issueSkillCredential(
    subjectDID: string,
    skillData: Omit<SkillCredentialSubject, 'id' | 'type'>,
    issuerDID: string,
    expirationDate?: string
  ): Promise<VerifiableCredential> {
    const credentialId = `credential:${uuidv4()}`
    const issuanceDate = new Date().toISOString()
    
    const credentialSubject: SkillCredentialSubject = {
      id: subjectDID,
      type: ['SkillCredential'],
      ...skillData
    }

    const credential: VerifiableCredential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/skill-passport/v1'
      ],
      id: credentialId,
      type: ['VerifiableCredential', 'SkillCredential'],
      issuer: issuerDID,
      issuanceDate,
      expirationDate,
      credentialSubject,
      credentialStatus: {
        id: `${credentialId}#status`,
        type: 'CredentialStatusList2021',
        status: 'valid'
      },
      proof: {
        type: 'Ed25519Signature2020',
        created: issuanceDate,
        verificationMethod: `${issuerDID}#key-1`,
        proofPurpose: 'assertionMethod',
        proofValue: await this.generateProof(credential, issuerDID)
      }
    }

    return credential
  }

  async issueExperienceCredential(
    subjectDID: string,
    experienceData: Omit<ExperienceCredentialSubject, 'id' | 'type'>,
    issuerDID: string,
    expirationDate?: string
  ): Promise<VerifiableCredential> {
    const credentialId = `credential:${uuidv4()}`
    const issuanceDate = new Date().toISOString()
    
    const credentialSubject: ExperienceCredentialSubject = {
      id: subjectDID,
      type: ['ExperienceCredential'],
      ...experienceData
    }

    const credential: VerifiableCredential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/skill-passport/v1'
      ],
      id: credentialId,
      type: ['VerifiableCredential', 'ExperienceCredential'],
      issuer: issuerDID,
      issuanceDate,
      expirationDate,
      credentialSubject,
      credentialStatus: {
        id: `${credentialId}#status`,
        type: 'CredentialStatusList2021',
        status: 'valid'
      },
      proof: {
        type: 'Ed25519Signature2020',
        created: issuanceDate,
        verificationMethod: `${issuerDID}#key-1`,
        proofPurpose: 'assertionMethod',
        proofValue: await this.generateProof(credential, issuerDID)
      }
    }

    return credential
  }

  private async generateProof(credential: VerifiableCredential, issuerDID: string): Promise<string> {
    // In a real implementation, this would generate a cryptographic signature
    // For now, we'll create a mock proof value
    const proofData = JSON.stringify({
      credential: credential.id,
      issuer: issuerDID,
      timestamp: credential.issuanceDate
    })
    
    // Mock signature generation
    const mockSignature = Buffer.from(proofData).toString('base64')
    return mockSignature
  }
}

// Credential Verifier
export class CredentialVerifier {
  private didManager: DIDManager

  constructor() {
    this.didManager = DIDManager.getInstance()
  }

  async verifyCredential(credential: VerifiableCredential): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Check credential structure
      if (!credential['@context'] || !credential.type || !credential.issuer) {
        errors.push('Invalid credential structure')
        return { isValid: false, errors, warnings }
      }

      // Check expiration
      if (credential.expirationDate) {
        const expirationDate = new Date(credential.expirationDate)
        if (expirationDate < new Date()) {
          errors.push('Credential has expired')
        }
      }

      // Check credential status
      if (credential.credentialStatus) {
        if (credential.credentialStatus.status === 'revoked') {
          errors.push('Credential has been revoked')
        } else if (credential.credentialStatus.status === 'expired') {
          errors.push('Credential status is expired')
        }
      }

      // Verify issuer DID
      const issuerDID = typeof credential.issuer === 'string' ? credential.issuer : credential.issuer.id
      const issuerDocument = await this.didManager.resolveDID(issuerDID)
      
      if (!issuerDocument) {
        errors.push('Issuer DID could not be resolved')
      } else {
        // Verify proof
        const proofValid = await this.verifyProof(credential, issuerDocument)
        if (!proofValid) {
          errors.push('Credential proof verification failed')
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      }
    } catch (error) {
      errors.push(`Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return { isValid: false, errors, warnings }
    }
  }

  private async verifyProof(credential: VerifiableCredential, issuerDocument: DIDDocument): Promise<boolean> {
    try {
      // In a real implementation, this would verify the cryptographic signature
      // For now, we'll do basic validation
      const proof = credential.proof
      
      if (!proof || !proof.verificationMethod || !proof.proofValue) {
        return false
      }

      // Check if verification method exists in issuer document
      const verificationMethodId = proof.verificationMethod
      const verificationMethod = issuerDocument.verificationMethod.find(
        vm => vm.id === verificationMethodId
      )

      if (!verificationMethod) {
        return false
      }

      // Mock proof verification - in real implementation, this would verify the signature
      return true
    } catch (error) {
      return false
    }
  }
}

// Credential Manager for CRUD operations
export class CredentialManager {
  private credentials: Map<string, VerifiableCredential> = new Map()
  private credentialStatuses: Map<string, 'valid' | 'expired' | 'revoked'> = new Map()

  async storeCredential(credential: VerifiableCredential): Promise<void> {
    this.credentials.set(credential.id, credential)
    this.credentialStatuses.set(credential.id, 'valid')
  }

  async getCredential(credentialId: string): Promise<VerifiableCredential | null> {
    return this.credentials.get(credentialId) || null
  }

  async getUserCredentials(userDID: string): Promise<VerifiableCredential[]> {
    const userCredentials: VerifiableCredential[] = []
    
    for (const credential of this.credentials.values()) {
      if (credential.credentialSubject.id === userDID) {
        userCredentials.push(credential)
      }
    }
    
    return userCredentials
  }

  async revokeCredential(credentialId: string): Promise<boolean> {
    const credential = this.credentials.get(credentialId)
    if (!credential) {
      return false
    }

    this.credentialStatuses.set(credentialId, 'revoked')
    
    // Update credential status
    if (credential.credentialStatus) {
      credential.credentialStatus.status = 'revoked'
    }

    return true
  }

  async getCredentialStatus(credentialId: string): Promise<'valid' | 'expired' | 'revoked' | null> {
    return this.credentialStatuses.get(credentialId) || null
  }

  async checkExpiredCredentials(): Promise<string[]> {
    const expiredCredentialIds: string[] = []
    const now = new Date()

    for (const [credentialId, credential] of this.credentials.entries()) {
      if (credential.expirationDate) {
        const expirationDate = new Date(credential.expirationDate)
        if (expirationDate < now && this.credentialStatuses.get(credentialId) === 'valid') {
          this.credentialStatuses.set(credentialId, 'expired')
          expiredCredentialIds.push(credentialId)
        }
      }
    }

    return expiredCredentialIds
  }
}

// Export singleton instances
export const didManager = DIDManager.getInstance()
export const credentialIssuer = new CredentialIssuer()
export const credentialVerifier = new CredentialVerifier()
export const credentialManager = new CredentialManager()
