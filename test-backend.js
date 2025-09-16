// Test script for the backend API
import { apiClient } from './lib/backend-integration';

async function testBackendAPI() {
  console.log('🧪 Testing Skill Badge Backend API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const health = await apiClient.getHealth();
    console.log('✅ Health check passed:', health.status);
    console.log('   Uptime:', Math.round(health.uptime), 'seconds');
    console.log('   Environment:', health.environment);
    console.log('');

    // Test 2: Create a test user
    console.log('2. Creating test user...');
    const testWallet = '0x' + Math.random().toString(16).substring(2, 42);
    const testDID = `did:polkadot:test-${Date.now()}`;
    
    const user = await apiClient.createUser({
      wallet: testWallet,
      did: testDID,
      name: 'Test User',
      bio: 'Test user for API testing',
    });
    console.log('✅ User created:', user.data.name);
    console.log('   Wallet:', user.data.wallet);
    console.log('   DID:', user.data.did);
    console.log('');

    // Test 3: Create a credential
    console.log('3. Creating test credential...');
    const credential = await apiClient.createCredential({
      skill: 'TypeScript Development',
      organization: 'Test Organization',
      issuer: testDID,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      metadata: {
        level: 'intermediate',
        description: 'Test credential for API testing',
        evidenceUrl: 'https://github.com/test/typescript-projects'
      }
    });
    console.log('✅ Credential created:', credential.data.skill);
    console.log('   Credential ID:', credential.data.id);
    console.log('   Organization:', credential.data.organization);
    console.log('');

    // Test 4: Get user credentials
    console.log('4. Fetching user credentials...');
    const credentials = await apiClient.getUserCredentials(testWallet);
    console.log('✅ Credentials fetched:', credentials.data.length, 'credential(s)');
    credentials.data.forEach((cred, index) => {
      console.log(`   ${index + 1}. ${cred.skill} (${cred.status})`);
    });
    console.log('');

    // Test 5: Get credential status
    console.log('5. Checking credential status...');
    const status = await apiClient.getCredentialStatus(credential.data.id);
    console.log('✅ Credential status:', status.data.status);
    console.log('');

    // Test 6: Get platform analytics
    console.log('6. Fetching platform analytics...');
    const analytics = await apiClient.getOverviewStats();
    console.log('✅ Analytics fetched:');
    console.log('   Total users:', analytics.data.users.total);
    console.log('   Total credentials:', analytics.data.credentials.total);
    console.log('   Valid credentials:', analytics.data.credentials.valid);
    console.log('   Verification success rate:', analytics.data.verifications.successRate.toFixed(1) + '%');
    console.log('');

    // Test 7: Get trending skills
    console.log('7. Fetching trending skills...');
    const trendingSkills = await apiClient.getTrendingSkills(5);
    console.log('✅ Trending skills:');
    trendingSkills.data.forEach((skill, index) => {
      console.log(`   ${index + 1}. ${skill.name} (${skill.count} credentials)`);
    });
    console.log('');

    console.log('🎉 All tests passed! Backend API is working correctly.');
    console.log('');
    console.log('📊 Test Summary:');
    console.log('- Health check: ✅');
    console.log('- User creation: ✅');
    console.log('- Credential creation: ✅');
    console.log('- Data retrieval: ✅');
    console.log('- Status checking: ✅');
    console.log('- Analytics: ✅');
    console.log('- Trending skills: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('1. Make sure the backend server is running on http://localhost:3001');
    console.error('2. Check that the database is properly set up');
    console.error('3. Verify environment variables are configured');
    console.error('4. Check backend logs for detailed error information');
  }
}

// Run the test
testBackendAPI();