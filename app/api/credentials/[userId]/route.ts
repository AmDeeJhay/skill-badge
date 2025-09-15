import { NextRequest, NextResponse } from 'next/server'
import { credentialManager } from '@/lib/w3c-vc'

// GET /api/credentials/[userId] - Get all credentials for a user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get all credentials for the user
    const credentials = await credentialManager.getUserCredentials(userId)

    return NextResponse.json({
      success: true,
      credentials,
      count: credentials.length
    })

  } catch (error) {
    console.error('Error retrieving user credentials:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve credentials' },
      { status: 500 }
    )
  }
}
