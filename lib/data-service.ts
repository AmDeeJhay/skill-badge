// Data fetching service for replacing mock data with live API calls
import { apiClient } from './backend-integration';

// Types for API responses
export interface ApiCredential {
  id: string;
  userId: string;
  vcId: string;
  skill: string;
  organization: string;
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  proof: Record<string, unknown>;
  status: 'VALID' | 'EXPIRED' | 'REVOKED' | 'PENDING';
  metadata?: Record<string, unknown>;
  revokedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiUser {
  id: string;
  wallet: string;
  did: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  links?: Record<string, unknown>;
  isVerified: boolean;
  reputation: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiUserStats {
  totalCredentials: number;
  validCredentials: number;
  expiredCredentials: number;
  revokedCredentials: number;
  totalVerifications: number;
  successfulVerifications: number;
  skills: string[];
  organizations: string[];
  reputation: number;
  isVerified: boolean;
}

// API Response wrapper types
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface ApiCredentialResponse {
  data: ApiCredential;
  success: boolean;
  message?: string;
}

interface ApiCredentialsResponse {
  data: ApiCredential[];
  success: boolean;
  message?: string;
}

interface ApiUserResponse {
  data: ApiUser;
  success: boolean;
  message?: string;
}

interface ApiUserStatsResponse {
  data: ApiUserStats;
  success: boolean;
  message?: string;
}

// Convert API credential to frontend credential format
export const convertApiCredentialToFrontend = (apiCred: ApiCredential) => ({
  id: apiCred.id,
  skillName: apiCred.skill,
  issuerName: apiCred.organization,
  issueDate: apiCred.issuanceDate.split('T')[0], // Convert to YYYY-MM-DD format
  description: apiCred.metadata?.description as string || undefined,
  badgeColor: getBadgeColor(apiCred.skill),
  verified: apiCred.status === 'VALID',
  transactionHash: apiCred.vcId,
});

// Get badge color based on skill name
const getBadgeColor = (skillName: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500', 
    'bg-green-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500',
  ];
  
  const hash = skillName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Data fetching functions
export const dataService = {
  // User management
  async getUser(wallet: string): Promise<ApiUser | null> {
    try {
      const response = await apiClient.getUser(wallet) as ApiUserResponse;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  },

  async createOrUpdateUser(userData: {
    wallet: string;
    did: string;
    name?: string;
    bio?: string;
    avatarUrl?: string;
    links?: Record<string, unknown>;
  }): Promise<ApiUser | null> {
    try {
      const response = await apiClient.createUser(userData) as ApiUserResponse;
      return response.data;
    } catch (error) {
      console.error('Failed to create/update user:', error);
      return null;
    }
  },

  async getUserStats(wallet: string): Promise<ApiUserStats | null> {
    try {
      const response = await apiClient.getUserStats(wallet) as ApiUserStatsResponse;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return null;
    }
  },

  // Credential management
  async getUserCredentials(wallet: string): Promise<ReturnType<typeof convertApiCredentialToFrontend>[]> {
    try {
      const response = await apiClient.getUserCredentials(wallet) as ApiCredentialsResponse;
      return response.data.map(convertApiCredentialToFrontend);
    } catch (error) {
      console.error('Failed to fetch user credentials:', error);
      return [];
    }
  },

  async getCredential(id: string): Promise<ReturnType<typeof convertApiCredentialToFrontend> | null> {
    try {
      const response = await apiClient.getCredential(id) as ApiCredentialResponse;
      return convertApiCredentialToFrontend(response.data);
    } catch (error) {
      console.error('Failed to fetch credential:', error);
      return null;
    }
  },

  async createCredential(credentialData: {
    skill: string;
    organization: string;
    issuer: string;
    expirationDate?: string;
    metadata?: Record<string, unknown>;
  }, token?: string): Promise<ReturnType<typeof convertApiCredentialToFrontend> | null> {
    try {
      const response = await apiClient.createCredential(credentialData, token) as ApiCredentialResponse;
      return convertApiCredentialToFrontend(response.data);
    } catch (error) {
      console.error('Failed to create credential:', error);
      return null;
    }
  },

  async updateCredential(id: string, credentialData: Record<string, unknown>, token?: string): Promise<ReturnType<typeof convertApiCredentialToFrontend> | null> {
    try {
      const response = await apiClient.updateCredential(id, credentialData, token) as ApiCredentialResponse;
      return convertApiCredentialToFrontend(response.data);
    } catch (error) {
      console.error('Failed to update credential:', error);
      return null;
    }
  },

  async deleteCredential(id: string, token?: string): Promise<boolean> {
    try {
      await apiClient.deleteCredential(id, token);
      return true;
    } catch (error) {
      console.error('Failed to delete credential:', error);
      return false;
    }
  },

  async revokeCredential(id: string, reason?: string, token?: string): Promise<boolean> {
    try {
      await apiClient.revokeCredential(id, reason, token);
      return true;
    } catch (error) {
      console.error('Failed to revoke credential:', error);
      return false;
    }
  },

  async getCredentialStatus(id: string): Promise<string | null> {
    try {
      const response = await apiClient.getCredentialStatus(id) as ApiResponse<{ status: string }>;
      return response.data.status;
    } catch (error) {
      console.error('Failed to fetch credential status:', error);
      return null;
    }
  },

  // Verification
  async verifyCredential(verificationData: {
    credentialId: string;
    externalVerification?: {
      github?: string;
      linkedin?: string;
    };
  }, token?: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await apiClient.verifyCredential(verificationData, token) as ApiResponse<Record<string, unknown>>;
      return response.data;
    } catch (error) {
      console.error('Failed to verify credential:', error);
      return null;
    }
  },

  async verifyGitHubSkill(username: string, skill: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await apiClient.verifyGitHubSkill(username, skill) as ApiResponse<Record<string, unknown>>;
      return response.data;
    } catch (error) {
      console.error('Failed to verify GitHub skill:', error);
      return null;
    }
  },

  async verifyMultiSource(verificationData: {
    skillName: string;
    githubUsername?: string;
    linkedinProfileId?: string;
  }, token?: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await apiClient.verifyMultiSource(verificationData, token) as ApiResponse<Record<string, unknown>>;
      return response.data;
    } catch (error) {
      console.error('Failed to perform multi-source verification:', error);
      return null;
    }
  },

  // Analytics
  async getOverviewStats(): Promise<Record<string, unknown> | null> {
    try {
      const response = await apiClient.getOverviewStats() as ApiResponse<Record<string, unknown>>;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch overview stats:', error);
      return null;
    }
  },

  async getTrendingSkills(limit = 20): Promise<Record<string, unknown>[] | null> {
    try {
      const response = await apiClient.getTrendingSkills(limit) as ApiResponse<Record<string, unknown>[]>;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trending skills:', error);
      return null;
    }
  },

  async getVerificationStats(): Promise<Record<string, unknown> | null> {
    try {
      const response = await apiClient.getVerificationStats() as ApiResponse<Record<string, unknown>>;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch verification stats:', error);
      return null;
    }
  },

  async getUserGrowth(period = '30d'): Promise<Record<string, unknown> | null> {
    try {
      const response = await apiClient.getUserGrowth(period) as ApiResponse<Record<string, unknown>>;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user growth:', error);
      return null;
    }
  },

  // Health check
  async getHealth(): Promise<Record<string, unknown> | null> {
    try {
      const response = await apiClient.getHealth();
      return response as Record<string, unknown>;
    } catch (error) {
      console.error('Failed to fetch health status:', error);
      return null;
    }
  },
};

// Utility functions for backward compatibility
export const getCredentialsByAddress = async (address: string) => {
  return await dataService.getUserCredentials(address);
};

// Note: getCredentialStats is imported from mock-data.ts for frontend credential format

export const getRecentCredentials = async (address: string, limit = 4) => {
  const credentials = await dataService.getUserCredentials(address);
  return credentials
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, limit);
};

// Function to add a new credential (for minting)
export const addMintedCredential = async (credentialData: {
  skill: string;
  organization: string;
  issuer: string;
  expirationDate?: string;
  metadata?: Record<string, unknown>;
}, token?: string) => {
  return await dataService.createCredential(credentialData, token);
};