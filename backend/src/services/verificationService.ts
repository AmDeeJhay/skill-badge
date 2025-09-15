// Verification service
import { prisma } from '@/models/prisma';
import { VerificationLog, VerificationStatus, VerifyCredentialRequest, VerificationResult } from '@/types';
import { logger } from '@/utils/logger';
import { CustomError } from '@/middleware/errorHandler';
import axios from 'axios';
import { config } from '@/config';

export class VerificationService {
  async verifyCredential(verificationData: VerifyCredentialRequest, userId: string): Promise<VerificationResult> {
    try {
      const { credentialId, externalVerification } = verificationData;

      // Get credential
      const credential = await prisma.credential.findUnique({
        where: { id: credentialId },
        include: { user: true }
      });

      if (!credential) {
        throw new CustomError('Credential not found', 404);
      }

      // Verify credential internally
      const internalVerification = await this.verifyCredentialInternally(credential);

      let externalVerificationResult: VerificationResult | null = null;

      // Perform external verification if requested
      if (externalVerification) {
        externalVerificationResult = await this.performExternalVerification(
          credential.skill,
          externalVerification,
          userId,
          credentialId
        );
      }

      // Combine results
      const combinedResult: VerificationResult = {
        isValid: internalVerification.isValid && (!externalVerificationResult || externalVerificationResult.isValid),
        confidence: externalVerificationResult?.confidence || (internalVerification.isValid ? 1.0 : 0.0),
        evidence: {
          internal: internalVerification,
          external: externalVerificationResult,
        },
        errors: [...internalVerification.errors, ...(externalVerificationResult?.errors || [])],
        warnings: [...internalVerification.warnings, ...(externalVerificationResult?.warnings || [])],
      };

      // Log verification attempt
      await this.logVerification(
        userId,
        credentialId,
        'combined',
        credential.skill,
        combinedResult,
        VerificationStatus.SUCCESS
      );

      return combinedResult;
    } catch (error) {
      logger.error('Error verifying credential:', error);
      
      // Log failed verification
      await this.logVerification(
        userId,
        verificationData.credentialId,
        'combined',
        'unknown',
        { isValid: false, confidence: 0, evidence: {}, errors: [error.message], warnings: [] },
        VerificationStatus.ERROR
      );

      throw new CustomError('Failed to verify credential', 500);
    }
  }

  async verifyGitHubSkill(username: string, skill: string): Promise<VerificationResult> {
    try {
      const result = await this.performGitHubVerification(username, skill);
      
      // Log verification
      await this.logVerification(
        'system',
        null,
        'github',
        skill,
        result,
        result.isValid ? VerificationStatus.SUCCESS : VerificationStatus.FAILED
      );

      return result;
    } catch (error) {
      logger.error('Error verifying GitHub skill:', error);
      throw new CustomError('Failed to verify GitHub skill', 500);
    }
  }

  async verifyMultiSource(
    skillName: string,
    githubUsername?: string,
    linkedinProfileId?: string,
    userId?: string
  ): Promise<any> {
    try {
      const results: any = {};
      const allErrors: string[] = [];
      const allWarnings: string[] = [];

      // Verify with GitHub if username provided
      if (githubUsername) {
        try {
          results.github = await this.performGitHubVerification(githubUsername, skillName);
          allErrors.push(...results.github.errors);
          allWarnings.push(...results.github.warnings);
        } catch (error) {
          allErrors.push(`GitHub verification failed: ${error.message}`);
        }
      }

      // Verify with LinkedIn if profile ID provided
      if (linkedinProfileId) {
        try {
          results.linkedin = await this.performLinkedInVerification(linkedinProfileId, skillName);
          allErrors.push(...results.linkedin.errors);
          allWarnings.push(...results.linkedin.warnings);
        } catch (error) {
          allErrors.push(`LinkedIn verification failed: ${error.message}`);
        }
      }

      // Calculate combined confidence
      const confidences = Object.values(results)
        .filter((result: any) => result && typeof result.confidence === 'number')
        .map((result: any) => result.confidence);
      
      const combinedConfidence = confidences.length > 0 
        ? confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length
        : 0;

      results.combined = {
        isValid: combinedConfidence >= 0.6,
        confidence: combinedConfidence,
        evidence: results,
        errors: allErrors,
        warnings: allWarnings
      };

      // Log verification if userId provided
      if (userId) {
        await this.logVerification(
          userId,
          null,
          'multi-source',
          skillName,
          results.combined,
          results.combined.isValid ? VerificationStatus.SUCCESS : VerificationStatus.FAILED
        );
      }

      return results;
    } catch (error) {
      logger.error('Error performing multi-source verification:', error);
      throw new CustomError('Failed to perform multi-source verification', 500);
    }
  }

  async getVerificationLogs(userId: string): Promise<VerificationLog[]> {
    try {
      const logs = await prisma.verificationLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 100, // Limit to last 100 logs
      });

      return logs;
    } catch (error) {
      logger.error('Error fetching verification logs:', error);
      throw new CustomError('Failed to fetch verification logs', 500);
    }
  }

  private async verifyCredentialInternally(credential: any): Promise<VerificationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check expiration
    if (credential.expirationDate && credential.expirationDate < new Date()) {
      errors.push('Credential has expired');
    }

    // Check status
    if (credential.status === 'REVOKED') {
      errors.push('Credential has been revoked');
    } else if (credential.status === 'EXPIRED') {
      errors.push('Credential status is expired');
    }

    // Verify proof (mock implementation)
    const proofValid = this.verifyProof(credential.proof);
    if (!proofValid) {
      errors.push('Credential proof verification failed');
    }

    return {
      isValid: errors.length === 0,
      confidence: errors.length === 0 ? 1.0 : 0.0,
      evidence: { credential },
      errors,
      warnings
    };
  }

  private async performExternalVerification(
    skill: string,
    externalVerification: any,
    userId: string,
    credentialId: string
  ): Promise<VerificationResult> {
    const results: any = {};

    if (externalVerification.github) {
      results.github = await this.performGitHubVerification(externalVerification.github, skill);
    }

    if (externalVerification.linkedin) {
      results.linkedin = await this.performLinkedInVerification(externalVerification.linkedin, skill);
    }

    // Calculate combined confidence
    const confidences = Object.values(results)
      .filter((result: any) => result && typeof result.confidence === 'number')
      .map((result: any) => result.confidence);
    
    const combinedConfidence = confidences.length > 0 
      ? confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length
      : 0;

    return {
      isValid: combinedConfidence >= 0.6,
      confidence: combinedConfidence,
      evidence: results,
      errors: [],
      warnings: []
    };
  }

  private async performGitHubVerification(username: string, skill: string): Promise<VerificationResult> {
    try {
      if (!config.GITHUB_TOKEN) {
        return {
          isValid: false,
          confidence: 0,
          evidence: {},
          errors: ['GitHub token not configured'],
          warnings: []
        };
      }

      // Get user profile
      const profileResponse = await axios.get(`https://api.github.com/users/${username}`, {
        headers: { Authorization: `token ${config.GITHUB_TOKEN}` }
      });
      const profile = profileResponse.data;

      // Get user repositories
      const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos`, {
        headers: { Authorization: `token ${config.GITHUB_TOKEN}` },
        params: { sort: 'updated', per_page: 100 }
      });
      const repositories = reposResponse.data;

      // Analyze repositories for skill evidence
      const skillEvidence = await this.analyzeGitHubSkill(repositories, skill);

      // Calculate confidence
      const confidence = this.calculateGitHubConfidence(skillEvidence, repositories.length);

      return {
        isValid: confidence >= 0.6,
        confidence,
        evidence: {
          profile,
          repositories: repositories.slice(0, 10), // Limit for response size
          skillAnalysis: skillEvidence
        },
        errors: confidence < 0.3 ? ['Insufficient evidence for skill verification'] : [],
        warnings: confidence < 0.6 ? ['Low confidence in skill verification'] : []
      };
    } catch (error) {
      return {
        isValid: false,
        confidence: 0,
        evidence: {},
        errors: [`GitHub verification failed: ${error.message}`],
        warnings: []
      };
    }
  }

  private async performLinkedInVerification(profileId: string, skill: string): Promise<VerificationResult> {
    // Mock LinkedIn verification - in production, this would use LinkedIn's API
    return {
      isValid: true,
      confidence: 0.8,
      evidence: {
        profileId,
        skill,
        verifiedAt: new Date().toISOString(),
        source: 'linkedin'
      },
      errors: [],
      warnings: ['LinkedIn verification is mocked - not connected to real API']
    };
  }

  private async analyzeGitHubSkill(repositories: any[], skill: string): Promise<any> {
    const skillEvidence = {
      repositoriesWithSkill: [],
      totalCommits: 0,
      languagesUsed: new Set<string>(),
      skillMentions: 0
    };

    for (const repo of repositories.slice(0, 20)) { // Limit analysis to first 20 repos
      try {
        // Check repository description and name for skill mentions
        const repoText = `${repo.name} ${repo.description || ''}`.toLowerCase();
        if (repoText.includes(skill.toLowerCase())) {
          skillEvidence.repositoriesWithSkill.push(repo);
          skillEvidence.skillMentions++;
        }

        // Get languages used in repository
        if (repo.language) {
          skillEvidence.languagesUsed.add(repo.language);
        }

        // Estimate commits (GitHub API doesn't provide exact count without additional calls)
        skillEvidence.totalCommits += repo.size || 0;
      } catch (error) {
        logger.warn(`Error analyzing repository ${repo.name}:`, error);
      }
    }

    return skillEvidence;
  }

  private calculateGitHubConfidence(skillEvidence: any, totalRepos: number): number {
    let confidence = 0;

    // Repository evidence (40% weight)
    const repoScore = Math.min(skillEvidence.repositoriesWithSkill.length / Math.max(totalRepos, 1), 1);
    confidence += repoScore * 0.4;

    // Commit activity (30% weight)
    const commitScore = Math.min(skillEvidence.totalCommits / 1000, 1); // Normalize to 1000 commits
    confidence += commitScore * 0.3;

    // Skill mentions (20% weight)
    const mentionScore = Math.min(skillEvidence.skillMentions / 5, 1); // Normalize to 5 mentions
    confidence += mentionScore * 0.2;

    // Language diversity (10% weight)
    const languageScore = Math.min(skillEvidence.languagesUsed.size / 10, 1); // Normalize to 10 languages
    confidence += languageScore * 0.1;

    return Math.min(confidence, 1);
  }

  private verifyProof(proof: any): boolean {
    try {
      if (!proof || !proof.signature) {
        return false;
      }

      return proof.type === 'Ed25519Signature2020' && 
             proof.proofPurpose === 'assertionMethod' &&
             proof.signature.length > 0;
    } catch (error) {
      return false;
    }
  }

  private async logVerification(
    userId: string,
    credentialId: string | null,
    source: string,
    skill: string,
    result: VerificationResult,
    status: VerificationStatus
  ): Promise<void> {
    try {
      await prisma.verificationLog.create({
        data: {
          userId,
          credentialId,
          source,
          skill,
          result: result as any,
          status,
        },
      });
    } catch (error) {
      logger.error('Error logging verification:', error);
    }
  }
}
