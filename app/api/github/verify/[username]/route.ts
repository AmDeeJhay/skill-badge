import { NextRequest, NextResponse } from 'next/server'
import { verificationServiceManager } from '@/lib/external-integrations'

// GET /api/github/verify/[username] - Verify GitHub user skills
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params
    const { searchParams } = new URL(request.url)
    const skillName = searchParams.get('skill')

    if (!username) {
      return NextResponse.json(
        { error: 'GitHub username is required' },
        { status: 400 }
      )
    }

    if (!skillName) {
      return NextResponse.json(
        { error: 'Skill name parameter is required' },
        { status: 400 }
      )
    }

    // Verify skill with GitHub
    const verificationResult = await verificationServiceManager.verifySkillWithGitHub(
      username,
      skillName
    )

    return NextResponse.json({
      success: true,
      username,
      skillName,
      verification: verificationResult,
      verifiedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error verifying GitHub user:', error)
    return NextResponse.json(
      { error: 'Failed to verify GitHub user' },
      { status: 500 }
    )
  }
}
