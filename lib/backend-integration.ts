// Frontend integration utilities for connecting to the backend

// API client for backend communication
class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.apiKey = process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  // User management
  async createUser(userData: Record<string, unknown>) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser(wallet: string) {
    return this.request(`/users/${wallet}`);
  }

  async updateUser(wallet: string, userData: Record<string, unknown>) {
    return this.request(`/users/${wallet}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getUserStats(wallet: string) {
    return this.request(`/users/${wallet}/stats`);
  }

  // Credential management
  async createCredential(credentialData: Record<string, unknown>, token?: string) {
    return this.request('/credentials', {
      method: 'POST',
      body: JSON.stringify(credentialData),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async getUserCredentials(wallet: string) {
    return this.request(`/credentials/${wallet}`);
  }

  async getCredential(id: string) {
    return this.request(`/credentials/single/${id}`);
  }

  async updateCredential(id: string, credentialData: Record<string, unknown>, token?: string) {
    return this.request(`/credentials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(credentialData),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async deleteCredential(id: string, token?: string) {
    return this.request(`/credentials/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async revokeCredential(id: string, reason?: string, token?: string) {
    return this.request(`/credentials/${id}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async getCredentialStatus(id: string) {
    return this.request(`/credentials/status/${id}`);
  }

  // Verification
  async verifyCredential(verificationData: Record<string, unknown>, token?: string) {
    return this.request('/verify', {
      method: 'POST',
      body: JSON.stringify(verificationData),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async verifyGitHubSkill(username: string, skill: string) {
    return this.request(`/verify/github/${username}?skill=${encodeURIComponent(skill)}`);
  }

  async verifyMultiSource(verificationData: Record<string, unknown>, token?: string) {
    return this.request('/verify/multi-source', {
      method: 'POST',
      body: JSON.stringify(verificationData),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async getVerificationLogs(userId: string, token?: string) {
    return this.request(`/verify/logs/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  // Analytics
  async getOverviewStats() {
    return this.request('/analytics/overview');
  }

  async getTrendingSkills(limit = 20) {
    return this.request(`/analytics/skills-trending?limit=${limit}`);
  }

  async getVerificationStats() {
    return this.request('/analytics/verification-stats');
  }

  async getUserGrowth(period = '30d') {
    return this.request(`/analytics/user-growth?period=${period}`);
  }

  async getOrganizationStats(limit = 20) {
    return this.request(`/analytics/organizations?limit=${limit}`);
  }

  // Health check
  async getHealth() {
    return this.request('/health');
  }

  async getDetailedHealth() {
    return this.request('/health/detailed');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export the class for type checking
export { ApiClient };

// Utility functions for frontend integration
export const backendIntegration = {
  // Initialize user with backend
  async initializeUser(wallet: string, did: string, userData?: Record<string, unknown>) {
    try {
      const user = await apiClient.createUser({
        wallet,
        did,
        ...userData,
      });
      return user;
    } catch (error) {
      console.error('Failed to initialize user:', error);
      throw error;
    }
  },

  // Create W3C Verifiable Credential
  async createW3CCredential(
    userId: string,
    credentialData: {
      skill: string;
      organization: string;
      issuer: string;
      expirationDate?: string;
      metadata?: Record<string, unknown>;
    },
    token?: string
  ) {
    try {
      const credential = await apiClient.createCredential(credentialData, token);
      return credential;
    } catch (error) {
      console.error('Failed to create credential:', error);
      throw error;
    }
  },

  // Verify credential with external sources
  async verifyCredentialWithExternalSources(
    credentialId: string,
    externalVerification: {
      github?: string;
      linkedin?: string;
    },
    token?: string
  ) {
    try {
      const result = await apiClient.verifyCredential(
        { credentialId, externalVerification },
        token
      );
      return result;
    } catch (error) {
      console.error('Failed to verify credential:', error);
      throw error;
    }
  },

  // Get user's complete profile with credentials
  async getUserProfile(wallet: string) {
    try {
      const [user, credentials, stats] = await Promise.all([
        apiClient.getUser(wallet),
        apiClient.getUserCredentials(wallet),
        apiClient.getUserStats(wallet),
      ]);

      return {
        user,
        credentials,
        stats,
      };
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  },

  // Get platform analytics
  async getPlatformAnalytics() {
    try {
      const [overview, trendingSkills, verificationStats, userGrowth] = await Promise.all([
        apiClient.getOverviewStats(),
        apiClient.getTrendingSkills(),
        apiClient.getVerificationStats(),
        apiClient.getUserGrowth(),
      ]);

      return {
        overview,
        trendingSkills,
        verificationStats,
        userGrowth,
      };
    } catch (error) {
      console.error('Failed to get platform analytics:', error);
      throw error;
    }
  },
};

// React hooks for backend integration
export const useBackendIntegration = () => {
  return {
    apiClient,
    backendIntegration,
  };
};