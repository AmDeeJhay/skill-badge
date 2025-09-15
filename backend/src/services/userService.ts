// User service
import { prisma } from '@/models/prisma';
import { User, CreateUserRequest, UpdateUserRequest, SocialLinks } from '@/types';
import { logger } from '@/utils/logger';
import { CustomError } from '@/middleware/errorHandler';

export class UserService {
  async createOrUpdateUser(userData: CreateUserRequest): Promise<User> {
    try {
      const user = await prisma.user.upsert({
        where: { wallet: userData.wallet },
        update: {
          did: userData.did,
          name: userData.name,
          bio: userData.bio,
          avatarUrl: userData.avatarUrl,
          links: userData.links as SocialLinks,
          updatedAt: new Date(),
        },
        create: {
          wallet: userData.wallet,
          did: userData.did,
          name: userData.name,
          bio: userData.bio,
          avatarUrl: userData.avatarUrl,
          links: userData.links as SocialLinks,
        },
      });

      logger.info('User created/updated', { userId: user.id, wallet: user.wallet });
      return user;
    } catch (error) {
      logger.error('Error creating/updating user:', error);
      throw new CustomError('Failed to create/update user', 500);
    }
  }

  async getUserByWallet(wallet: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { wallet },
        include: {
          credentials: {
            select: {
              id: true,
              skill: true,
              organization: true,
              status: true,
              issuanceDate: true,
              expirationDate: true,
            },
          },
        },
      });

      return user;
    } catch (error) {
      logger.error('Error fetching user by wallet:', error);
      throw new CustomError('Failed to fetch user', 500);
    }
  }

  async updateUser(wallet: string, updateData: UpdateUserRequest): Promise<User | null> {
    try {
      const user = await prisma.user.update({
        where: { wallet },
        data: {
          name: updateData.name,
          bio: updateData.bio,
          avatarUrl: updateData.avatarUrl,
          links: updateData.links as SocialLinks,
          updatedAt: new Date(),
        },
      });

      logger.info('User updated', { userId: user.id, wallet: user.wallet });
      return user;
    } catch (error) {
      if (error.code === 'P2025') {
        return null; // User not found
      }
      logger.error('Error updating user:', error);
      throw new CustomError('Failed to update user', 500);
    }
  }

  async deleteUser(wallet: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { wallet },
      });

      logger.info('User deleted', { wallet });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false; // User not found
      }
      logger.error('Error deleting user:', error);
      throw new CustomError('Failed to delete user', 500);
    }
  }

  async getUserStats(wallet: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { wallet },
        include: {
          credentials: {
            select: {
              status: true,
              skill: true,
              organization: true,
            },
          },
          verificationLogs: {
            select: {
              status: true,
              source: true,
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      const stats = {
        totalCredentials: user.credentials.length,
        validCredentials: user.credentials.filter(c => c.status === 'VALID').length,
        expiredCredentials: user.credentials.filter(c => c.status === 'EXPIRED').length,
        revokedCredentials: user.credentials.filter(c => c.status === 'REVOKED').length,
        totalVerifications: user.verificationLogs.length,
        successfulVerifications: user.verificationLogs.filter(v => v.status === 'SUCCESS').length,
        skills: [...new Set(user.credentials.map(c => c.skill))],
        organizations: [...new Set(user.credentials.map(c => c.organization))],
        reputation: user.reputation,
        isVerified: user.isVerified,
      };

      return stats;
    } catch (error) {
      logger.error('Error fetching user stats:', error);
      throw new CustomError('Failed to fetch user stats', 500);
    }
  }

  async getUsers(options: { page: number; limit: number; search?: string }) {
    try {
      const { page, limit, search } = options;
      const skip = (page - 1) * limit;

      const where = search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { wallet: { contains: search, mode: 'insensitive' as const } },
          { did: { contains: search, mode: 'insensitive' as const } },
        ],
      } : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            wallet: true,
            did: true,
            name: true,
            bio: true,
            avatarUrl: true,
            isVerified: true,
            reputation: true,
            createdAt: true,
            _count: {
              select: {
                credentials: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return { users, total };
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw new CustomError('Failed to fetch users', 500);
    }
  }
}
