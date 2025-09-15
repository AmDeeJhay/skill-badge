// Background jobs for credential management
import cron from 'node-cron';
import { prisma } from '@/models/prisma';
import { logger } from '@/utils/logger';
import { CredentialStatus } from '@/types';

export class BackgroundJobs {
  private static instance: BackgroundJobs;
  private isRunning = false;

  static getInstance(): BackgroundJobs {
    if (!BackgroundJobs.instance) {
      BackgroundJobs.instance = new BackgroundJobs();
    }
    return BackgroundJobs.instance;
  }

  start(): void {
    if (this.isRunning) {
      logger.info('Background jobs are already running');
      return;
    }

    // Daily credential expiry check at midnight
    cron.schedule('0 0 * * *', async () => {
      logger.info('Running daily credential expiry check...');
      await this.checkExpiredCredentials();
    });

    // Hourly verification retry job
    cron.schedule('0 * * * *', async () => {
      logger.info('Running verification retry job...');
      await this.retryFailedVerifications();
    });

    // Daily analytics calculation at 1 AM
    cron.schedule('0 1 * * *', async () => {
      logger.info('Running analytics calculation job...');
      await this.calculateAnalytics();
    });

    // Weekly data cleanup on Sundays at 2 AM
    cron.schedule('0 2 * * 0', async () => {
      logger.info('Running data cleanup job...');
      await this.cleanupOldData();
    });

    // Run initial checks
    this.checkExpiredCredentials();
    this.calculateAnalytics();

    this.isRunning = true;
    logger.info('Background jobs started');
  }

  stop(): void {
    cron.destroy();
    this.isRunning = false;
    logger.info('Background jobs stopped');
  }

  private async checkExpiredCredentials(): Promise<void> {
    try {
      const expiredCredentials = await prisma.credential.findMany({
        where: {
          expirationDate: { lt: new Date() },
          status: CredentialStatus.VALID,
        },
      });

      if (expiredCredentials.length > 0) {
        await prisma.credential.updateMany({
          where: {
            id: { in: expiredCredentials.map(c => c.id) },
          },
          data: { status: CredentialStatus.EXPIRED },
        });

        logger.info(`Marked ${expiredCredentials.length} credentials as expired`);
      } else {
        logger.info('No expired credentials found');
      }
    } catch (error) {
      logger.error('Error checking expired credentials:', error);
    }
  }

  private async retryFailedVerifications(): Promise<void> {
    try {
      const failedVerifications = await prisma.verificationLog.findMany({
        where: {
          status: 'ERROR',
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        take: 10, // Limit retries
      });

      for (const verification of failedVerifications) {
        try {
          // Retry verification logic would go here
          logger.info(`Retrying verification ${verification.id}`);
          
          // Update status to pending for retry
          await prisma.verificationLog.update({
            where: { id: verification.id },
            data: { status: 'PENDING' },
          });
        } catch (error) {
          logger.error(`Failed to retry verification ${verification.id}:`, error);
        }
      }

      if (failedVerifications.length > 0) {
        logger.info(`Retried ${failedVerifications.length} failed verifications`);
      }
    } catch (error) {
      logger.error('Error retrying failed verifications:', error);
    }
  }

  private async calculateAnalytics(): Promise<void> {
    try {
      // Calculate and store analytics metrics
      const [
        totalUsers,
        totalCredentials,
        validCredentials,
        totalVerifications,
        successfulVerifications,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.credential.count(),
        prisma.credential.count({ where: { status: CredentialStatus.VALID } }),
        prisma.verificationLog.count(),
        prisma.verificationLog.count({ where: { status: 'SUCCESS' } }),
      ]);

      const metrics = [
        { metric: 'total_users', value: totalUsers },
        { metric: 'total_credentials', value: totalCredentials },
        { metric: 'valid_credentials', value: validCredentials },
        { metric: 'total_verifications', value: totalVerifications },
        { metric: 'successful_verifications', value: successfulVerifications },
        { metric: 'credential_validity_rate', value: totalCredentials > 0 ? (validCredentials / totalCredentials) * 100 : 0 },
        { metric: 'verification_success_rate', value: totalVerifications > 0 ? (successfulVerifications / totalVerifications) * 100 : 0 },
      ];

      // Store metrics in analytics table
      await Promise.all(
        metrics.map(metric =>
          prisma.analytics.create({
            data: {
              metric: metric.metric,
              value: metric.value,
              timestamp: new Date(),
            },
          })
        )
      );

      logger.info('Analytics metrics calculated and stored');
    } catch (error) {
      logger.error('Error calculating analytics:', error);
    }
  }

  private async cleanupOldData(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      // Clean up expired sessions
      const expiredSessions = await prisma.userSession.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });

      // Clean up old verification logs (keep last 90 days)
      const oldLogs = await prisma.verificationLog.deleteMany({
        where: {
          timestamp: { lt: ninetyDaysAgo },
        },
      });

      // Clean up old analytics data (keep last 30 days)
      const oldAnalytics = await prisma.analytics.deleteMany({
        where: {
          timestamp: { lt: thirtyDaysAgo },
        },
      });

      logger.info('Data cleanup completed', {
        expiredSessions: expiredSessions.count,
        oldLogs: oldLogs.count,
        oldAnalytics: oldAnalytics.count,
      });
    } catch (error) {
      logger.error('Error during data cleanup:', error);
    }
  }

  // Manual trigger methods for testing
  async triggerExpiryCheck(): Promise<number> {
    await this.checkExpiredCredentials();
    const expiredCount = await prisma.credential.count({
      where: { status: CredentialStatus.EXPIRED },
    });
    return expiredCount;
  }

  async triggerAnalyticsCalculation(): Promise<void> {
    await this.calculateAnalytics();
  }

  async triggerDataCleanup(): Promise<void> {
    await this.cleanupOldData();
  }
}

// Export singleton instance
export const backgroundJobs = BackgroundJobs.getInstance();
