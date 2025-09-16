import { NextRequest, NextResponse } from 'next/server'
import { 
  credentialIssuer, 
  // credentialVerifier, 
  credentialManager, 
  didManager,
  type VerifiableCredential,
  type SkillCredentialSubject,
  type ExperienceCredentialSubject
} from '@/lib/w3c-vc'

// POST /api/credentials/issue - Issue a new credential
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      credentialType, 
      subjectDID, 
      issuerDID, 
      credentialData, 
      expirationDate 
    } = body

    // Validate required fields
    if (!credentialType || !subjectDID || !issuerDID || !credentialData) {
      return NextResponse.json(
        { error: 'Missing required fields: credentialType, subjectDID, issuerDID, credentialData' },
        { status: 400 }
      )
    }

    // Verify issuer DID exists
    const issuerDocument = await didManager.resolveDID(issuerDID)
    if (!issuerDocument) {
      return NextResponse.json(
        { error: 'Issuer DID not found' },
        { status: 404 }
      )
    }

    let credential: VerifiableCredential

    // Issue credential based on type
    switch (credentialType) {
      case 'SkillCredential':
        credential = await credentialIssuer.issueSkillCredential(
          subjectDID,
          credentialData as Omit<SkillCredentialSubject, 'id' | 'type'>,
          issuerDID,
          expirationDate
        )
        break
      
      case 'ExperienceCredential':
        credential = await credentialIssuer.issueExperienceCredential(
          subjectDID,
          credentialData as Omit<ExperienceCredentialSubject, 'id' | 'type'>,
          issuerDID,
          expirationDate
        )
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid credential type. Supported types: SkillCredential, ExperienceCredential' },
          { status: 400 }
        )
    }

    // Store credential
    await credentialManager.storeCredential(credential)

    return NextResponse.json({
      success: true,
      credential,
      credentialId: credential.id
    })

  } catch (error) {
    console.error('Error issuing credential:', error)
    return NextResponse.json(
      { error: 'Failed to issue credential' },
      { status: 500 }
    )
  }
}
