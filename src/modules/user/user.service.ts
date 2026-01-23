import {
  UpdateProfileInput,
  UpdateEmailInput,
  ToggleTwoFactorInput,
  UserQueryParams,
} from "./user.interface";
import bcrypt from "bcryptjs";
import { Role, UserStatus } from "@prisma/client";
import { ApiResponse } from "../../shared/types";
import { prisma } from "../../shared/helpers/prisma";
import logger from "../../shared/helpers/logger";

export class UserService {
  async getProfile(userId: string): Promise<ApiResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          status: true,
          phone: true,
          company: true,
          position: true,
          bio: true,
          emailVerified: true,
          emailVerifiedAt: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          subscription: {
            select: {
              plan: true,
              status: true,
              currentPeriodEnd: true,
              trialEnd: true,
            },
          },
        },
      });

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        message: "Profile retrieved successfully",
        data: user,
      };
    } catch (error: any) {
      logger.error("Get profile error:", error);
      throw error;
    }
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileInput,
  ): Promise<ApiResponse> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          phone: true,
          company: true,
          position: true,
          bio: true,
          updatedAt: true,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId,
          action: "UPDATE_PROFILE",
          entity: "USER",
          entityId: userId,
        },
      });

      return {
        success: true,
        message: "Profile updated successfully",
        data: user,
      };
    } catch (error: any) {
      logger.error("Update profile error:", error);
      throw error;
    }
  }

  async updateEmail(
    userId: string,
    data: UpdateEmailInput,
  ): Promise<ApiResponse> {
    try {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== userId) {
        return {
          success: false,
          message: "Email already in use",
        };
      }

      // Verify current password
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const isValidPassword = await bcrypt.compare(
        data.currentPassword,
        user.password,
      );

      if (!isValidPassword) {
        return {
          success: false,
          message: "Current password is incorrect",
        };
      }

      // Update email
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          email: data.email,
          emailVerified: false,
          emailVerifiedAt: null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          updatedAt: true,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId,
          action: "UPDATE_EMAIL",
          entity: "USER",
          entityId: userId,
          details: { oldEmail: user.email, newEmail: data.email },
        },
      });

      return {
        success: true,
        message: "Email updated successfully. Please verify your new email.",
        data: updatedUser,
      };
    } catch (error: any) {
      logger.error("Update email error:", error);
      throw error;
    }
  }

  async toggleTwoFactor(
    userId: string,
    data: ToggleTwoFactorInput,
  ): Promise<ApiResponse> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: data.enabled },
        select: {
          id: true,
          twoFactorEnabled: true,
          updatedAt: true,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId,
          action: data.enabled ? "ENABLE_2FA" : "DISABLE_2FA",
          entity: "USER",
          entityId: userId,
        },
      });

      return {
        success: true,
        message: `Two-factor authentication ${data.enabled ? "enabled" : "disabled"} successfully`,
        data: user,
      };
    } catch (error: any) {
      logger.error("Toggle 2FA error:", error);
      throw error;
    }
  }

  async uploadAvatar(userId: string, avatarUrl: string): Promise<ApiResponse> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
        select: {
          id: true,
          avatar: true,
          updatedAt: true,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId,
          action: "UPLOAD_AVATAR",
          entity: "USER",
          entityId: userId,
        },
      });

      return {
        success: true,
        message: "Avatar uploaded successfully",
        data: user,
      };
    } catch (error: any) {
      logger.error("Upload avatar error:", error);
      throw error;
    }
  }

  async getUsers(params: UserQueryParams): Promise<ApiResponse> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        role,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = params;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { company: { contains: search, mode: "insensitive" } },
        ];
      }

      if (role) {
        where.role = role as Role;
      }

      if (status) {
        where.status = status as UserStatus;
      }

      // Get users
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
            status: true,
            phone: true,
            company: true,
            position: true,
            lastLoginAt: true,
            createdAt: true,
            subscription: {
              select: {
                plan: true,
                status: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Users retrieved successfully",
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error: any) {
      logger.error("Get users error:", error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<ApiResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          status: true,
          phone: true,
          company: true,
          position: true,
          bio: true,
          emailVerified: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          subscription: {
            select: {
              plan: true,
              status: true,
              currentPeriodStart: true,
              currentPeriodEnd: true,
              trialEnd: true,
            },
          },
          _count: {
            select: {
              orders: true,
              reviews: true,
              activities: true,
            },
          },
        },
      });

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        message: "User retrieved successfully",
        data: user,
      };
    } catch (error: any) {
      logger.error("Get user by ID error:", error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, status: string): Promise<ApiResponse> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { status: status as UserStatus },
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          updatedAt: true,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId,
          action: "UPDATE_STATUS",
          entity: "USER",
          entityId: userId,
          details: { status },
        },
      });

      return {
        success: true,
        message: "User status updated successfully",
        data: user,
      };
    } catch (error: any) {
      logger.error("Update user status error:", error);
      throw error;
    }
  }

  async updateUserRole(userId: string, role: string): Promise<ApiResponse> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { role: role as Role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          updatedAt: true,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId,
          action: "UPDATE_ROLE",
          entity: "USER",
          entityId: userId,
          details: { role },
        },
      });

      return {
        success: true,
        message: "User role updated successfully",
        data: user,
      };
    } catch (error: any) {
      logger.error("Update user role error:", error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Soft delete by updating status
      await prisma.user.update({
        where: { id: userId },
        data: { status: "INACTIVE" as UserStatus },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId,
          action: "DELETE_USER",
          entity: "USER",
          entityId: userId,
        },
      });

      return {
        success: true,
        message: "User deleted successfully",
      };
    } catch (error: any) {
      logger.error("Delete user error:", error);
      throw error;
    }
  }

  async getUserStats(userId: string): Promise<ApiResponse> {
    try {
      const [
        ordersCount,
        totalSpent,
        reviewsCount,
        favoritesCount,
        activitiesCount,
      ] = await Promise.all([
        prisma.order.count({ where: { userId } }),
        prisma.order.aggregate({
          where: { userId, paymentStatus: "PAID" },
          _sum: { total: true },
        }),
        prisma.review.count({ where: { userId } }),
        prisma.favorite.count({ where: { userId } }),
        prisma.activity.count({ where: { userId } }),
      ]);

      const stats = {
        orders: ordersCount,
        totalSpent: totalSpent._sum.total || 0,
        reviews: reviewsCount,
        favorites: favoritesCount,
        activities: activitiesCount,
      };

      return {
        success: true,
        message: "User stats retrieved successfully",
        data: stats,
      };
    } catch (error: any) {
      logger.error("Get user stats error:", error);
      throw error;
    }
  }

  async getActivities(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ApiResponse> {
    try {
      const skip = (page - 1) * limit;

      const [activities, total] = await Promise.all([
        prisma.activity.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            action: true,
            entity: true,
            entityId: true,
            details: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
          },
        }),
        prisma.activity.count({ where: { userId } }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Activities retrieved successfully",
        data: activities,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error: any) {
      logger.error("Get activities error:", error);
      throw error;
    }
  }
}
