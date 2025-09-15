// Credential service
import { prisma } from '@/models/prisma';
import { Credential, CreateCredentialRequest, CredentialStatus, VerifiableCredential } from '@/types';
import { logger } from '@/utils/logger';
import { CustomError } from '@/middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export class CredentialService {
  async createCredential(userId: string, credentialData: CreateCredentialRequest): Promise<Credential> {
    try {
      // Generate W3C VC ID
      const vcId = `credential:${uuidv4()}`;
      
      // Create W3C Verifiable Credential
      const verifiableCredential: VerifiableCredential = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://w3id.org/skill-passport/v1'
        ],
        type: ['VerifiableCredential', 'SkillCredential'],
        id: vcId,
        issuer: credentialData.issuer,
        issuanceDate: new Date().toISOString(),
        expirationDate: credentialData.expirationDate,
        credentialSubject: {
          id: userId,
          type: ['SkillCredential'],
          skillName: credentialData.skill,
          organization: credentialData.organization,
          verifierDID: credentialData.issuer,
          evidenceUrl: credentialData.metadata?.evidenceUrl,
          description: credentialData.metadata?.description,
        },
        credentialStatus: {
          id: `${vcId}#status`,
          type: 'CredentialStatusList2021',
          status: 'valid'
        },
        proof: {
          type: 'Ed25519Signature2020',
          created: new Date().toISOString(),
          proofPurpose: 'assertionMethod',
          verificationMethod: `${credentialData.issuer}#key-1`,
          signature: await this.generateProof(vcId, credentialData.issuer)
        }
      };

      const credential = await prisma.credential.create({
        data: {
          userId,
          vcId,
          skill: credentialData.skill,
          organization: credentialData.organization,
          issuer: credentialData.issuer,
          issuanceDate: new Date(),
          expirationDate: credentialData.expirationDate ? new Date(credentialData.expirationDate) : null,
          proof: verifiableCredential.proof,
          metadata: credentialData.metadata,
          status: CredentialStatus.VALID,
        },
      });

      logger.info('Credential created', { 
        credentialId: credential.id, 
        vcId: credential.vcId,
        userId: credential.userId 
      });

      return credential;
    } catch (error) {
      logger.error('Error creating credential:', error);
      throw new CustomError('Failed to create credential', 500);
    }
  }

  async getUserCredentials(wallet: string): Promise<Credential[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { wallet },
        select: { id: true }
      });

      if (!user) {
        return [];
      }

      const credentials = await prisma.credential.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      return credentials;
    } catch (error) {
      logger.error('Error fetching user credentials:', error);
      throw new CustomError('Failed to fetch credentials', 500);
    }
  }

  async getCredentialById(id: string): Promise<Credential | null> {
    try {
      const credential = await prisma.credential.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              wallet: true,
              name: true,
              did: true,
            }
          }
        }
      });

      return credential;
    } catch (error) {
      logger.error('Error fetching credential by ID:', error);
      throw new CustomError('Failed to fetch credential', 500);
    }
  }

  async updateCredential(id: string, userId: string, updateData: CreateCredentialRequest): Promise<Credential | null> {
    try {
      const credential = await prisma.credential.updateMany({
        where: { 
          id,
          userId, // Ensure user owns the credential
        },
        data: {
          skill: updateData.skill,
          organization: updateData.organization,
          issuer: updateData.issuer,
          expirationDate: updateData.expirationDate ? new Date(updateData.expirationDate) : null,
          metadata: updateData.metadata,
          updatedAt: new Date(),
        },
      });

      if (credential.count === 0) {
        return null;
      }

      const updatedCredential = await prisma.credential.findUnique({
        where: { id },
      });

      logger.info('Credential updated', { credentialId: id, userId });
      return updatedCredential;
    } catch (error) {
      logger.error('Error updating credential:', error);
      throw new CustomError('Failed to update credential', 500);
    }
  }

  async deleteCredential(id: string, userId: string): Promise<boolean> {
    try {
      const result = await prisma.credential.deleteMany({
        where: { 
          id,
          userId, // Ensure user owns the credential
        },
      });

      if (result.count === 0) {
        return false;
      }

      logger.info('Credential deleted', { credentialId: id, userId });
      return true;
    } catch (error) {
      logger.error('Error deleting credential:', error);
      throw new CustomError('Failed to delete credential', 500);
    }
  }

  async batchVerifyCredentials(credentialIds: string[], userId: string): Promise<any[]> {
    try {
      const credentials = await prisma.credential.findMany({
        where: { 
          id: { in: credentialIds },
          userId, // Ensure user owns the credentials
        },
      });

      const results = await Promise.all(
        credentials.map(async (credential) => {
          const verification = await this.verifyCredential(credential);
          return {
            credentialId: credential.id,
            isValid: verification.isValid,
            errors: verification.errors,
            warnings: verification.warnings,
          };
        })
      );

      return results;
    } catch (error) {
      logger.error('Error batch verifying credentials:', error);
      throw new CustomError('Failed to batch verify credentials', 500);
    }
  }

  async revokeCredential(id: string, userId: string, reason?: string): Promise<boolean> {
    try {
      const result = await prisma.credential.updateMany({
        where: { 
          id,
          userId, // Ensure user owns the credential
        },
        data: {
          status: CredentialStatus.REVOKED,
          revokedReason: reason,
          updatedAt: new Date(),
        },
      });

      if (result.count === 0) {
        return false;
      }

      logger.info('Credential revoked', { credentialId: id, userId, reason });
      return true;
    } catch (error) {
      logger.error('Error revoking credential:', error);
      throw new CustomError('Failed to revoke credential', 500);
    }
  }

  async getCredentialStatus(id: string): Promise<CredentialStatus | null> {
    try {
      const credential = await prisma.credential.findUnique({
        where: { id },
        select: { status: true },
      });

      return credential?.status || null;
    } catch (error) {
      logger.error('Error fetching credential status:', error);
      throw new CustomError('Failed to fetch credential status', 500);
    }
  }

  async verifyCredential(credential: Credential): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check expiration
      if (credential.expirationDate && credential.expirationDate < new Date()) {
        errors.push('Credential has expired');
      }

      // Check status
      if (credential.status === CredentialStatus.REVOKED) {
        errors.push('Credential has been revoked');
      } else if (credential.status === CredentialStatus.EXPIRED) {
        errors.push('Credential status is expired');
      }

      // Verify proof (mock implementation)
      const proofValid = await this.verifyProof(credential.proof);
      if (!proofValid) {
        errors.push('Credential proof verification failed');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  private async generateProof(vcId: string, issuer: string): Promise<string> {
    // Mock proof generation - in production, this would generate a real cryptographic signature
    const proofData = JSON.stringify({
      credential: vcId,
      issuer,
      timestamp: new Date().toISOString()
    });
    
    return Buffer.from(proofData).toString('base64');
  }

  private async verifyProof(proof: any): Promise<boolean> {
    try {
      // Mock proof verification - in production, this would verify the cryptographic signature
      if (!proof || !proof.signature) {
        return false;
      }

      // Basic validation
      return proof.type === 'Ed25519Signature2020' && 
             proof.proofPurpose === 'assertionMethod' &&
             proof.signature.length > 0;
    } catch (error) {
      return false;
    }
  }
}
