import { NextRequest, NextResponse } from 'next/server'
import { credentialManager } from '@/lib/w3c-vc'

// GET /api/credentials/status/[id] - Get credential status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Credential ID is required' },
        { status: 400 }
      )
    }

    // Get credential status
    const status = await credentialManager.getCredentialStatus(id)

    if (status === null) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      credentialId: id,
      status,
      checkedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error checking credential status:', error)
    return NextResponse.json(
      { error: 'Failed to check credential status' },
      { status: 500 }
    )
  }
}
