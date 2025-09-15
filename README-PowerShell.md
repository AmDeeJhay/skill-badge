# Skill Badge - W3C Verifiable Credentials Platform (Windows PowerShell)

A comprehensive platform for issuing, managing, and verifying W3C-compliant verifiable credentials with blockchain integration and external API verification.

## 🌟 Features

### Frontend (Next.js)
- **W3C Verifiable Credentials**: Full support for W3C-compliant credentials
- **Enhanced Minting**: Advanced credential creation with external verification
- **Credential Verification**: Comprehensive verification system
- **Interactive Sidebar**: Feature explanations and navigation
- **Polkadot Integration**: Wallet connection and blockchain interaction
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS

### Backend (TypeScript + Express)
- **RESTful API**: Complete API for credential management
- **Database Integration**: Prisma ORM with SQLite/PostgreSQL
- **External APIs**: GitHub and LinkedIn integration
- **Background Jobs**: Automated credential lifecycle management
- **Analytics**: Comprehensive platform analytics
- **Security**: JWT authentication, rate limiting, input validation

### W3C Compliance
- **JSON-LD Format**: Standard W3C VC format
- **Ed25519 Signatures**: Cryptographic proof verification
- **DID Integration**: Decentralized identifier support
- **Credential Types**: SkillCredential and ExperienceCredential
- **Lifecycle Management**: Issuance, verification, expiration, revocation

## 🚀 Quick Start (Windows PowerShell)

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Windows PowerShell 5.1+ or PowerShell Core 7+

### Installation

1. **Clone the repository**
   ```powershell
   git clone <repository-url>
   cd skill-badge
   ```

2. **Quick setup (PowerShell)**
   ```powershell
   # Option 1: Use PowerShell setup script
   npm run setup:ps1
   
   # Option 2: Manual setup
   npm install
   npm run backend:setup:ps1
   ```

3. **Start development servers**
   ```powershell
   # Option 1: Use PowerShell startup script
   npm run start:ps1
   
   # Option 2: Manual startup
   npm run dev:full
   ```

This will start:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

### Manual Setup (PowerShell)

If you prefer to set up manually:

1. **Frontend setup**
   ```powershell
   npm install
   npm run dev
   ```

2. **Backend setup**
   ```powershell
   cd backend
   npm install
   Copy-Item env.example .env
   npm run db:generate
   npm run db:push
   npm run db:seed
   npm run dev
   ```

## 📁 Project Structure

```
skill-badge/
├── app/                    # Next.js app directory
│   ├── mint-enhanced/     # Enhanced minting page
│   ├── dashboard/         # User dashboard
│   ├── profile/           # User profile
│   └── ...
├── components/            # React components
│   ├── enhanced-mint-credential-form.tsx
│   ├── credential-verification.tsx
│   ├── sidebar.tsx
│   └── ui/               # UI components
├── lib/                  # Utilities and libraries
│   ├── w3c-vc.ts        # W3C VC implementation
│   ├── external-integrations.ts
│   ├── backend-integration.ts
│   └── ...
├── backend/              # TypeScript backend
│   ├── src/
│   │   ├── controllers/  # API route handlers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Express middleware
│   │   ├── jobs/         # Background jobs
│   │   └── ...
│   ├── prisma/           # Database schema
│   └── ...
├── start.ps1             # PowerShell startup script
├── test-backend.ps1      # PowerShell test script
└── docs/                 # Documentation
```

## 🔧 Configuration

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

## 🎯 Usage

### Creating Credentials

1. **Navigate to Mint Enhanced** (`/mint-enhanced`)
2. **Connect your wallet** (Polkadot)
3. **Select credential type**:
   - SkillCredential: Programming skills, certifications
   - ExperienceCredential: Project work, internships
4. **Fill out the form** with credential details
5. **Enable external verification** (optional):
   - GitHub: Verify coding skills
   - LinkedIn: Verify professional experience
6. **Submit** to create the credential

### Verifying Credentials

1. **Navigate to Verification tab**
2. **Choose verification method**:
   - By Credential ID: Enter credential ID
   - By JSON: Paste credential JSON-LD
3. **View verification results**:
   - Cryptographic verification
   - Status check (valid/expired/revoked)
   - External verification results

### Managing Credentials

- **Dashboard**: View all your credentials
- **Profile**: Manage your profile and settings
- **Analytics**: View platform statistics and trends

## 🔌 API Integration

### Backend API Endpoints

#### User Management
- `POST /api/v1/users` - Create/update user
- `GET /api/v1/users/:wallet` - Get user by wallet
- `PUT /api/v1/users/:wallet` - Update user
- `DELETE /api/v1/users/:wallet` - Delete user

#### Credential Management
- `POST /api/v1/credentials` - Create credential
- `GET /api/v1/credentials/:wallet` - Get user credentials
- `GET /api/v1/credentials/single/:id` - Get single credential
- `PUT /api/v1/credentials/:id` - Update credential
- `DELETE /api/v1/credentials/:id` - Delete credential
- `POST /api/v1/credentials/:id/revoke` - Revoke credential

#### Verification
- `POST /api/v1/verify` - Verify credential
- `GET /api/v1/verify/github/:username` - Verify GitHub skills
- `POST /api/v1/verify/multi-source` - Multi-source verification

#### Analytics
- `GET /api/v1/analytics/overview` - Platform statistics
- `GET /api/v1/analytics/skills-trending` - Popular skills
- `GET /api/v1/analytics/verification-stats` - Verification metrics

### Frontend Integration

```typescript
import { backendIntegration } from '@/lib/backend-integration';

// Initialize user
await backendIntegration.initializeUser(wallet, did, userData);

// Create credential
await backendIntegration.createW3CCredential(userId, credentialData);

// Verify credential
await backendIntegration.verifyCredentialWithExternalSources(credentialId, externalVerification);
```

## 🧪 Testing (PowerShell)

### Backend API Testing

```powershell
# PowerShell test script
npm run backend:test:ps1

# Or run directly
powershell -ExecutionPolicy Bypass -File test-backend.ps1
```

This runs comprehensive tests for:
- Health checks
- User management
- Credential operations
- Verification processes
- Analytics endpoints

### Manual Testing

1. **Start both servers**: `npm run start:ps1`
2. **Navigate to**: `http://localhost:3000/mint-enhanced`
3. **Test credential creation** with sample data
4. **Test verification** in the verification tab
5. **Check analytics** for platform statistics

## 📊 Monitoring

### Health Checks
- **Basic**: `GET http://localhost:3001/health`
- **Detailed**: `GET http://localhost:3001/health/detailed`

### Logs
- **Backend**: `backend/logs/` directory
- **Frontend**: Browser console and network tab

### Database
```powershell
cd backend
npm run db:studio
```

## 🔒 Security

### Authentication
- JWT tokens for API authentication
- Wallet-based user identification
- API key validation

### Data Protection
- Input validation with Zod schemas
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers

### Privacy
- No sensitive data stored in plain text
- Cryptographic signatures for verification
- Decentralized credential storage

## 🚀 Deployment

### Frontend (Vercel)
```powershell
npm run build
# Deploy to Vercel
```

### Backend (Docker)
```powershell
cd backend
docker build -t skill-badge-backend .
docker run -p 3001:3001 skill-badge-backend
```

### Environment Setup
- Update environment variables for production
- Configure database connection
- Set up external API keys
- Enable HTTPS and security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style

## 📚 Documentation

- [Integration Guide](INTEGRATION_GUIDE.md) - Frontend-backend integration
- [Backend README](backend/README.md) - Backend API documentation
- [W3C VC Implementation](lib/w3c-vc.ts) - Verifiable credentials implementation

## 🔮 Roadmap

### Phase 1: Core Features ✅
- W3C Verifiable Credentials implementation
- Basic credential management
- External API integration
- Frontend-backend integration

### Phase 2: Advanced Features 🚧
- Real-time updates with WebSockets
- File upload and IPFS storage
- Advanced analytics and reporting
- Mobile app support

### Phase 3: Blockchain Integration 🔮
- Direct Polkadot blockchain integration
- Decentralized storage with IPFS
- Cross-chain credential verification
- Enterprise SSI integration

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the documentation
3. Test with the provided test scripts
4. Check logs for detailed error information

## 🙏 Acknowledgments

- W3C Verifiable Credentials specification
- Polkadot ecosystem
- Digital Bazaar libraries
- Next.js and React communities
- Open source contributors

---

**Built with ❤️ for the decentralized future of credential verification**
