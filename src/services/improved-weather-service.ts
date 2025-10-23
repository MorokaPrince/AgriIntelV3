import { BaseServiceClass } from './base-service';
import { ServiceResponse, ServiceConfig } from './types';
import connectDB from '../lib/mongodb';
import WeatherDataModelImport, { IWeatherData } from '../models/WeatherData';

// Weather data interfaces
export interface WeatherData {
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    condition: string;
    icon: string;
    lastUpdated: Date;
  };
  forecast: Array<{
    date: Date;
    maxTemp: number;
    minTemp: number;
    condition: string;
    icon: string;
    precipitation: number;
    humidity: number;
  }>;
  alerts?: Array<{
    type: 'rain' | 'storm' | 'heat' | 'cold' | 'wind';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface WeatherServiceConfig extends ServiceConfig {
  apiKey?: string;
  enableFallback?: boolean;
  cacheTimeout?: number;
}

export class ImprovedWeatherService extends BaseServiceClass {
  private apiKey: string;
  private enableFallback: boolean;
  private WeatherDataModel = WeatherDataModelImport;

  constructor(config: Partial<WeatherServiceConfig> = {}) {
    const weatherConfig: ServiceConfig = {
      baseUrl: 'https://api.weatherapi.com/v1',
      timeout: 15000,
      retries: 2,
      retryDelay: 2000,
      cache: {
        enabled: true,
        ttl: config.cacheTimeout || 30 * 60 * 1000, // 30 minutes default
        maxSize: 50,
      },
      ...config,
    };

    super(weatherConfig);

    this.apiKey = config.apiKey || process.env.WEATHER_API_KEY || '';
    this.enableFallback = config.enableFallback !== false; // Default to true

    if (!this.apiKey) {
      console.warn('WEATHER_API_KEY not found in environment variables. Weather service will use fallback data.');
    }
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'User-Agent': 'AgriIntelV3/1.0',
    };
  }

  async getWeatherData(location: string): Promise<ServiceResponse<WeatherData>> {
    const requestId = this.generateRequestId();

    // Use request deduplication for same location requests
    return this.dedupeRequest(
      `weather:${location}`,
      async () => {
        try {
          // Try to get from cache first
          if (this.config.cache?.enabled) {
            const cacheKey = this.generateCacheKey('weather', { location });
            const cachedData = this.cache.get(cacheKey) as WeatherData;
            if (cachedData) {
              return {
                success: true,
                data: cachedData,
                metadata: {
                  timestamp: new Date(),
                  requestId,
                  cached: true,
                  cacheAge: Date.now() - (this.cache.get(`${cacheKey}_timestamp`) as number || Date.now()),
                },
              };
            }
          }

          // Fetch from external API
          const response = await this.makeExternalRequest<WeatherData>(
            `/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(location)}&days=7&aqi=no&alerts=yes`
          );

          if (response.success && response.data) {
            // Cache the successful response
            if (this.config.cache?.enabled) {
              const cacheKey = this.generateCacheKey('weather', { location });
              this.cache.set(cacheKey, response.data, this.config.cache.ttl);
            }

            // Save to database if available (server-side only)
            if (typeof window === 'undefined' && this.WeatherDataModel) {
              await this.saveToDatabase(response.data).catch(error =>
                console.error('Failed to save weather data to database:', error)
              );
            }
          }

          return response;

        } catch (error) {
          // If external API fails and fallback is enabled, return mock data
          if (this.enableFallback) {
            console.warn(`Weather API failed for location ${location}, using fallback data`);
            return this.getFallbackWeatherData(location);
          }

          return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Weather service unavailable',
            metadata: {
              timestamp: new Date(),
              requestId,
            },
          };
        }
      }
    );
  }

  async getWeatherByCoordinates(lat: number, lon: number): Promise<ServiceResponse<WeatherData>> {
    const requestId = this.generateRequestId();

    return this.dedupeRequest(
      `weather:${lat},${lon}`,
      async () => {
        try {
          // Check cache first
          if (this.config.cache?.enabled) {
            const cacheKey = this.generateCacheKey('weather_coords', { lat, lon });
            const cachedData = this.cache.get(cacheKey) as WeatherData;
            if (cachedData) {
              return {
                success: true,
                data: cachedData,
                metadata: {
                  timestamp: new Date(),
                  requestId,
                  cached: true,
                  cacheAge: Date.now() - (this.cache.get(`${cacheKey}_timestamp`) as number || Date.now()),
                },
              };
            }
          }

          // Fetch from external API
          const response = await this.makeExternalRequest<WeatherData>(
            `/forecast.json?key=${this.apiKey}&q=${lat},${lon}&days=7&aqi=no&alerts=yes`
          );

          if (response.success && response.data) {
            // Cache the successful response
            if (this.config.cache?.enabled) {
              const cacheKey = this.generateCacheKey('weather_coords', { lat, lon });
              this.cache.set(cacheKey, response.data, this.config.cache.ttl);
            }
          }

          return response;

        } catch (error) {
          if (this.enableFallback) {
            console.warn(`Weather API failed for coordinates ${lat},${lon}, using fallback data`);
            return this.getFallbackWeatherData(`${lat},${lon}`);
          }

          return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Weather service unavailable',
            metadata: {
              timestamp: new Date(),
              requestId,
            },
          };
        }
      }
    );
  }

  private async makeExternalRequest<T>(endpoint: string): Promise<ServiceResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const requestId = this.generateRequestId();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 10000);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid weather API key');
        }
        if (response.status === 429) {
          throw new Error('Weather API rate limit exceeded');
        }
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      // Transform API response to our format
      const weatherData = this.transformWeatherApiResponse(data);

      return {
        success: true,
        data: weatherData as T,
        metadata: {
          timestamp: new Date(),
          requestId,
        },
      };

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          data: null,
          error: 'Weather API request timeout',
          metadata: {
            timestamp: new Date(),
            requestId,
          },
        };
      }

      throw error;
    }
  }

  private transformWeatherApiResponse(data: {
    location: {
      name: string;
      country: string;
      lat: number;
      lon: number;
    };
    current: {
      temp_c: number;
      humidity: number;
      wind_kph: number;
      wind_degree: number;
      pressure_mb: number;
      vis_km: number;
      uv: number;
      condition: {
        text: string;
        icon: string;
      };
    };
    forecast: {
      forecastday: Array<{
        date: string;
        day: {
          maxtemp_c: number;
          mintemp_c: number;
          condition: {
            text: string;
            icon: string;
          };
          totalprecip_mm: number;
          avghumidity: number;
        };
      }>;
    };
    alerts?: {
      alert?: Array<{
        category: string;
        desc: string;
        priority: string;
      }>;
    };
  }): WeatherData {
    return {
      location: {
        name: data.location.name,
        country: data.location.country,
        latitude: data.location.lat,
        longitude: data.location.lon,
      },
      current: {
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_kph,
        windDirection: data.current.wind_degree,
        pressure: data.current.pressure_mb,
        visibility: data.current.vis_km,
        uvIndex: data.current.uv,
        condition: data.current.condition.text,
        icon: data.current.condition.icon,
        lastUpdated: new Date(),
      },
      forecast: data.forecast.forecastday.map((day) => ({
        date: new Date(day.date),
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
        precipitation: day.day.totalprecip_mm,
        humidity: day.day.avghumidity,
      })),
      alerts: data.alerts?.alert?.map((alert) => ({
        type: this.mapAlertType(alert.category),
        message: alert.desc,
        severity: this.mapAlertSeverity(alert.priority),
      })) || [],
    };
  }

  private getFallbackWeatherData(location: string): ServiceResponse<WeatherData> {
    return {
      success: true,
      data: {
        location: {
          name: location,
          country: 'South Africa',
          latitude: -26.2041,
          longitude: 28.0473,
        },
        current: {
          temperature: 22,
          humidity: 65,
          windSpeed: 15,
          windDirection: 180,
          pressure: 1013,
          visibility: 10,
          uvIndex: 6,
          condition: 'Partly cloudy',
          icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          lastUpdated: new Date(),
        },
        forecast: [],
        alerts: [],
      },
      metadata: {
        timestamp: new Date(),
        requestId: this.generateRequestId(),
        cached: false,
      },
    };
  }

  private mapAlertType(category: string): 'rain' | 'storm' | 'heat' | 'cold' | 'wind' {
    const categoryMap: { [key: string]: 'rain' | 'storm' | 'heat' | 'cold' | 'wind' } = {
      'rain': 'rain',
      'storm': 'storm',
      'heat': 'heat',
      'cold': 'cold',
      'wind': 'wind',
    };
    return categoryMap[category.toLowerCase()] || 'storm';
  }

  private mapAlertSeverity(priority: string): 'low' | 'medium' | 'high' {
    const priorityMap: { [key: string]: 'low' | 'medium' | 'high' } = {
      'low': 'low',
      'moderate': 'medium',
      'high': 'high',
      'severe': 'high',
    };
    return priorityMap[priority.toLowerCase()] || 'medium';
  }

  private async saveToDatabase(weatherData: WeatherData): Promise<void> {
    try {
      await connectDB();

      const weatherRecord = new (this.WeatherDataModel!)({
        location: weatherData.location,
        current: weatherData.current,
        forecast: weatherData.forecast,
        alerts: weatherData.alerts,
      });

      await weatherRecord.save();
    } catch (error) {
      console.error('Failed to save weather data to database:', error);
      // Don't throw - this is not critical for the weather service
    }
  }

  // Get weather impact on livestock
  getLivestockImpact(weather: WeatherData): {
    risk: 'low' | 'medium' | 'high';
    recommendations: string[];
    alerts: string[];
  } {
    const recommendations: string[] = [];
    const alerts: string[] = [];
    let risk: 'low' | 'medium' | 'high' = 'low';

    const temp = weather.current.temperature;
    const humidity = weather.current.humidity;
    const windSpeed = weather.current.windSpeed;
    const uvIndex = weather.current.uvIndex;

    // Temperature impact
    if (temp > 35) {
      alerts.push('High temperature stress risk');
      recommendations.push('Provide shade and increase water supply');
      risk = 'high';
    } else if (temp < 5) {
      alerts.push('Cold stress risk');
      recommendations.push('Provide shelter and increase feed');
      risk = 'high';
    } else if (temp > 28) {
      recommendations.push('Monitor for heat stress');
      if (risk === 'low') risk = 'medium';
    }

    // Humidity impact
    if (humidity > 80 && temp > 25) {
      alerts.push('High humidity with heat increases disease risk');
      recommendations.push('Improve ventilation and monitor for respiratory issues');
      risk = 'high';
    }

    // Wind impact
    if (windSpeed > 50) {
      alerts.push('Strong winds may cause stress');
      recommendations.push('Provide windbreaks and secure loose objects');
      if (risk === 'low') risk = 'medium';
    }

    // UV impact
    if (uvIndex > 8) {
      recommendations.push('Provide UV protection for light-skinned animals');
    }

    // Weather alerts
    if (weather.alerts && weather.alerts.length > 0) {
      weather.alerts.forEach(alert => {
        alerts.push(`${alert.type.toUpperCase()}: ${alert.message}`);
        if (alert.severity === 'high') risk = 'high';
        else if (alert.severity === 'medium' && risk === 'low') risk = 'medium';
      });
    }

    return { risk, recommendations, alerts };
  }

  // Batch weather requests for multiple locations
  async getMultipleWeatherData(locations: string[]): Promise<ServiceResponse<WeatherData[]>> {
    const requestId = this.generateRequestId();

    try {
      const promises = locations.map(location => this.getWeatherData(location));
      const results = await Promise.allSettled(promises);

      const successful: WeatherData[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success && result.value.data) {
          successful.push(result.value.data);
        } else {
          errors.push(`Failed to fetch weather for ${locations[index]}: ${
            result.status === 'rejected'
              ? result.reason
              : result.value.error || 'Unknown error'
          }`);
        }
      });

      return {
        success: errors.length === 0,
        data: successful,
        error: errors.length > 0 ? errors.join('; ') : undefined,
        metadata: {
          timestamp: new Date(),
          requestId,
        },
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Batch weather request failed',
        metadata: {
          timestamp: new Date(),
          requestId,
        },
      };
    }
  }
}

// Export singleton instance
export const improvedWeatherService = new ImprovedWeatherService();