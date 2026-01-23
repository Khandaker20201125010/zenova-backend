export interface UpdateSettingInput {
  key: string;
  value: any;
  type?: string;
}

export interface UpdateSystemSettingsInput {
  site?: {
    name?: string;
    description?: string;
    logo?: string;
    favicon?: string;
    theme?: string;
    language?: string;
    timezone?: string;
    currency?: string;
  };
  email?: {
    enabled?: boolean;
    fromName?: string;
    fromEmail?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
  };
  payment?: {
    stripeEnabled?: boolean;
    stripePublicKey?: string;
    stripeSecretKey?: string;
    currency?: string;
  };
  storage?: {
    provider?: string;
    cloudinaryCloudName?: string;
    cloudinaryApiKey?: string;
    cloudinaryApiSecret?: string;
  };
  social?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  };
  security?: {
    requireEmailVerification?: boolean;
    requireStrongPasswords?: boolean;
    maxLoginAttempts?: number;
    sessionTimeout?: number;
  };
  features?: {
    enableBlog?: boolean;
    enableReviews?: boolean;
    enableNotifications?: boolean;
    enableTwoFactor?: boolean;
  };
}