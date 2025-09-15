# Skill Badge Backend

A comprehensive TypeScript backend for the Skill Badge credential verification platform, built with Express.js, Prisma, and W3C Verifiable Credentials support.

## Features

- **W3C Verifiable Credentials**: Full support for W3C-compliant verifiable credentials
- **User Management**: Complete user profile and authentication system
- **Credential Lifecycle**: Issue, verify, revoke, and manage credentials
- **External Verification**: GitHub and LinkedIn API integration
- **Analytics**: Comprehensive analytics and reporting
- **Background Jobs**: Automated credential expiration and cleanup
- **Security**: JWT authentication, rate limiting, and input validation
- **Monitoring**: Health checks and detailed system status

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Authentication**: JWT tokens
- **Background Jobs**: node-cron
- **Logging**: Winston
- **Validation**: express-validator with Zod schemas

## Project Structure

```
backend/
├── src/
│   ├── config/           # Environment & app configuration
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   ├── models/           # Prisma client & types
│   ├── utils/            # Helper functions
│   ├── jobs/             # Background tasks
│   ├── validators/       # Input validation schemas
│   ├── types/            # TypeScript type definitions
│   └── tests/            # Test suites
├── prisma/               # Database schema and migrations
├── logs/                 # Application logs
└── uploads/              # File uploads directory
```

## Quick Start

### 1. Installation

```bash
cd backend
npm install
```

### 2. Environment Setup

```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## API Endpoints

### User Management
- `POST /api/v1/users` - Create or update user
- `GET /api/v1/users/:wallet` - Get user by wallet
- `PUT /api/v1/users/:wallet` - Update user
- `DELETE /api/v1/users/:wallet` - Delete user
- `GET /api/v1/users/:wallet/stats` - Get user statistics
- `GET /api/v1/users` - Get paginated users list

### Credential Management
- `POST /api/v1/credentials` - Create new credential
- `GET /api/v1/credentials/:wallet` - Get user credentials
- `GET /api/v1/credentials/single/:id` - Get single credential
- `PUT /api/v1/credentials/:id` - Update credential
- `DELETE /api/v1/credentials/:id` - Delete credential
- `POST /api/v1/credentials/batch-verify` - Bulk verification
- `POST /api/v1/credentials/:id/revoke` - Revoke credential
- `GET /api/v1/credentials/status/:id` - Get credential status

### Verification
- `POST /api/v1/verify` - Verify credential
- `GET /api/v1/verify/github/:username` - Verify GitHub skills
- `POST /api/v1/verify/multi-source` - Multi-source verification
- `GET /api/v1/verify/logs/:userId` - Get verification logs

### Analytics
- `GET /api/v1/analytics/overview` - Platform statistics
- `GET /api/v1/analytics/skills-trending` - Popular skills
- `GET /api/v1/analytics/verification-stats` - Verification success rates
- `GET /api/v1/analytics/user-growth` - User acquisition metrics
- `GET /api/v1/analytics/organizations` - Organization statistics

### Health & System
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system status

## W3C Verifiable Credentials

The backend implements full W3C Verifiable Credentials support:

### Credential Structure
```typescript
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "SkillCredential"],
  "id": "credential:uuid",
  "issuer": "did:polkadot:issuer",
  "issuanceDate": "2024-01-01T00:00:00Z",
  "expirationDate": "2025-01-01T00:00:00Z",
  "credentialSubject": {
    "id": "did:polkadot:user",
    "type": ["SkillCredential"],
    "skillName": "React Development",
    "skillLevel": "expert",
    "verifierDID": "did:polkadot:issuer"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2024-01-01T00:00:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:polkadot:issuer#key-1",
    "signature": "base64-encoded-signature"
  }
}
```

### Credential Types
- **SkillCredential**: Programming skills, certifications
- **ExperienceCredential**: Project work, internships

## External API Integration

### GitHub Integration
- User profile verification
- Repository analysis
- Commit activity tracking
- Skill confidence scoring

### LinkedIn Integration
- Profile verification (mock implementation)
- Experience validation
- Skill cross-checking

## Background Jobs

Automated tasks that run on schedule:

- **Daily Expiry Check**: Marks expired credentials as expired
- **Hourly Retry Job**: Retries failed verifications
- **Daily Analytics**: Calculates and stores analytics metrics
- **Weekly Cleanup**: Removes old data and expired sessions

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin policies
- **Helmet Security**: Security headers and protection
- **API Key Authentication**: Optional API key validation

## Database Schema

### Core Models
- **User**: User profiles and wallet information
- **Credential**: W3C verifiable credentials
- **VerificationLog**: Audit trail for verification attempts
- **UserSession**: JWT session management
- **IssuerSchema**: Credential issuer requirements
- **Analytics**: Platform metrics and statistics

## Environment Variables

```bash
# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# External APIs
GITHUB_TOKEN="your-github-token"
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# App Configuration
PORT="3001"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
API_VERSION="v1"

# Feature Flags
ENABLE_BATCH_VERIFICATION="true"
ENABLE_ANALYTICS="true"
ENABLE_FILE_UPLOAD="true"
ENABLE_EXTERNAL_VERIFICATION="true"
```

## Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Production Deployment

### 1. Build Application
```bash
npm run build
```

### 2. Set Production Environment
```bash
NODE_ENV=production
DATABASE_URL="postgresql://user:password@localhost:5432/skillbadge"
```

### 3. Run Migrations
```bash
npm run db:migrate
```

### 4. Start Server
```bash
npm start
```

## Monitoring & Logging

### Health Checks
- `GET /health` - Basic health status
- `GET /health/detailed` - Detailed system status including:
  - Database connectivity
  - External API status
  - Memory usage
  - Response times

### Logging
- Structured JSON logging with Winston
- Log levels: error, warn, info, debug
- File rotation and size limits
- Request/response logging middleware

## API Documentation

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Error Responses
All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Success Responses
Successful responses include:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
