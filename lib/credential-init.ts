import { credentialExpirationChecker } from '@/lib/credential-scheduler'

// Initialize the credential expiration checker when the application starts
export function initializeCredentialServices() {
  // Start the scheduled job for checking expired credentials
  credentialExpirationChecker.start()
  
  console.log('Credential services initialized')
}

// Call this function when the application starts
if (typeof window === 'undefined') {
  // Only run on server side
  initializeCredentialServices()
}
