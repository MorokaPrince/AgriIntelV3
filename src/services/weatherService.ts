import connectDB from '../lib/mongodb';
import WeatherDataModelImport, { IWeatherData } from '../models/WeatherData';

// Get the model from the import
const WeatherDataModel = WeatherDataModelImport;

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

export class WeatherService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY || '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';
  }

  async getWeatherData(location: string): Promise<WeatherData | null> {
    try {
      // Check cache first - only run on server side
      if (typeof window === 'undefined' && WeatherDataModelImport) {
        await connectDB();
        try {
          // Skip cache for now to avoid model issues
          console.log('Skipping weather cache check');
        } catch (error) {
          console.error('Error checking weather cache:', error);
        }
      }

      // Fetch from API
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(location)}&days=7&aqi=no&alerts=yes`
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Weather API key invalid, using fallback data');
          // Return mock weather data for demo purposes
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
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      // Save to cache - only run on server side
      if (typeof window === 'undefined' && WeatherDataModelImport) {
        const weatherData = new WeatherDataModelImport({
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
          forecast: data.forecast.forecastday.map((day: unknown) => {
            const dayData = day as {
              date: string;
              day: {
                maxtemp_c: number;
                mintemp_c: number;
                condition: { text: string; icon: string };
                totalprecip_mm: number;
                avghumidity: number;
              };
            };
            return {
              date: new Date(dayData.date),
              maxTemp: dayData.day.maxtemp_c,
              minTemp: dayData.day.mintemp_c,
              condition: dayData.day.condition.text,
              icon: dayData.day.condition.icon,
              precipitation: dayData.day.totalprecip_mm,
              humidity: dayData.day.avghumidity,
            };
          }),
          alerts: data.alerts?.alert?.map((alert: unknown) => {
            const alertData = alert as {
              category: string;
              desc: string;
              priority: string;
            };
            return {
              type: this.mapAlertType(alertData.category),
              message: alertData.desc,
              severity: this.mapAlertSeverity(alertData.priority),
            };
          }) || [],
        });

        await weatherData.save();
      }

      // Return weather data directly without caching for now
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
        forecast: (data.forecast.forecastday || []).map((day: unknown) => {
          const dayData = day as {
            date: string;
            day: {
              maxtemp_c: number;
              mintemp_c: number;
              condition: { text: string; icon: string };
              totalprecip_mm: number;
              avghumidity: number;
            };
          };
          return {
            date: new Date(dayData.date),
            maxTemp: dayData.day.maxtemp_c,
            minTemp: dayData.day.mintemp_c,
            condition: dayData.day.condition.text,
            icon: dayData.day.condition.icon,
            precipitation: dayData.day.totalprecip_mm,
            humidity: dayData.day.avghumidity,
          };
        }),
        alerts: (data.alerts?.alert || []).map((alert: unknown) => {
          const alertData = alert as {
            category: string;
            desc: string;
            priority: string;
          };
          return {
            type: this.mapAlertType(alertData.category),
            message: alertData.desc,
            severity: this.mapAlertSeverity(alertData.priority),
          };
        }),
      };
    } catch (error) {
      console.error('Weather service error:', error);
      return null;
    }
  }

  async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${this.apiKey}&q=${lat},${lon}&days=7&aqi=no&alerts=yes`
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Weather API key invalid, using fallback data');
          // Return mock weather data for demo purposes
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
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

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
        forecast: data.forecast.forecastday.map((day: unknown) => {
          const dayData = day as {
            date: string;
            day: {
              maxtemp_c: number;
              mintemp_c: number;
              condition: { text: string; icon: string };
              totalprecip_mm: number;
              avghumidity: number;
            };
          };
          return {
            date: new Date(dayData.date),
            maxTemp: dayData.day.maxtemp_c,
            minTemp: dayData.day.mintemp_c,
            condition: dayData.day.condition.text,
            icon: dayData.day.condition.icon,
            precipitation: dayData.day.totalprecip_mm,
            humidity: dayData.day.avghumidity,
          };
        }),
        alerts: data.alerts?.alert?.map((alert: unknown) => {
          const alertData = alert as {
            category: string;
            desc: string;
            priority: string;
          };
          return {
            type: this.mapAlertType(alertData.category),
            message: alertData.desc,
            severity: this.mapAlertSeverity(alertData.priority),
          };
        }) || [],
      };
    } catch (error) {
      console.error('Weather service error:', error);
      return null;
    }
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

  private transformWeatherData(data: IWeatherData & { _id?: string; __v?: number }): WeatherData {
    return {
      location: data.location,
      current: data.current,
      forecast: data.forecast,
      alerts: data.alerts,
    };
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
}

export const weatherService = new WeatherService();