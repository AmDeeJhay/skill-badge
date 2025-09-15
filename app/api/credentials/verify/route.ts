import { NextRequest, NextResponse } from 'next/server'
import { credentialVerifier } from '@/lib/w3c-vc'

// POST /api/credentials/verify - Verify a credential
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { credential } = body

    if (!credential) {
      return NextResponse.json(
        { error: 'Credential data is required' },
        { status: 400 }
      )
    }

    // Verify the credential
    const verificationResult = await credentialVerifier.verifyCredential(credential)

    return NextResponse.json({
      success: true,
      isValid: verificationResult.isValid,
      errors: verificationResult.errors,
      warnings: verificationResult.warnings,
      verificationDate: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error verifying credential:', error)
    return NextResponse.json(
      { error: 'Failed to verify credential' },
      { status: 500 }
    )
  }
}
