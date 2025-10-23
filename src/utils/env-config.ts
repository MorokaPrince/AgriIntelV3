/**
 * Environment Configuration Utility
 * Provides centralized environment variable management with validation and type safety
 */

interface EnvironmentConfig {
  // Database
  mongodbUri: string;
  dbName: string;

  // Authentication
  nextAuthUrl: string;
  nextAuthSecret: string;

  // API Keys
  googleMapsApiKey: string;
  weatherApiKey: string;

  // Environment
  nodeEnv: 'development' | 'staging' | 'production' | 'test';
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
  isTest: boolean;

  // Features
  enableDebugLogs: boolean;
  enableBetaFeatures: boolean;
  enableAiAnalytics: boolean;
  enableMobileMoney: boolean;

  // Performance
  cacheTtl: number;
  rateLimitRequests: number;
  rateLimitWindow: number;

  // File Upload
  maxFileSize: number;
  allowedFileTypes: string[];

  // Multi-tenancy
  defaultCountry: string;
  supportedCountries: string[];

  // Security
  bcryptRounds: number;
  jwtExpiresIn: string;

  // Monitoring
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  enablePerformanceMonitoring: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  // Optional services
  sentryDsn?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

class EnvironmentError extends Error {
  constructor(message: string, public readonly key?: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

/**
 * Validates that a required environment variable is present
 */
function requireEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new EnvironmentError(`Missing required environment variable: ${key}`, key);
  }
  return value;
}

/**
 * Gets an environment variable with optional default value
 */
function getEnvVar(key: string, defaultValue?: string): string {
  return process.env[key] || defaultValue || '';
}

/**
 * Parses a boolean environment variable
 */
function getBooleanEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Parses a number environment variable
 */
function getNumberEnvVar(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parses a string array environment variable
 */
function getStringArrayEnvVar(key: string, defaultValue: string[] = []): string[] {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

/**
 * Environment configuration object with validation
 */
export const envConfig: EnvironmentConfig = {
  // Database
  mongodbUri: requireEnvVar('MONGODB_URI'),
  dbName: requireEnvVar('DB_NAME', 'AgriIntelV3'),

  // Authentication
  nextAuthUrl: requireEnvVar('NEXTAUTH_URL'),
  nextAuthSecret: requireEnvVar('NEXTAUTH_SECRET'),

  // API Keys
  googleMapsApiKey: requireEnvVar('GOOGLE_MAPS_API_KEY'),
  weatherApiKey: requireEnvVar('WEATHER_API_KEY'),

  // Environment
  nodeEnv: (getEnvVar('NODE_ENV', 'development') as EnvironmentConfig['nodeEnv']),
  isDevelopment: getEnvVar('NODE_ENV', 'development') === 'development',
  isStaging: getEnvVar('NODE_ENV', 'development') === 'staging',
  isProduction: getEnvVar('NODE_ENV', 'development') === 'production',
  isTest: getEnvVar('NODE_ENV', 'development') === 'test',

  // Features
  enableDebugLogs: getBooleanEnvVar('ENABLE_DEBUG_LOGS', false),
  enableBetaFeatures: getBooleanEnvVar('ENABLE_BETA_FEATURES', true),
  enableAiAnalytics: getBooleanEnvVar('ENABLE_AI_ANALYTICS', false),
  enableMobileMoney: getBooleanEnvVar('ENABLE_MOBILE_MONEY', true),

  // Performance
  cacheTtl: getNumberEnvVar('CACHE_TTL', 3600),
  rateLimitRequests: getNumberEnvVar('RATE_LIMIT_REQUESTS', 100),
  rateLimitWindow: getNumberEnvVar('RATE_LIMIT_WINDOW', 900000),

  // File Upload
  maxFileSize: getNumberEnvVar('MAX_FILE_SIZE', 10485760),
  allowedFileTypes: getStringArrayEnvVar('ALLOWED_FILE_TYPES', ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx']),

  // Multi-tenancy
  defaultCountry: getEnvVar('DEFAULT_COUNTRY', 'ZA'),
  supportedCountries: getStringArrayEnvVar('SUPPORTED_COUNTRIES', ['ZA', 'NG', 'KE', 'GH', 'TZ', 'UG', 'RW', 'MZ', 'BW', 'NA', 'ZW', 'LS', 'SZ', 'MW', 'ZM', 'CD', 'CG', 'AO', 'BJ', 'BF', 'BI', 'CV', 'CF', 'TD', 'KM', 'DJ', 'ER', 'ET', 'GA', 'GM', 'GN', 'GW', 'LR', 'LY', 'MG', 'ML', 'MR', 'MU', 'NE', 'SC', 'SL', 'SN', 'SO', 'SS', 'SD', 'TG', 'TN', 'EH', 'DZ', 'EG', 'LY', 'MA', 'SD', 'TN']),

  // Security
  bcryptRounds: getNumberEnvVar('BCRYPT_ROUNDS', 12),
  jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),

  // Monitoring
  enableAnalytics: getBooleanEnvVar('ENABLE_ANALYTICS', false),
  enableErrorTracking: getBooleanEnvVar('ENABLE_ERROR_TRACKING', false),
  enablePerformanceMonitoring: getBooleanEnvVar('ENABLE_PERFORMANCE_MONITORING', false),
  logLevel: (getEnvVar('LOG_LEVEL', 'info') as EnvironmentConfig['logLevel']),

  // Optional services
  sentryDsn: getEnvVar('SENTRY_DSN'),
  smtpHost: getEnvVar('SMTP_HOST'),
  smtpPort: getNumberEnvVar('SMTP_PORT', 587),
  smtpUser: getEnvVar('SMTP_USER'),
  smtpPass: getEnvVar('SMTP_PASS'),
};

/**
 * Validates the environment configuration
 */
export function validateEnvironmentConfig(): void {
  const errors: string[] = [];

  // Validate database configuration
  if (!envConfig.mongodbUri) {
    errors.push('MONGODB_URI is required');
  }

  if (!envConfig.dbName) {
    errors.push('DB_NAME is required');
  }

  // Validate authentication
  if (!envConfig.nextAuthUrl) {
    errors.push('NEXTAUTH_URL is required');
  }

  if (!envConfig.nextAuthSecret || envConfig.nextAuthSecret.length < 32) {
    errors.push('NEXTAUTH_SECRET must be at least 32 characters long');
  }

  // Validate API keys
  if (!envConfig.googleMapsApiKey) {
    errors.push('GOOGLE_MAPS_API_KEY is required');
  }

  if (!envConfig.weatherApiKey) {
    errors.push('WEATHER_API_KEY is required');
  }

  // Validate environment-specific settings
  if (envConfig.isProduction) {
    if (envConfig.enableDebugLogs) {
      console.warn('WARNING: Debug logs are enabled in production environment');
    }

    if (envConfig.enableBetaFeatures) {
      console.warn('WARNING: Beta features are enabled in production environment');
    }
  }

  if (errors.length > 0) {
    throw new EnvironmentError(`Environment configuration errors:\n${errors.join('\n')}`);
  }
}

/**
 * Gets environment-specific settings for logging
 */
export function getLogConfig() {
  return {
    level: envConfig.logLevel,
    enableConsole: envConfig.enableDebugLogs || envConfig.isDevelopment,
    enableFileLogging: envConfig.isProduction || envConfig.isStaging,
  };
}

/**
 * Gets database connection options based on environment
 */
export function getDatabaseConfig() {
  return {
    uri: envConfig.mongodbUri,
    dbName: envConfig.dbName,
    options: {
      maxPoolSize: envConfig.isProduction ? 10 : 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    },
  };
}

/**
 * Gets cache configuration based on environment
 */
export function getCacheConfig() {
  return {
    ttl: envConfig.cacheTtl,
    maxSize: envConfig.isProduction ? 1000 : 100,
    enableCompression: envConfig.isProduction,
  };
}

// Validate configuration on module load
if (typeof window === 'undefined') { // Only validate on server-side
  try {
    validateEnvironmentConfig();
  } catch (error) {
    console.error('Environment configuration validation failed:', error);
    // Don't throw in production to avoid crashes
    if (envConfig.isDevelopment) {
      throw error;
    }
  }
}

export default envConfig;