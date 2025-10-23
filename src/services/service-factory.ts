import { ImprovedApiService } from './improved-api-service';
import { ImprovedWeatherService } from './improved-weather-service';
import { BaseServiceClass } from './base-service';
import { ServiceConfig } from './types';

// Service factory configuration
export interface ServiceFactoryConfig {
  api?: Partial<ServiceConfig>;
  weather?: Partial<ServiceConfig>;
  global?: Partial<ServiceConfig>;
}

// Service instances
let apiServiceInstance: ImprovedApiService | null = null;
let weatherServiceInstance: ImprovedWeatherService | null = null;
let globalConfig: ServiceConfig | null = null;

/**
 * Service Factory for creating and managing service instances
 * Implements singleton pattern for consistent service instances across the application
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private config: ServiceFactoryConfig;

  private constructor(config: ServiceFactoryConfig = {}) {
    this.config = config;
  }

  /**
   * Get singleton instance of ServiceFactory
   */
  public static getInstance(config?: ServiceFactoryConfig): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory(config);
    } else if (config) {
      // Update configuration if provided
      ServiceFactory.instance.config = { ...ServiceFactory.instance.config, ...config };
    }

    return ServiceFactory.instance;
  }

  /**
   * Get API service instance
   */
  public getApiService(): ImprovedApiService {
    if (!apiServiceInstance) {
      const config = { ...this.config.global, ...this.config.api };
      apiServiceInstance = new ImprovedApiService(config);
    }
    return apiServiceInstance;
  }

  /**
   * Get Weather service instance
   */
  public getWeatherService(): ImprovedWeatherService {
    if (!weatherServiceInstance) {
      const config = { ...this.config.global, ...this.config.weather };
      weatherServiceInstance = new ImprovedWeatherService(config);
    }
    return weatherServiceInstance;
  }

  /**
   * Reset all service instances (useful for testing)
   */
  public reset(): void {
    apiServiceInstance = null;
    weatherServiceInstance = null;
    globalConfig = null;
  }

  /**
   * Update global configuration for all services
   */
  public updateConfig(newConfig: ServiceFactoryConfig): void {
    this.config = { ...this.config, ...newConfig };

    // Recreate instances if they exist to apply new config
    if (apiServiceInstance) {
      const config = { ...this.config.global, ...this.config.api };
      Object.assign(apiServiceInstance, new ImprovedApiService(config));
    }

    if (weatherServiceInstance) {
      const config = { ...this.config.global, ...this.config.weather };
      Object.assign(weatherServiceInstance, new ImprovedWeatherService(config));
    }
  }

  /**
   * Get health status of all services
   */
  public async getHealthStatus(): Promise<{
    api: boolean;
    weather: boolean;
    overall: 'healthy' | 'degraded' | 'unhealthy';
  }> {
    const results = await Promise.allSettled([
      this.getApiService().healthCheck(),
      this.getWeatherService().healthCheck(),
    ]);

    const apiHealth = results[0].status === 'fulfilled' && results[0].value.success;
    const weatherHealth = results[1].status === 'fulfilled' && results[1].value.success;

    const overall = (apiHealth && weatherHealth) ? 'healthy' :
                   (apiHealth || weatherHealth) ? 'degraded' : 'unhealthy';

    return {
      api: apiHealth,
      weather: weatherHealth,
      overall,
    };
  }

  /**
   * Clear all caches across services
   */
  public clearAllCaches(): void {
    if (apiServiceInstance) {
      apiServiceInstance.clearCache();
    }
    if (weatherServiceInstance) {
      weatherServiceInstance.clearCache();
    }
  }

  /**
   * Get cache statistics from all services
   */
  public getCacheStats(): {
    api?: { size: number; maxSize: number; hitRate: number };
    weather?: { size: number; maxSize: number; hitRate: number };
  } {
    return {
      api: apiServiceInstance?.getCacheStats(),
      weather: weatherServiceInstance?.getCacheStats(),
    };
  }
}

/**
 * Convenience function to get service factory instance
 */
export function getServiceFactory(config?: ServiceFactoryConfig): ServiceFactory {
  return ServiceFactory.getInstance(config);
}

/**
 * Convenience functions for quick access to services
 */
export function getApiService(): ImprovedApiService {
  return getServiceFactory().getApiService();
}

export function getWeatherService(): ImprovedWeatherService {
  return getServiceFactory().getWeatherService();
}

/**
 * Initialize services with configuration
 * Call this during application startup
 */
export function initializeServices(config: ServiceFactoryConfig = {}): ServiceFactory {
  const factory = ServiceFactory.getInstance(config);

  // Warm up services by performing health checks
  factory.getApiService().healthCheck().catch(error => {
    console.warn('API service health check failed during initialization:', error);
  });

  factory.getWeatherService().healthCheck().catch(error => {
    console.warn('Weather service health check failed during initialization:', error);
  });

  return factory;
}

/**
 * Service container for dependency injection
 */
export class ServiceContainer {
  private services = new Map<string, BaseServiceClass>();
  private factory: ServiceFactory;

  constructor(factory: ServiceFactory) {
    this.factory = factory;
  }

  /**
   * Register a service instance
   */
  register<T extends BaseServiceClass>(name: string, service: T): void {
    this.services.set(name, service);
  }

  /**
   * Get a registered service
   */
  get<T extends BaseServiceClass>(name: string): T | undefined {
    return this.services.get(name) as T;
  }

  /**
   * Get API service (convenience method)
   */
  getApiService(): ImprovedApiService {
    return this.factory.getApiService();
  }

  /**
   * Get Weather service (convenience method)
   */
  getWeatherService(): ImprovedWeatherService {
    return this.factory.getWeatherService();
  }

  /**
   * Clear all registered service caches
   */
  clearAllCaches(): void {
    this.services.forEach(service => {
      service.clearCache();
    });
  }

  /**
   * Get health status of all registered services
   */
  async getHealthStatus(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const [name, service] of this.services) {
      try {
        const result = await service.healthCheck();
        health[name] = result.success;
      } catch {
        health[name] = false;
      }
    }

    return health;
  }
}

/**
 * Create a service container with default services
 */
export function createServiceContainer(config?: ServiceFactoryConfig): ServiceContainer {
  const factory = ServiceFactory.getInstance(config);
  const container = new ServiceContainer(factory);

  // Register default services
  container.register('api', factory.getApiService());
  container.register('weather', factory.getWeatherService());

  return container;
}