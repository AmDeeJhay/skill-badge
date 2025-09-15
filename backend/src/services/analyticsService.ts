// Analytics service
import { prisma } from '@/models/prisma';
import { logger } from '@/utils/logger';
import { CustomError } from '@/middleware/errorHandler';

export class AnalyticsService {
  async getOverviewStats(): Promise<any> {
    try {
      const [
        totalUsers,
        totalCredentials,
        validCredentials,
        expiredCredentials,
        revokedCredentials,
        totalVerifications,
        successfulVerifications,
        recentUsers,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.credential.count(),
        prisma.credential.count({ where: { status: 'VALID' } }),
        prisma.credential.count({ where: { status: 'EXPIRED' } }),
        prisma.credential.count({ where: { status: 'REVOKED' } }),
        prisma.verificationLog.count(),
        prisma.verificationLog.count({ where: { status: 'SUCCESS' } }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        }),
      ]);

      const verificationSuccessRate = totalVerifications > 0 
        ? (successfulVerifications / totalVerifications) * 100 
        : 0;

      return {
        users: {
          total: totalUsers,
          recent: recentUsers,
        },
        credentials: {
          total: totalCredentials,
          valid: validCredentials,
          expired: expiredCredentials,
          revoked: revokedCredentials,
          validityRate: totalCredentials > 0 ? (validCredentials / totalCredentials) * 100 : 0,
        },
        verifications: {
          total: totalVerifications,
          successful: successfulVerifications,
          successRate: verificationSuccessRate,
        },
        platform: {
          activeUsers: await this.getActiveUsersCount(),
          averageCredentialsPerUser: totalUsers > 0 ? totalCredentials / totalUsers : 0,
        }
      };
    } catch (error) {
      logger.error('Error fetching overview stats:', error);
      throw new CustomError('Failed to fetch overview statistics', 500);
    }
  }

  async getTrendingSkills(limit: number = 20): Promise<any[]> {
    try {
      const skills = await prisma.credential.groupBy({
        by: ['skill'],
        _count: {
          skill: true,
        },
        where: {
          status: 'VALID',
          createdAt: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
          }
        },
        orderBy: {
          _count: {
            skill: 'desc',
          },
        },
        take: limit,
      });

      return skills.map(skill => ({
        name: skill.skill,
        count: skill._count.skill,
        trend: 'up', // In a real implementation, this would calculate trend
      }));
    } catch (error) {
      logger.error('Error fetching trending skills:', error);
      throw new CustomError('Failed to fetch trending skills', 500);
    }
  }

  async getVerificationStats(): Promise<any> {
    try {
      const [
        totalVerifications,
        successfulVerifications,
        failedVerifications,
        pendingVerifications,
        errorVerifications,
        sourceStats,
      ] = await Promise.all([
        prisma.verificationLog.count(),
        prisma.verificationLog.count({ where: { status: 'SUCCESS' } }),
        prisma.verificationLog.count({ where: { status: 'FAILED' } }),
        prisma.verificationLog.count({ where: { status: 'PENDING' } }),
        prisma.verificationLog.count({ where: { status: 'ERROR' } }),
        prisma.verificationLog.groupBy({
          by: ['source'],
          _count: {
            source: true,
          },
          orderBy: {
            _count: {
              source: 'desc',
            },
          },
        }),
      ]);

      const successRate = totalVerifications > 0 
        ? (successfulVerifications / totalVerifications) * 100 
        : 0;

      return {
        total: totalVerifications,
        success: successfulVerifications,
        failed: failedVerifications,
        pending: pendingVerifications,
        error: errorVerifications,
        successRate,
        bySource: sourceStats.map(stat => ({
          source: stat.source,
          count: stat._count.source,
        })),
      };
    } catch (error) {
      logger.error('Error fetching verification stats:', error);
      throw new CustomError('Failed to fetch verification statistics', 500);
    }
  }

  async getUserGrowth(period: string): Promise<any> {
    try {
      const periodDays = this.getPeriodDays(period);
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

      const users = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Group by day
      const dailyGrowth = this.groupByDay(users, 'createdAt');
      
      // Calculate cumulative growth
      let cumulative = 0;
      const growthData = dailyGrowth.map(day => {
        cumulative += day.count;
        return {
          date: day.date,
          newUsers: day.count,
          totalUsers: cumulative,
        };
      });

      return {
        period,
        data: growthData,
        totalGrowth: users.length,
        averageDailyGrowth: users.length / periodDays,
      };
    } catch (error) {
      logger.error('Error fetching user growth:', error);
      throw new CustomError('Failed to fetch user growth data', 500);
    }
  }

  async getOrganizationStats(limit: number = 20): Promise<any[]> {
    try {
      const organizations = await prisma.credential.groupBy({
        by: ['organization'],
        _count: {
          organization: true,
        },
        where: {
          status: 'VALID',
        },
        orderBy: {
          _count: {
            organization: 'desc',
          },
        },
        take: limit,
      });

      return organizations.map(org => ({
        name: org.organization,
        credentialCount: org._count.organization,
        verifiedUsers: await this.getVerifiedUsersForOrganization(org.organization),
      }));
    } catch (error) {
      logger.error('Error fetching organization stats:', error);
      throw new CustomError('Failed to fetch organization statistics', 500);
    }
  }

  private async getActiveUsersCount(): Promise<number> {
    try {
      // Users who have created credentials or performed verifications in the last 30 days
      const activeUsers = await prisma.user.count({
        where: {
          OR: [
            {
              credentials: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  }
                }
              }
            },
            {
              verificationLogs: {
                some: {
                  timestamp: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  }
                }
              }
            }
          ]
        }
      });

      return activeUsers;
    } catch (error) {
      logger.error('Error calculating active users:', error);
      return 0;
    }
  }

  private async getVerifiedUsersForOrganization(organization: string): Promise<number> {
    try {
      const count = await prisma.user.count({
        where: {
          credentials: {
            some: {
              organization,
              status: 'VALID',
            }
          }
        }
      });

      return count;
    } catch (error) {
      logger.error('Error calculating verified users for organization:', error);
      return 0;
    }
  }

  private getPeriodDays(period: string): number {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  }

  private groupByDay(items: any[], dateField: string): any[] {
    const grouped: { [key: string]: number } = {};
    
    items.forEach(item => {
      const date = new Date(item[dateField]).toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
