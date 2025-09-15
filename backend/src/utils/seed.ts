// Database seeding utility
import { prisma } from '@/models/prisma';
import { logger } from '@/utils/logger';

const seedData = {
  users: [
    {
      wallet: '0x1234567890abcdef1234567890abcdef12345678',
      did: 'did:polkadot:5D1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      name: 'Alice Developer',
      bio: 'Full-stack developer with 5 years experience in React, Node.js, and blockchain technologies.',
      avatarUrl: 'https://via.placeholder.com/150',
      links: {
        github: 'alice-dev',
        linkedin: 'alice-developer',
        twitter: 'alice_dev',
        website: 'https://alice.dev'
      },
      isVerified: true,
      reputation: 850,
    },
    {
      wallet: '0xabcdef1234567890abcdef1234567890abcdef12',
      did: 'did:polkadot:5Dabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      name: 'Bob Designer',
      bio: 'UI/UX designer specializing in web3 applications and design systems.',
      avatarUrl: 'https://via.placeholder.com/150',
      links: {
        github: 'bob-designer',
        linkedin: 'bob-designer',
        website: 'https://bobdesign.com'
      },
      isVerified: true,
      reputation: 720,
    },
    {
      wallet: '0x9876543210fedcba9876543210fedcba98765432',
      did: 'did:polkadot:5D9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
      name: 'Charlie Blockchain',
      bio: 'Blockchain engineer and smart contract developer with expertise in Polkadot ecosystem.',
      avatarUrl: 'https://via.placeholder.com/150',
      links: {
        github: 'charlie-blockchain',
        linkedin: 'charlie-blockchain',
        twitter: 'charlie_bc'
      },
      isVerified: true,
      reputation: 950,
    }
  ],
  credentials: [
    {
      skill: 'React Development',
      organization: 'Meta',
      issuer: 'did:polkadot:issuer:meta',
      metadata: {
        level: 'expert',
        description: 'Advanced React development with hooks, context, and performance optimization',
        evidenceUrl: 'https://github.com/alice-dev/react-projects'
      }
    },
    {
      skill: 'Node.js Development',
      organization: 'OpenJS Foundation',
      issuer: 'did:polkadot:issuer:openjs',
      metadata: {
        level: 'advanced',
        description: 'Backend development with Node.js, Express, and microservices architecture',
        evidenceUrl: 'https://github.com/alice-dev/node-projects'
      }
    },
    {
      skill: 'UI/UX Design',
      organization: 'Adobe',
      issuer: 'did:polkadot:issuer:adobe',
      metadata: {
        level: 'expert',
        description: 'User interface and experience design with focus on accessibility and usability',
        evidenceUrl: 'https://bobdesign.com/portfolio'
      }
    },
    {
      skill: 'Polkadot Development',
      organization: 'Parity Technologies',
      issuer: 'did:polkadot:issuer:parity',
      metadata: {
        level: 'expert',
        description: 'Substrate framework development and Polkadot parachain implementation',
        evidenceUrl: 'https://github.com/charlie-blockchain/polkadot-projects'
      }
    }
  ],
  issuerSchemas: [
    {
      issuerName: 'GitHub',
      requiredFields: {
        repoLink: { type: 'url', required: true, description: 'Link to the GitHub repository' },
        contributionType: { 
          type: 'enum', 
          values: ['commits', 'issues', 'prs'], 
          required: true,
          description: 'Type of contribution to verify'
        },
        verifiedBy: { type: 'string', required: false, description: 'Verifier identifier' }
      }
    },
    {
      issuerName: 'Coursera',
      requiredFields: {
        skillName: { type: 'string', required: true, description: 'Name of the skill' },
        certificateId: { type: 'string', required: true, description: 'Coursera certificate ID' },
        completionDate: { type: 'date', required: true, description: 'Course completion date' },
        courseUrl: { type: 'url', required: false, description: 'Link to the course' }
      }
    },
    {
      issuerName: 'AWS',
      requiredFields: {
        examName: { type: 'string', required: true, description: 'AWS certification exam name' },
        badgeId: { type: 'string', required: true, description: 'AWS digital badge ID' },
        issueDate: { type: 'date', required: true, description: 'Certification issue date' },
        validationUrl: { type: 'url', required: false, description: 'AWS credential validation URL' }
      }
    },
    {
      issuerName: 'Generic',
      requiredFields: {
        skill: { type: 'string', required: true, description: 'Skill name' },
        organization: { type: 'string', required: true, description: 'Issuing organization' },
        evidence: { type: 'file', required: false, description: 'Supporting evidence file' },
        verificationStatus: { 
          type: 'enum', 
          values: ['pending', 'verified'], 
          default: 'pending',
          description: 'Verification status'
        }
      }
    }
  ]
};

export async function seedDatabase(): Promise<void> {
  try {
    logger.info('Starting database seeding...');

    // Clear existing data
    await prisma.verificationLog.deleteMany();
    await prisma.credential.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.user.deleteMany();
    await prisma.issuerSchema.deleteMany();

    // Create users
    const createdUsers = [];
    for (const userData of seedData.users) {
      const user = await prisma.user.create({
        data: userData,
      });
      createdUsers.push(user);
      logger.info(`Created user: ${user.name} (${user.wallet})`);
    }

    // Create credentials for users
    for (let i = 0; i < seedData.credentials.length; i++) {
      const credentialData = seedData.credentials[i];
      const user = createdUsers[i % createdUsers.length]; // Distribute credentials among users

      const credential = await prisma.credential.create({
        data: {
          userId: user.id,
          vcId: `credential:${Date.now()}-${i}`,
          skill: credentialData.skill,
          organization: credentialData.organization,
          issuer: credentialData.issuer,
          issuanceDate: new Date(),
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          proof: {
            type: 'Ed25519Signature2020',
            created: new Date().toISOString(),
            proofPurpose: 'assertionMethod',
            verificationMethod: `${credentialData.issuer}#key-1`,
            signature: Buffer.from(JSON.stringify({
              credential: `credential:${Date.now()}-${i}`,
              issuer: credentialData.issuer,
              timestamp: new Date().toISOString()
            })).toString('base64')
          },
          metadata: credentialData.metadata,
          status: 'VALID',
        },
      });

      logger.info(`Created credential: ${credential.skill} for ${user.name}`);
    }

    // Create issuer schemas
    for (const schemaData of seedData.issuerSchemas) {
      const schema = await prisma.issuerSchema.create({
        data: schemaData,
      });
      logger.info(`Created issuer schema: ${schema.issuerName}`);
    }

    // Create some verification logs
    const verificationLogs = [
      {
        userId: createdUsers[0].id,
        credentialId: null,
        source: 'github',
        skill: 'React Development',
        result: {
          isValid: true,
          confidence: 0.85,
          evidence: { repositories: 15, commits: 1200 },
          errors: [],
          warnings: []
        },
        status: 'SUCCESS',
      },
      {
        userId: createdUsers[1].id,
        credentialId: null,
        source: 'linkedin',
        skill: 'UI/UX Design',
        result: {
          isValid: true,
          confidence: 0.92,
          evidence: { profileVerified: true, experience: 5 },
          errors: [],
          warnings: []
        },
        status: 'SUCCESS',
      },
      {
        userId: createdUsers[2].id,
        credentialId: null,
        source: 'github',
        skill: 'Polkadot Development',
        result: {
          isValid: true,
          confidence: 0.95,
          evidence: { repositories: 8, commits: 500, languages: ['Rust', 'TypeScript'] },
          errors: [],
          warnings: []
        },
        status: 'SUCCESS',
      }
    ];

    for (const logData of verificationLogs) {
      await prisma.verificationLog.create({
        data: logData,
      });
    }

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}
