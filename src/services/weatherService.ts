import WeatherDataModelImport, { IWeatherData } from '../models/WeatherData';

// Get the model from the import
const WeatherDataModel = WeatherDataModelImport;

// Enhanced TypeScript interfaces for better type safety
export interface WeatherLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface WeatherCurrent {
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
}

export interface WeatherForecast {
  date: Date;
  maxTemp: number;
  minTemp: number;
  condition: string;
  icon: string;
  precipitation: number;
  humidity: number;
}

export interface WeatherAlert {
  type: 'rain' | 'storm' | 'heat' | 'cold' | 'wind';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface WeatherData {
  location: WeatherLocation;
  current: WeatherCurrent;
  forecast: WeatherForecast[];
  alerts?: WeatherAlert[];
}

export interface LivestockImpact {
  risk: 'low' | 'medium' | 'high';
  recommendations: string[];
  alerts: string[];
}

// Raw API response interfaces for better type safety
interface WeatherApiLocation {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

interface WeatherApiCurrent {
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
}

interface WeatherApiForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    condition: { text: string; icon: string };
    totalprecip_mm: number;
    avghumidity: number;
  };
}

interface WeatherApiAlert {
  category: string;
  desc: string;
  priority: string;
}

interface WeatherApiResponse {
  location: WeatherApiLocation;
  current: WeatherApiCurrent;
  forecast: {
    forecastday: WeatherApiForecastDay[];
  };
  alerts?: {
    alert: WeatherApiAlert[];
  };
}

export class WeatherService {
  private apiKey: string;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000; // 1 second

  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('WEATHER_API_KEY not found in environment variables. Weather service will use fallback data.');
    }
  }

  async getWeatherData(location: string): Promise<WeatherData | null> {
    try {
      // Validate API key
      if (!this.apiKey || this.apiKey === 'your-secure-weather-api-key' || this.apiKey === 'demo_weather_api_key_12345') {
        console.warn('Weather API key is not configured properly, using fallback data');
        return this.getFallbackWeatherData(location);
      }

      // Use retry mechanism for API calls
      return await this.fetchWeatherWithRetry(location);
    } catch (error) {
      console.error('Weather service error:', error);
      return this.getFallbackWeatherData(location);
    }
  }

  private async fetchWeatherWithRetry(location: string, attempt: number = 1): Promise<WeatherData | null> {
    try {
      console.log(`Fetching weather data for location: ${location} (attempt ${attempt})`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(location)}&days=7&aqi=no&alerts=yes`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'AgriIntelV3/1.0'
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn(`Weather API authentication error (${response.status}), using fallback data`);
          return this.getFallbackWeatherData(location);
        } else if (response.status >= 500 && attempt < this.maxRetries) {
          console.warn(`Weather API server error (${response.status}), retrying in ${this.retryDelay}ms...`);
          await this.delay(this.retryDelay * attempt);
          return this.fetchWeatherWithRetry(location, attempt + 1);
        } else {
          console.error(`Weather API error: ${response.status} - ${response.statusText}`);
          return this.getFallbackWeatherData(location);
        }
      }

      const data: WeatherApiResponse = await response.json();
      console.log(`Successfully fetched weather data for ${data.location.name}`);

      const weatherData = this.transformApiResponse(data);

      // Save to cache only on server side
      if (typeof window === 'undefined') {
        await this.saveToCache(weatherData);
      }

      return weatherData;
    } catch (error) {
      if (attempt < this.maxRetries && (error as Error).name === 'AbortError') {
        console.warn(`Request timeout, retrying in ${this.retryDelay}ms...`);
        await this.delay(this.retryDelay * attempt);
        return this.fetchWeatherWithRetry(location, attempt + 1);
      }

      console.error(`Network error fetching weather data (attempt ${attempt}):`, error);
      if (attempt < this.maxRetries) {
        await this.delay(this.retryDelay * attempt);
        return this.fetchWeatherWithRetry(location, attempt + 1);
      }

      return this.getFallbackWeatherData(location);
    }
  }

  async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      if (!this.apiKey || this.apiKey === 'your-secure-weather-api-key' || this.apiKey === 'demo_weather_api_key_12345') {
        return this.getFallbackWeatherData(`${lat},${lon}`);
      }

      return await this.fetchWeatherWithRetry(`${lat},${lon}`);
    } catch (error) {
      console.error('Weather service error:', error);
      return this.getFallbackWeatherData(`${lat},${lon}`);
    }
  }

  private async saveToCache(weatherData: WeatherData): Promise<void> {
    try {
      // Dynamic import to avoid issues in client-side code
      const { default: connectDB } = await import('../lib/mongodb');

      if (WeatherDataModel && connectDB) {
        await connectDB();

        const weatherDataModel = new WeatherDataModel({
          location: weatherData.location,
          current: weatherData.current,
          forecast: weatherData.forecast,
          alerts: weatherData.alerts,
        });

        await weatherDataModel.save();
        console.log(`Weather data cached for ${weatherData.location.name}`);
      }
    } catch (error) {
      console.error('Error saving weather data to database:', error);
    }
  }

  private transformApiResponse(data: WeatherApiResponse): WeatherData {
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
      forecast: data.forecast.forecastday.map((day: WeatherApiForecastDay) => ({
        date: new Date(day.date),
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
        precipitation: day.day.totalprecip_mm,
        humidity: day.day.avghumidity,
      })),
      alerts: data.alerts?.alert?.map((alert: WeatherApiAlert) => ({
        type: this.mapAlertType(alert.category),
        message: alert.desc,
        severity: this.mapAlertSeverity(alert.priority),
      })) || [],
    };
  }

  private getFallbackWeatherData(location: string): WeatherData {
    console.log(`Using fallback weather data for location: ${location}`);
    return {
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private transformWeatherData(data: IWeatherData & { _id?: string; __v?: number }): WeatherData {
    return {
      location: data.location,
      current: data.current,
      forecast: data.forecast,
      alerts: data.alerts,
    };
  }

  // Get weather impact on livestock
  getLivestockImpact(weather: WeatherData): LivestockImpact {
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
}

export const weatherService = new WeatherService();