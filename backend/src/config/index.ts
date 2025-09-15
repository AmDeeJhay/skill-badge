// Environment configuration
export interface Config {
  // Database
  DATABASE_URL: string;
  REDIS_URL: string;
  
  // Authentication
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // External APIs
  GITHUB_TOKEN?: string;
  LINKEDIN_CLIENT_ID?: string;
  LINKEDIN_CLIENT_SECRET?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  
  // File storage
  UPLOAD_DIR: string;
  UPLOAD_MAX_SIZE: string;
  
  // App configuration
  PORT: string;
  NODE_ENV: string;
  FRONTEND_URL: string;
  API_VERSION: string;
  
  // Feature flags
  ENABLE_BATCH_VERIFICATION: boolean;
  ENABLE_ANALYTICS: boolean;
  ENABLE_FILE_UPLOAD: boolean;
  ENABLE_EXTERNAL_VERIFICATION: boolean;
}

export const config: Config = {
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
  UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE || "10mb",
  
  PORT: process.env.PORT || "3001",
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  API_VERSION: process.env.API_VERSION || "v1",
  
  ENABLE_BATCH_VERIFICATION: process.env.ENABLE_BATCH_VERIFICATION === "true",
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === "true",
  ENABLE_FILE_UPLOAD: process.env.ENABLE_FILE_UPLOAD === "true",
  ENABLE_EXTERNAL_VERIFICATION: process.env.ENABLE_EXTERNAL_VERIFICATION === "true",
};

export default config;
