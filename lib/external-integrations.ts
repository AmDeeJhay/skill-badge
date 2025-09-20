import axios from 'axios'

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

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description?: string
  language?: string
  languages_url: string
  stargazers_count: number
  forks_count: number
  created_at: string
  updated_at: string
  pushed_at: string
  owner: {
    login: string
    id: number
    avatar_url: string
    html_url: string
  }
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  html_url: string
}

export interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  headline?: string
  summary?: string
  skills?: string[]
  experience?: LinkedInExperience[]
}

export interface LinkedInExperience {
  id: string
  title: string
  companyName: string
  description?: string
  startDate: string
  endDate?: string
  skills?: string[]
}

export interface VerificationResult {
  isValid: boolean
  confidence: number
  evidence: Record<string, unknown>
  errors: string[]
  warnings: string[]
}

export interface SkillEvidence {
  repositoriesWithSkill: GitHubRepository[]
  totalCommits: number
  languagesUsed: Set<string>
  skillMentions: number
}

// GitHub API Integration
export class GitHubIntegration {
  private baseURL = 'https://api.github.com'
  private token?: string

  constructor(token?: string) {
    this.token = token
  }

  async getUserProfile(username: string): Promise<GitHubUser> {
    try {
      const response = await axios.get(`${this.baseURL}/users/${username}`, {
        headers: this.token ? { Authorization: `token ${this.token}` } : {}
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch GitHub profile: ${error}`)
    }
  }

  async getUserRepositories(username: string): Promise<GitHubRepository[]> {
    try {
      const response = await axios.get(`${this.baseURL}/users/${username}/repos`, {
        headers: this.token ? { Authorization: `token ${this.token}` } : {},
        params: {
          sort: 'updated',
          per_page: 100
        }
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch repositories: ${error}`)
    }
  }

  async getRepositoryLanguages(username: string, repoName: string): Promise<Record<string, number>> {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${username}/${repoName}/languages`, {
        headers: this.token ? { Authorization: `token ${this.token}` } : {}
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch repository languages: ${error}`)
    }
  }

  async getUserCommits(username: string, repoName: string): Promise<GitHubCommit[]> {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${username}/${repoName}/commits`, {
        headers: this.token ? { Authorization: `token ${this.token}` } : {},
        params: {
          author: username,
          per_page: 100
        }
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch commits: ${error}`)
    }
  }

  async verifySkill(username: string, skillName: string): Promise<VerificationResult> {
    try {
      const errors: string[] = []
      const warnings: string[] = []
      let confidence = 0
      const evidence: Record<string, unknown> = {}

      // Get user profile
      const profile = await this.getUserProfile(username)
      evidence.profile = profile

      // Get user repositories
      const repositories = await this.getUserRepositories(username)
      evidence.repositories = repositories

      // Analyze repositories for skill evidence
      const skillEvidence = await this.analyzeSkillInRepositories(repositories, skillName)
      evidence.skillAnalysis = skillEvidence

      // Calculate confidence based on evidence
      confidence = this.calculateSkillConfidence(skillEvidence, repositories.length)

      // Determine if skill is verified
      const isValid = confidence >= 0.6 // 60% confidence threshold

      if (confidence < 0.3) {
        errors.push('Insufficient evidence for skill verification')
      } else if (confidence < 0.6) {
        warnings.push('Low confidence in skill verification')
      }

      return {
        isValid,
        confidence,
        evidence,
        errors,
        warnings
      }
    } catch (error) {
      return {
        isValid: false,
        confidence: 0,
        evidence: {},
        errors: [`GitHub verification failed: ${error}`],
        warnings: []
      }
    }
  }

  private async analyzeSkillInRepositories(
    repositories: GitHubRepository[], 
    skillName: string
  ): Promise<SkillEvidence> {
    const skillEvidence: SkillEvidence = {
      repositoriesWithSkill: [],
      totalCommits: 0,
      languagesUsed: new Set<string>(),
      skillMentions: 0
    }

    for (const repo of repositories) {
      try {
        // Check repository description and name for skill mentions
        const repoText = `${repo.name} ${repo.description || ''}`.toLowerCase()
        if (repoText.includes(skillName.toLowerCase())) {
          skillEvidence.repositoriesWithSkill.push(repo)
          skillEvidence.skillMentions++
        }

        // Get languages used in repository
        const languages = await this.getRepositoryLanguages(repo.owner.login, repo.name)
        Object.keys(languages).forEach(lang => skillEvidence.languagesUsed.add(lang))

        // Get commits for this repository
        const commits = await this.getUserCommits(repo.owner.login, repo.name)
        skillEvidence.totalCommits += commits.length
      } catch (error) {
        console.warn(`Error analyzing repository ${repo.name}:`, error)
      }
    }

    return skillEvidence
  }

  private calculateSkillConfidence(skillEvidence: SkillEvidence, totalRepos: number): number {
    let confidence = 0

    // Repository evidence (40% weight)
    const repoScore = Math.min(skillEvidence.repositoriesWithSkill.length / totalRepos, 1)
    confidence += repoScore * 0.4

    // Commit activity (30% weight)
    const commitScore = Math.min(skillEvidence.totalCommits / 100, 1) // Normalize to 100 commits
    confidence += commitScore * 0.3

    // Skill mentions (20% weight)
    const mentionScore = Math.min(skillEvidence.skillMentions / 5, 1) // Normalize to 5 mentions
    confidence += mentionScore * 0.2

    // Language diversity (10% weight)
    const languageScore = Math.min(skillEvidence.languagesUsed.size / 10, 1) // Normalize to 10 languages
    confidence += languageScore * 0.1

    return Math.min(confidence, 1)
  }
}

// LinkedIn API Integration (Mock implementation)
export class LinkedInIntegration {
  private token?: string

  constructor(token?: string) {
    this.token = token
  }

  async verifySkill(profileId: string, skillName: string): Promise<VerificationResult> {
    try {
      // In a real implementation, this would use LinkedIn's API
      // For now, we'll return a mock response
      
      const errors: string[] = []
      const warnings: string[] = []
      
      if (!this.token) {
        errors.push('LinkedIn API token required for verification')
        return {
          isValid: false,
          confidence: 0,
          evidence: {},
          errors,
          warnings
        }
      }

      // Mock verification logic
      const mockEvidence = {
        profileId,
        skillName,
        verifiedAt: new Date().toISOString(),
        source: 'linkedin'
      }

      return {
        isValid: true,
        confidence: 0.8,
        evidence: mockEvidence,
        errors,
        warnings
      }
    } catch (error) {
      return {
        isValid: false,
        confidence: 0,
        evidence: {},
        errors: [`LinkedIn verification failed: ${error}`],
        warnings: []
      }
    }
  }
}

// Verification Service Manager
export class VerificationServiceManager {
  private githubIntegration: GitHubIntegration
  private linkedinIntegration: LinkedInIntegration
  private verificationLog: Array<{
    id: string
    service: string
    userId: string
    skillName: string
    result: VerificationResult
    timestamp: string
  }> = []

  constructor(githubToken?: string, linkedinToken?: string) {
    this.githubIntegration = new GitHubIntegration(githubToken)
    this.linkedinIntegration = new LinkedInIntegration(linkedinToken)
  }

  async verifySkillWithGitHub(username: string, skillName: string): Promise<VerificationResult> {
    const result = await this.githubIntegration.verifySkill(username, skillName)
    
    // Log verification attempt
    this.logVerification('github', username, skillName, result)
    
    return result
  }

  async verifySkillWithLinkedIn(profileId: string, skillName: string): Promise<VerificationResult> {
    const result = await this.linkedinIntegration.verifySkill(profileId, skillName)
    
    // Log verification attempt
    this.logVerification('linkedin', profileId, skillName, result)
    
    return result
  }

  async verifySkillWithMultipleSources(
    skillName: string,
    githubUsername?: string,
    linkedinProfileId?: string
  ): Promise<{
    github?: VerificationResult
    linkedin?: VerificationResult
    combined: VerificationResult
  }> {
    const results: {
      github?: VerificationResult
      linkedin?: VerificationResult
      combined?: VerificationResult
    } = {}
    const allErrors: string[] = []
    const allWarnings: string[] = []

    // Verify with GitHub if username provided
    if (githubUsername) {
      try {
        const githubResult = await this.verifySkillWithGitHub(githubUsername, skillName)
        results.github = githubResult
        allErrors.push(...githubResult.errors)
        allWarnings.push(...githubResult.warnings)
      } catch (error) {
        allErrors.push(`GitHub verification failed: ${error}`)
      }
    }

    // Verify with LinkedIn if profile ID provided
    if (linkedinProfileId) {
      try {
        const linkedinResult = await this.verifySkillWithLinkedIn(linkedinProfileId, skillName)
        results.linkedin = linkedinResult
        allErrors.push(...linkedinResult.errors)
        allWarnings.push(...linkedinResult.warnings)
      } catch (error) {
        allErrors.push(`LinkedIn verification failed: ${error}`)
      }
    }

    // Calculate combined confidence
    const verificationResults = [results.github, results.linkedin].filter(
      (result): result is VerificationResult => result !== undefined
    )
    
    const combinedConfidence = verificationResults.length > 0 
      ? verificationResults.reduce((sum, result) => sum + result.confidence, 0) / verificationResults.length
      : 0

    results.combined = {
      isValid: combinedConfidence >= 0.6,
      confidence: combinedConfidence,
      evidence: results,
      errors: allErrors,
      warnings: allWarnings
    }

    return {
      github: results.github,
      linkedin: results.linkedin,
      combined: results.combined!
    }
  }

  private logVerification(
    service: string,
    userId: string,
    skillName: string,
    result: VerificationResult
  ): void {
    const logEntry = {
      id: `verification_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      service,
      userId,
      skillName,
      result,
      timestamp: new Date().toISOString()
    }

    this.verificationLog.push(logEntry)
    
    // In a real implementation, this would be stored in a database
    console.log('Verification logged:', logEntry)
  }

  getVerificationLog(): Array<Record<string, unknown>> {
    return [...this.verificationLog]
  }

  getVerificationLogForUser(userId: string): Array<Record<string, unknown>> {
    return this.verificationLog.filter(log => log.userId === userId)
  }
}

// Export singleton instance
export const verificationServiceManager = new VerificationServiceManager()