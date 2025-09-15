# Frontend-Backend Integration Guide

This guide explains how to integrate the Skill Badge frontend with the TypeScript backend.

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:3001`

### 2. Configure Frontend Environment

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_KEY=dev-api-key
```

### 3. Start the Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🔧 Integration Features

### 1. Enhanced Minting Form

The enhanced minting form (`/mint-enhanced`) now integrates with the backend:

- **User Management**: Automatically creates/updates users in the backend
- **Credential Creation**: Stores credentials in the backend database
- **External Verification**: Integrates with GitHub/LinkedIn APIs
- **W3C Compliance**: Creates W3C Verifiable Credentials

### 2. Credential Verification

The verification component now supports:

- **Backend Integration**: Checks credentials against backend database
- **Local Fallback**: Falls back to local storage if backend is unavailable
- **Status Checking**: Real-time credential status from backend
- **Enhanced Results**: Combines local and backend verification data

### 3. Sidebar Features

The sidebar now includes:

- **Mint Enhanced Tab**: Direct access to W3C VC functionality
- **Feature Explanations**: Expandable toggles explaining each feature
- **W3C Badge**: Visual indicator of W3C compliance

## 📡 API Integration

### Backend Integration Client

The `backendIntegration` utility provides:

```typescript
import { backendIntegration } from '@/lib/backend-integration';

// Initialize user
await backendIntegration.initializeUser(wallet, did, userData);

// Create W3C credential
await backendIntegration.createW3CCredential(userId, credentialData);

// Verify with external sources
await backendIntegration.verifyCredentialWithExternalSources(credentialId, externalVerification);

// Get user profile
await backendIntegration.getUserProfile(wallet);

// Get platform analytics
await backendIntegration.getPlatformAnalytics();
```

### API Client

Direct API access:

```typescript
import { apiClient } from '@/lib/backend-integration';

// User management
await apiClient.createUser(userData);
await apiClient.getUser(wallet);
await apiClient.updateUser(wallet, userData);

// Credential management
await apiClient.createCredential(credentialData);
await apiClient.getUserCredentials(wallet);
await apiClient.getCredential(id);
await apiClient.revokeCredential(id, reason);

// Verification
await apiClient.verifyCredential(verificationData);
await apiClient.verifyGitHubSkill(username, skill);
await apiClient.verifyMultiSource(verificationData);

// Analytics
await apiClient.getOverviewStats();
await apiClient.getTrendingSkills();
await apiClient.getVerificationStats();
```

## 🔄 Data Flow

### Credential Creation Flow

1. **User Input**: User fills out the enhanced minting form
2. **Validation**: Frontend validates input using Zod schemas
3. **User Creation**: Backend creates/updates user profile
4. **Credential Creation**: Backend creates credential with W3C VC structure
5. **Local VC**: Frontend creates local W3C Verifiable Credential
6. **Verification**: Both local and backend verification are performed
7. **External Verification**: Optional GitHub/LinkedIn verification
8. **Storage**: Credential stored in backend database
9. **Success**: User receives confirmation and credential details

### Verification Flow

1. **Credential Lookup**: Check backend database first
2. **Local Fallback**: Fall back to local storage if not found
3. **Verification**: Perform cryptographic verification
4. **Status Check**: Verify credential status (valid/expired/revoked)
5. **Enhanced Results**: Combine backend and local verification data
6. **Display**: Show comprehensive verification results

## 🛠️ Configuration

### Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_KEY=dev-api-key
```

#### Backend (.env)
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
```

### Feature Flags

Control which features are enabled:

```bash
ENABLE_BATCH_VERIFICATION="true"
ENABLE_ANALYTICS="true"
ENABLE_FILE_UPLOAD="true"
ENABLE_EXTERNAL_VERIFICATION="true"
```

## 🧪 Testing

### Test Backend API

Run the test script to verify backend functionality:

```bash
node test-backend.js
```

This will test:
- Health check
- User creation
- Credential creation
- Data retrieval
- Status checking
- Analytics
- Trending skills

### Manual Testing

1. **Navigate to `/mint-enhanced`**
2. **Fill out the form** with test data
3. **Enable external verification** (optional)
4. **Submit the form** and verify success
5. **Check verification tab** to verify the credential
6. **View analytics** to see platform statistics

## 🔍 Monitoring

### Health Checks

- **Basic**: `GET http://localhost:3001/health`
- **Detailed**: `GET http://localhost:3001/health/detailed`

### Logs

Backend logs are stored in:
- `backend/logs/error.log` - Error logs
- `backend/logs/combined.log` - All logs

### Database

Use Prisma Studio to inspect the database:

```bash
cd backend
npm run db:studio
```

## 🚨 Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check if port 3001 is available
   - Verify environment variables
   - Check database connection

2. **Frontend can't connect to backend**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS configuration
   - Ensure backend is running

3. **Database errors**
   - Run `npm run db:push` to sync schema
   - Run `npm run db:seed` to populate test data
   - Check database file permissions

4. **External API errors**
   - Verify API keys are set
   - Check rate limits
   - Ensure network connectivity

### Debug Mode

Enable debug logging:

```bash
# Backend
LOG_LEVEL=debug npm run dev

# Frontend
NEXT_PUBLIC_DEBUG=true npm run dev
```

## 📚 API Documentation

### Authentication

Most endpoints require JWT authentication:

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'x-api-key': 'dev-api-key'
}
```

### Error Handling

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional details",
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

## 🔮 Future Enhancements

### Planned Features

1. **Real-time Updates**: WebSocket integration for live updates
2. **File Upload**: Evidence file upload and storage
3. **Batch Operations**: Bulk credential operations
4. **Advanced Analytics**: More detailed analytics and reporting
5. **Mobile Support**: Mobile app integration
6. **Blockchain Integration**: Direct blockchain interaction
7. **IPFS Storage**: Decentralized credential storage

### Integration Points

1. **Polkadot Integration**: Direct blockchain credential storage
2. **IPFS**: Decentralized file storage
3. **Additional APIs**: StackOverflow, Kaggle, etc.
4. **SSI Wallets**: Integration with SSI wallet providers
5. **Enterprise APIs**: Corporate credential systems

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review backend logs
3. Test with the provided test script
4. Check API documentation
5. Verify environment configuration

The integration provides a robust foundation for credential management with W3C compliance and external verification capabilities.
