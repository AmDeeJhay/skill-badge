import cron from 'node-cron'
import { credentialManager } from '@/lib/w3c-vc'

// Scheduled job to check for expired credentials daily at midnight
export class CredentialExpirationChecker {
  private static instance: CredentialExpirationChecker
  private isRunning = false

  static getInstance(): CredentialExpirationChecker {
    if (!CredentialExpirationChecker.instance) {
      CredentialExpirationChecker.instance = new CredentialExpirationChecker()
    }
    return CredentialExpirationChecker.instance
  }

  start(): void {
    if (this.isRunning) {
      console.log('Credential expiration checker is already running')
      return
    }

    // Run daily at midnight
    cron.schedule('0 0 * * *', async () => {
      console.log('Running daily credential expiration check...')
      await this.checkExpiredCredentials()
    })

    // Also run immediately on startup for testing
    this.checkExpiredCredentials()

    this.isRunning = true
    console.log('Credential expiration checker started')
  }

  stop(): void {
    cron.destroy()
    this.isRunning = false
    console.log('Credential expiration checker stopped')
  }

  private async checkExpiredCredentials(): Promise<void> {
    try {
      const expiredCredentialIds = await credentialManager.checkExpiredCredentials()
      
      if (expiredCredentialIds.length > 0) {
        console.log(`Found ${expiredCredentialIds.length} expired credentials:`, expiredCredentialIds)
        
        // In a real implementation, you might want to:
        // 1. Send notifications to users
        // 2. Update external systems
        // 3. Log to audit trail
        // 4. Trigger re-verification workflows
        
        for (const credentialId of expiredCredentialIds) {
          console.log(`Credential ${credentialId} has expired`)
          // Add any additional processing here
        }
      } else {
        console.log('No expired credentials found')
      }
    } catch (error) {
      console.error('Error checking expired credentials:', error)
    }
  }

  // Manual trigger for testing
  async triggerCheck(): Promise<string[]> {
    return await credentialManager.checkExpiredCredentials()
  }
}

// Export singleton instance
export const credentialExpirationChecker = CredentialExpirationChecker.getInstance()
