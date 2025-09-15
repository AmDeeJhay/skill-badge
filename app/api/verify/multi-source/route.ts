import { NextRequest, NextResponse } from 'next/server'
import { verificationServiceManager } from '@/lib/external-integrations'

// POST /api/verify/multi-source - Verify skill with multiple sources
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      skillName, 
      githubUsername, 
      linkedinProfileId 
    } = body

    if (!skillName) {
      return NextResponse.json(
        { error: 'Skill name is required' },
        { status: 400 }
      )
    }

    if (!githubUsername && !linkedinProfileId) {
      return NextResponse.json(
        { error: 'At least one verification source (GitHub username or LinkedIn profile ID) is required' },
        { status: 400 }
      )
    }

    // Verify skill with multiple sources
    const verificationResults = await verificationServiceManager.verifySkillWithMultipleSources(
      githubUsername,
      linkedinProfileId,
      skillName
    )

    return NextResponse.json({
      success: true,
      skillName,
      verification: verificationResults,
      verifiedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error verifying skill with multiple sources:', error)
    return NextResponse.json(
      { error: 'Failed to verify skill' },
      { status: 500 }
    )
  }
}
