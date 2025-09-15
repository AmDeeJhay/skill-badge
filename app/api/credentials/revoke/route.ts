import { NextRequest, NextResponse } from 'next/server'
import { credentialManager } from '@/lib/w3c-vc'

// POST /api/credentials/revoke - Revoke a credential
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { credentialId } = body

    if (!credentialId) {
      return NextResponse.json(
        { error: 'Credential ID is required' },
        { status: 400 }
      )
    }

    // Revoke the credential
    const success = await credentialManager.revokeCredential(credentialId)

    if (!success) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Credential revoked successfully',
      credentialId,
      revokedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error revoking credential:', error)
    return NextResponse.json(
      { error: 'Failed to revoke credential' },
      { status: 500 }
    )
  }
}
