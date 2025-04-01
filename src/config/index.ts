/**
 * Application Configuration
 * Centralized configuration for the EventraAI application
 * 
 * This file manages environment-specific settings and feature flags.
 */

// Define the environment
const ENV = process.env.NODE_ENV || 'development';

// Base configuration object
const config = {
  appName: 'EventraAI',
  isDevelopment: ENV === 'development',
  isProduction: ENV === 'production',
  isTest: ENV === 'test',
  
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
    timeout: 30000, // 30 seconds
    retries: 3,
  },
  
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY, // Only available server-side
    cookieName: 'eventra-auth', 
  },
  
  // Feature Flags
  features: {
    analytics: true,
    aiSuggestions: true,
    realTimeUpdates: process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',
    teamCollaboration: true,
    fileUploads: true,
  },
  
  // Subscription Tiers
  subscriptions: {
    tiers: {
      free: {
        eventLimit: 3,
        guestLimit: 50,
        aiCallLimit: 5,
      },
      starter: {
        eventLimit: 10,
        guestLimit: 100,
        aiCallLimit: 20,
      },
      pro: {
        eventLimit: null, // Unlimited
        guestLimit: 500,
        aiCallLimit: 100,
      },
      business: {
        eventLimit: null, // Unlimited
        guestLimit: null, // Unlimited
        aiCallLimit: 500,
      },
      enterprise: {
        eventLimit: null, // Unlimited
        guestLimit: null, // Unlimited
        aiCallLimit: 9999, // Essentially unlimited
      },
    },
    
    // Stripe configuration
    stripe: {
      publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      products: {
        starter: process.env.STARTER_PLAN_PRICE_ID,
        pro: process.env.PRO_PLAN_PRICE_ID,
        business: process.env.BUSINESS_PLAN_PRICE_ID,
        enterprise: process.env.ENTERPRISE_PLAN_PRICE_ID,
      },
    },
  },
  
  // AI Service Configuration
  ai: {
    provider: process.env.AI_PROVIDER || 'openai', // 'openai', 'azure', etc.
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-4',
    maxTokens: 4000,
    temperature: 0.7,
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || (ENV === 'production' ? 'error' : 'debug'),
    enableConsole: true,
    enableFile: ENV === 'production',
  },
  
  // Email Configuration
  email: {
    from: process.env.EMAIL_FROM || 'noreply@eventra.ai',
    service: process.env.EMAIL_SERVICE || 'sendgrid',
    apiKey: process.env.EMAIL_API_KEY,
  },
  
  // Analytics Configuration
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
    enableTracking: ENV === 'production',
  },
  
  // File Storage Configuration
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'supabase', // 'supabase', 's3', etc.
    bucket: process.env.STORAGE_BUCKET || 'event-files',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/csv'],
  },
};

// Environment-specific overrides
const envConfig = {
  development: {
    api: {
      baseUrl: 'http://localhost:3000',
    },
    logging: {
      level: 'debug',
    },
  },
  test: {
    logging: {
      level: 'error',
    },
    features: {
      analytics: false,
    },
  },
  production: {
    logging: {
      level: 'warn',
    },
  },
};

// Merge the base config with environment-specific config
const mergedConfig = {
  ...config,
  ...(envConfig[ENV as keyof typeof envConfig] || {}),
};

export default mergedConfig;
