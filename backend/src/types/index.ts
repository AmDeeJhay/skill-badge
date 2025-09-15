// TypeScript type definitions
export interface User {
  id: string;
  wallet: string;
  did: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  links?: SocialLinks;
  isVerified: boolean;
  reputation: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface Credential {
  id: string;
  userId: string;
  vcId: string;
  skill: string;
  organization: string;
  issuer: string;
  issuanceDate: Date;
  expirationDate?: Date;
  proof: Proof;
  status: CredentialStatus;
  metadata?: Record<string, any>;
  revokedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Proof {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
  signature: string;
}

export interface VerificationLog {
  id: string;
  userId: string;
  credentialId?: string;
  source: string;
  skill: string;
  result: VerificationResult;
  status: VerificationStatus;
  timestamp: Date;
}

export interface VerificationResult {
  isValid: boolean;
  confidence: number;
  evidence: any;
  errors: string[];
  warnings: string[];
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface IssuerSchema {
  id: string;
  issuerName: string;
  requiredFields: SchemaFields;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchemaFields {
  [key: string]: {
    type: string;
    required: boolean;
    description?: string;
    validation?: any;
  };
}

export interface FileUpload {
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface Analytics {
  id: string;
  metric: string;
  value: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// Enums
export enum CredentialStatus {
  VALID = 'VALID',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
  PENDING = 'PENDING'
}

export enum VerificationStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  ERROR = 'ERROR'
}

// API Request/Response types
export interface CreateUserRequest {
  wallet: string;
  did: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  links?: SocialLinks;
}

export interface UpdateUserRequest {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  links?: SocialLinks;
}

export interface CreateCredentialRequest {
  skill: string;
  organization: string;
  issuer: string;
  expirationDate?: string;
  metadata?: Record<string, any>;
}

export interface VerifyCredentialRequest {
  credentialId: string;
  externalVerification?: {
    github?: string;
    linkedin?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// External API types
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name?: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  language?: string;
  languages_url: string;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline?: string;
  summary?: string;
  skills?: string[];
  experience?: LinkedInExperience[];
}

export interface LinkedInExperience {
  id: string;
  title: string;
  companyName: string;
  description?: string;
  startDate: string;
  endDate?: string;
  skills?: string[];
}

// W3C Verifiable Credential types
export interface VerifiableCredential {
  '@context': string[];
  type: string[];
  id: string;
  issuer: string | DIDDocument;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: CredentialSubject;
  credentialStatus?: {
    id: string;
    type: string;
    status: 'valid' | 'expired' | 'revoked';
  };
  proof: Proof;
}

export interface DIDDocument {
  '@context': string[];
  id: string;
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase?: string;
  publicKeyJwk?: any;
}

export interface CredentialSubject {
  id: string;
  type: string[];
  [key: string]: any;
}

export interface SkillCredentialSubject extends CredentialSubject {
  skillName: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verifierDID: string;
  evidenceUrl?: string;
  description?: string;
}

export interface ExperienceCredentialSubject extends CredentialSubject {
  projectTitle: string;
  projectDescription: string;
  verifierDID: string;
  startDate: string;
  endDate?: string;
  technologies?: string[];
  evidenceUrl?: string;
}
