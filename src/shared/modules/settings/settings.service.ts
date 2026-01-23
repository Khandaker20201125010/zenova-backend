import logger from "../../helpers/logger";
import { prisma } from "../../helpers/prisma";
import { ApiResponse } from "../../types";


export class SettingsService {
  async getSettings(): Promise<ApiResponse> {
    try {
      const settings = await prisma.setting.findMany();

      // Transform to key-value object
      const settingsObject = settings.reduce((acc, setting) => {
        acc[setting.key] = {
          value: setting.value,
          type: setting.type,
        };
        return acc;
      }, {} as Record<string, any>);

      return {
        success: true,
        message: 'Settings retrieved successfully',
        data: settingsObject,
      };
    } catch (error) {
      logger.error('Get settings error:', error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<ApiResponse> {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key },
      });

      if (!setting) {
        return {
          success: false,
          message: 'Setting not found',
        };
      }

      return {
        success: true,
        message: 'Setting retrieved successfully',
        data: setting,
      };
    } catch (error) {
      logger.error('Get setting error:', error);
      throw error;
    }
  }

  async updateSetting(key: string, value: any, type: string = 'string'): Promise<ApiResponse> {
    try {
      const setting = await prisma.setting.upsert({
        where: { key },
        update: { value, type },
        create: { key, value, type },
      });

      return {
        success: true,
        message: 'Setting updated successfully',
        data: setting,
      };
    } catch (error) {
      logger.error('Update setting error:', error);
      throw error;
    }
  }

  async updateMultipleSettings(data: Record<string, any>): Promise<ApiResponse> {
    try {
      const updates = Object.entries(data).map(([key, value]) => {
        return prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value, type: typeof value },
        });
      });

      const updatedSettings = await prisma.$transaction(updates);

      return {
        success: true,
        message: 'Settings updated successfully',
        data: updatedSettings,
      };
    } catch (error) {
      logger.error('Update multiple settings error:', error);
      throw error;
    }
  }

  async getSystemSettings(): Promise<ApiResponse> {
    try {
      const defaultSettings = {
        site: {
          name: 'SaaS Platform',
          description: 'Professional SaaS/Business Platform',
          logo: '/logo.png',
          favicon: '/favicon.ico',
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          currency: 'USD',
        },
        email: {
          enabled: true,
          fromName: 'SaaS Platform',
          fromEmail: 'noreply@saasplatform.com',
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          smtpPass: '',
        },
        payment: {
          stripeEnabled: true,
          stripePublicKey: '',
          stripeSecretKey: '',
          currency: 'usd',
        },
        storage: {
          provider: 'cloudinary',
          cloudinaryCloudName: '',
          cloudinaryApiKey: '',
          cloudinaryApiSecret: '',
        },
        social: {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: '',
          github: '',
        },
        analytics: {
          googleAnalyticsId: '',
          facebookPixelId: '',
        },
        security: {
          requireEmailVerification: false,
          requireStrongPasswords: true,
          maxLoginAttempts: 5,
          sessionTimeout: 24,
        },
        features: {
          enableBlog: true,
          enableReviews: true,
          enableNotifications: true,
          enableTwoFactor: false,
        },
      };

      // Get from database
      const dbSettings = await prisma.setting.findMany();
      
      // Merge with defaults
      dbSettings.forEach(setting => {
        const keys = setting.key.split('.');
        let current = defaultSettings as any;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = setting.value;
      });

      return {
        success: true,
        message: 'System settings retrieved successfully',
        data: defaultSettings,
      };
    } catch (error) {
      logger.error('Get system settings error:', error);
      throw error;
    }
  }

  async updateSystemSettings(data: any): Promise<ApiResponse> {
    try {
      // Flatten nested object
      const flattened: Record<string, any> = {};
      
      const flatten = (obj: any, prefix = '') => {
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            flatten(obj[key], `${prefix}${key}.`);
          } else {
            flattened[`${prefix}${key}`] = obj[key];
          }
        }
      };

      flatten(data);

      // Update in database
      const updates = Object.entries(flattened).map(([key, value]) => {
        return prisma.setting.upsert({
          where: { key },
          update: { value, type: typeof value },
          create: { key, value, type: typeof value },
        });
      });

      await prisma.$transaction(updates);

      return {
        success: true,
        message: 'System settings updated successfully',
      };
    } catch (error) {
      logger.error('Update system settings error:', error);
      throw error;
    }
  }

  async getPublicSettings(): Promise<ApiResponse> {
    try {
      const publicSettings = await prisma.setting.findMany({
        where: {
          key: {
            in: [
              'site.name',
              'site.description',
              'site.logo',
              'site.theme',
              'site.currency',
              'social.facebook',
              'social.twitter',
              'social.instagram',
              'social.linkedin',
              'contact.email',
              'contact.phone',
              'contact.address',
            ],
          },
        },
      });

      const settingsObject = publicSettings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);

      return {
        success: true,
        message: 'Public settings retrieved successfully',
        data: settingsObject,
      };
    } catch (error) {
      logger.error('Get public settings error:', error);
      throw error;
    }
  }
}