// Environment configuration
export interface Config {
  // Database
  DATABASE_URL: string;
  REDIS_URL: string;

  // Authentication
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;

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

  // Security configuration
  API_KEY: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // Session configuration
  SESSION_TIMEOUT: string;
  SESSION_COOKIE_SECURE: boolean;
  SESSION_COOKIE_SAME_SITE: 'strict' | 'lax' | 'none';

  // SSL configuration
  SSL_ENABLED: boolean;
  SSL_CERT_PATH: string;
  SSL_KEY_PATH: string;

  // Monitoring
  SENTRY_DSN: string | undefined;
  NEW_RELIC_LICENSE_KEY: string | undefined;
  DATADOG_API_KEY: string | undefined;

  // Health check
  HEALTH_CHECK_ENABLED: boolean;
  HEALTH_CHECK_INTERVAL: number;
  HEALTH_CHECK_TIMEOUT: number;

  // API Documentation
  API_DOCS_ENABLED: boolean;
  API_DOCS_PATH: string;

  // Database connection pool
  DB_POOL_MIN: number;
  DB_POOL_MAX: number;
  DB_POOL_IDLE_TIMEOUT: number;
  DB_POOL_CONNECTION_TIMEOUT: number;

  // Email configuration
  SMTP_HOST: string | undefined;
  SMTP_PORT: number;
  SMTP_USER: string | undefined;
  SMTP_PASS: string | undefined;
  SMTP_FROM: string;

  // Webhook configuration
  WEBHOOK_SECRET: string | undefined;
  WEBHOOK_TIMEOUT: number;

  // Cache configuration
  CACHE_TTL: number;
  CACHE_MAX_SIZE: number;

  // File upload limits
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];
}

export const config: Config = {
  // Database configuration
  DATABASE_URL: process.env['DATABASE_URL'] || (() => {
    throw new Error('DATABASE_URL is required in production environment');
  })(),

  REDIS_URL: process.env['REDIS_URL'] || (() => {
    throw new Error('REDIS_URL is required in production environment');
  })(),

  // Authentication (required in production)
  JWT_SECRET: process.env['JWT_SECRET'] || (() => {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('JWT_SECRET is required in production environment');
    }
    return "your-secret-key";
  })(),

  JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN'] || "7d",

  // File storage
  UPLOAD_DIR: process.env['UPLOAD_DIR'] || "./uploads",
  UPLOAD_MAX_SIZE: process.env['UPLOAD_MAX_SIZE'] || "10mb",

  // Application configuration
  PORT: process.env['PORT'] || "3001",
  NODE_ENV: process.env['NODE_ENV'] || "development",
  FRONTEND_URL: process.env['FRONTEND_URL'] || "http://localhost:3000",
  API_VERSION: process.env['API_VERSION'] || "v1",

  // Feature flags
  ENABLE_BATCH_VERIFICATION: process.env['ENABLE_BATCH_VERIFICATION'] !== "false", // Default true
  ENABLE_ANALYTICS: process.env['ENABLE_ANALYTICS'] !== "false", // Default true
  ENABLE_FILE_UPLOAD: process.env['ENABLE_FILE_UPLOAD'] !== "false", // Default true

  // Security configuration
  API_KEY: process.env['API_KEY'] || (() => {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('API_KEY is required in production environment');
    }
    return "dev-api-key";
  })(),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || "900000"),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || "100"),

  // Session configuration
  SESSION_TIMEOUT: process.env['SESSION_TIMEOUT'] || "24h",
  SESSION_COOKIE_SECURE: process.env['SESSION_COOKIE_SECURE'] === "true",
  SESSION_COOKIE_SAME_SITE: (process.env['SESSION_COOKIE_SAME_SITE'] as 'strict' | 'lax' | 'none') || 'strict',

  // SSL configuration
  SSL_ENABLED: process.env['SSL_ENABLED'] === "true",
  SSL_CERT_PATH: process.env['SSL_CERT_PATH'] || "./ssl/cert.pem",
  SSL_KEY_PATH: process.env['SSL_KEY_PATH'] || "./ssl/key.pem",

  // Monitoring
  SENTRY_DSN: process.env['SENTRY_DSN'],
  NEW_RELIC_LICENSE_KEY: process.env['NEW_RELIC_LICENSE_KEY'],
  DATADOG_API_KEY: process.env['DATADOG_API_KEY'],

  // Health check
  HEALTH_CHECK_ENABLED: process.env['HEALTH_CHECK_ENABLED'] !== "false", // Default true
  HEALTH_CHECK_INTERVAL: parseInt(process.env['HEALTH_CHECK_INTERVAL'] || "30000"),
  HEALTH_CHECK_TIMEOUT: parseInt(process.env['HEALTH_CHECK_TIMEOUT'] || "5000"),

  // API Documentation
  API_DOCS_ENABLED: process.env['API_DOCS_ENABLED'] !== "false", // Default true
  API_DOCS_PATH: process.env['API_DOCS_PATH'] || "/api-docs",

  // Database connection pool
  DB_POOL_MIN: parseInt(process.env['DB_POOL_MIN'] || "2"),
  DB_POOL_MAX: parseInt(process.env['DB_POOL_MAX'] || "10"),
  DB_POOL_IDLE_TIMEOUT: parseInt(process.env['DB_POOL_IDLE_TIMEOUT'] || "10000"),
  DB_POOL_CONNECTION_TIMEOUT: parseInt(process.env['DB_POOL_CONNECTION_TIMEOUT'] || "60000"),

  // Email configuration
  SMTP_HOST: process.env['SMTP_HOST'],
  SMTP_PORT: parseInt(process.env['SMTP_PORT'] || "587"),
  SMTP_USER: process.env['SMTP_USER'],
  SMTP_PASS: process.env['SMTP_PASS'],
  SMTP_FROM: process.env['SMTP_FROM'] || "noreply@skillbadge.com",

  // Webhook configuration
  WEBHOOK_SECRET: process.env['WEBHOOK_SECRET'],
  WEBHOOK_TIMEOUT: parseInt(process.env['WEBHOOK_TIMEOUT'] || "30000"),

  // Cache configuration
  CACHE_TTL: parseInt(process.env['CACHE_TTL'] || "3600"),
  CACHE_MAX_SIZE: parseInt(process.env['CACHE_MAX_SIZE'] || "1000"),

  // File upload limits
  MAX_FILE_SIZE: parseInt(process.env['MAX_FILE_SIZE'] || "10485760"), // 10MB
  ALLOWED_FILE_TYPES: (process.env['ALLOWED_FILE_TYPES'] || "jpg,jpeg,png,pdf,doc,docx,txt").split(','),
};

export default config;