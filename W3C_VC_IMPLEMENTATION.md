# W3C Verifiable Credentials Implementation

This implementation adds comprehensive W3C Verifiable Credentials support to the Skill Badge application, including DID management, credential issuance, verification, expiration/revocation, and external API integrations.

## Features Implemented

### 1. W3C Verifiable Credentials Backend (`lib/w3c-vc.ts`)

- **DID Management**: Generate and manage Decentralized Identifiers (DID:Polkadot format)
- **Credential Issuance**: Issue SkillCredential and ExperienceCredential types
- **Credential Verification**: Cryptographic verification with Ed25519 signatures
- **Credential Storage**: In-memory storage with status tracking

#### Key Classes:
- `DIDManager`: Handles DID generation and document management
- `CredentialIssuer`: Issues W3C-compliant verifiable credentials
- `CredentialVerifier`: Verifies credentials cryptographically
- `CredentialManager`: Manages credential CRUD operations

### 2. API Endpoints

#### Credential Management:
- `POST /api/credentials/issue` - Issue new credentials
- `POST /api/credentials/verify` - Verify credentials
- `GET /api/credentials/[userId]` - Get user credentials
- `POST /api/credentials/revoke` - Revoke credentials
- `GET /api/credentials/status/[id]` - Check credential status

#### External Verification:
- `GET /api/github/verify/[username]` - Verify GitHub skills
- `POST /api/verify/multi-source` - Multi-source verification

### 3. Expiration and Revocation Support (`lib/credential-scheduler.ts`)

- **Scheduled Jobs**: Daily cron job to check expired credentials
- **Status Management**: Automatic status updates (valid/expired/revoked)
- **Revocation Support**: Manual credential revocation
- **Status Checking**: Real-time credential status verification

### 4. External API Integration (`lib/external-integrations.ts`)

#### GitHub Integration:
- User profile verification
- Repository analysis
- Commit activity tracking
- Skill confidence scoring

#### LinkedIn Integration:
- Profile verification (mock implementation)
- Experience validation
- Skill cross-checking

#### Verification Service Manager:
- Multi-source verification
- Confidence scoring
- Event logging
- Modular service architecture

### 5. Enhanced Frontend Components

#### Enhanced Mint Credential Form (`components/enhanced-mint-credential-form.tsx`):
- W3C VC type selection (SkillCredential/ExperienceCredential)
- External verification integration
- Expiration date support
- Real-time validation

#### Credential Verification (`components/credential-verification.tsx`):
- Verify by credential ID
- Verify by JSON input
- Status checking
- Detailed verification results

#### Enhanced Mint Page (`app/mint-enhanced/page.tsx`):
- Tabbed interface for minting, verification, and management
- W3C standards compliance indicators
- Network status display
- External integration status

## Credential Types

### SkillCredential
```typescript
{
  skillName: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  verifierDID: string
  evidenceUrl?: string
  description?: string
}
```

### ExperienceCredential
```typescript
{
  projectTitle: string
  projectDescription: string
  verifierDID: string
  startDate: string
  endDate?: string
  technologies?: string[]
  evidenceUrl?: string
}
```

## Usage Examples

### Issue a Skill Credential
```typescript
const credential = await credentialIssuer.issueSkillCredential(
  subjectDID,
  {
    skillName: "React Development",
    skillLevel: "advanced",
    verifierDID: "did:polkadot:verifier-123",
    evidenceUrl: "https://github.com/user/react-projects"
  },
  issuerDID,
  "2025-12-31" // expiration date
)
```

### Verify a Credential
```typescript
const result = await credentialVerifier.verifyCredential(credential)
console.log(result.isValid) // true/false
console.log(result.errors) // array of errors
console.log(result.warnings) // array of warnings
```

### External Verification
```typescript
const result = await verificationServiceManager.verifySkillWithGitHub(
  "github-username",
  "React Development"
)
console.log(result.confidence) // 0.0 - 1.0
console.log(result.isValid) // true/false
```

## API Integration

### GitHub API
- Requires GitHub username
- Analyzes repositories, commits, and languages
- Calculates confidence score based on activity
- Supports skill-specific verification

### LinkedIn API
- Mock implementation ready for real API integration
- Requires LinkedIn profile ID
- Cross-checks declared skills
- Returns verification results

## Security Features

- **Cryptographic Signatures**: Ed25519 digital signatures
- **DID Resolution**: Decentralized identity verification
- **Expiration Management**: Automatic credential expiration
- **Revocation Support**: Credential revocation with status updates
- **Proof Verification**: Cryptographic proof validation

## Database Schema

The implementation uses in-memory storage for demonstration. In production, you would need:

### Credentials Table
- `id`: Credential ID
- `type`: Credential type (SkillCredential/ExperienceCredential)
- `subject_did`: Subject DID
- `issuer_did`: Issuer DID
- `credential_data`: JSON credential data
- `issuance_date`: Issuance timestamp
- `expiration_date`: Expiration timestamp
- `status`: valid/expired/revoked
- `proof`: Cryptographic proof

### Verification Logs Table
- `id`: Log ID
- `service`: Verification service (github/linkedin)
- `user_id`: User identifier
- `skill_name`: Skill being verified
- `result`: Verification result JSON
- `timestamp`: Verification timestamp

## Deployment Notes

1. **Environment Variables**: Set up API keys for GitHub and LinkedIn
2. **Database**: Replace in-memory storage with persistent database
3. **Cron Jobs**: Set up proper cron job scheduling for production
4. **DID Registry**: Implement proper DID resolution service
5. **Cryptographic Keys**: Use real cryptographic key generation

## Testing

The implementation includes comprehensive error handling and validation. Test the following scenarios:

1. **Credential Issuance**: Issue both credential types
2. **Credential Verification**: Verify valid and invalid credentials
3. **Expiration**: Test credential expiration handling
4. **Revocation**: Test credential revocation
5. **External Verification**: Test GitHub and LinkedIn integration
6. **Error Handling**: Test various error conditions

## Future Enhancements

1. **IPFS Integration**: Store credentials on IPFS
2. **Additional APIs**: StackOverflow, Kaggle, etc.
3. **Credential Templates**: Predefined credential templates
4. **Batch Operations**: Bulk credential operations
5. **Analytics**: Credential usage analytics
6. **Mobile Support**: Mobile app integration

## Compliance

This implementation follows W3C Verifiable Credentials standards:
- JSON-LD format
- Cryptographic proofs
- DID integration
- Status management
- Expiration support
- Revocation support
