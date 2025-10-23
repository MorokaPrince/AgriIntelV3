// Service layer exports - centralized service access

// Types and interfaces
export * from './types';

// Base service class
export { BaseServiceClass } from './base-service';

// Service factory and dependency injection
export {
  ServiceFactory,
  ServiceContainer,
  getServiceFactory,
  getApiService,
  getWeatherService,
  initializeServices,
  createServiceContainer,
  type ServiceFactoryConfig,
} from './service-factory';

// Improved services (consolidated and enhanced)
export {
  ImprovedApiService,
  improvedApiService,
  type Animal,
  type HealthRecord,
  type FinancialRecord,
  type FeedRecord,
  type BreedingRecord,
  type RFIDRecord,
  type TaskRecord,
} from './improved-api-service';

export {
  ImprovedWeatherService,
  improvedWeatherService,
  type WeatherData,
  type WeatherServiceConfig,
} from './improved-weather-service';

// Legacy services (deprecated - use improved versions above)
export { apiService } from './apiService';
export { enhancedApiService } from './enhancedApiService';
export { weatherService } from './weatherService';

// Convenience re-exports for common use cases
import { improvedApiService } from './improved-api-service';
import { improvedWeatherService } from './improved-weather-service';
import { ServiceFactory } from './service-factory';

export const services = {
  api: improvedApiService,
  weather: improvedWeatherService,
  factory: ServiceFactory.getInstance(),
} as const;

// Service health monitoring utilities
export const serviceHealth = {
  /**
   * Check health of all services
   */
  async checkAll(): Promise<{
    api: boolean;
    weather: boolean;
    overall: 'healthy' | 'degraded' | 'unhealthy';
  }> {
    return ServiceFactory.getInstance().getHealthStatus();
  },

  /**
   * Clear all service caches
   */
  clearAllCaches(): void {
    return ServiceFactory.getInstance().clearAllCaches();
  },

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    api?: { size: number; maxSize: number; hitRate: number };
    weather?: { size: number; maxSize: number; hitRate: number };
  } {
    return ServiceFactory.getInstance().getCacheStats();
  },
};