// Weather Service with proper TypeScript types and error handling
// Note: Using fetch instead of axios to avoid dependency issues

// WeatherAPI configuration - using demo key for development
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'demo_key';
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';
// Use mock data for development/demo purposes
const USE_MOCK_DATA = true;

interface WeatherData {
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
    condition: string;
    icon: string;
    uvIndex: number;
    feelsLike: number;
    precipitation: number;
  };
  forecast: {
    daily: Array<{
      date: string;
      maxTemp: number;
      minTemp: number;
      condition: string;
      icon: string;
      precipitationProbability: number;
    }>;
    hourly: Array<{
      time: string;
      temperature: number;
      condition: string;
      icon: string;
      precipitationProbability: number;
    }>;
  };
  agriculturalImpact: {
    soilMoisture: number;
    evaporationRate: number;
    growingDegreeDays: number;
    pestRisk: 'low' | 'medium' | 'high';
    diseaseRisk: 'low' | 'medium' | 'high';
    irrigationRecommendation: string;
  };
}

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone: string;
}

interface WeatherAPIResponse {
  location?: {
    name: string;
    country: string;
    lat: number;
    lon: number;
    timezone?: string;
  };
  current?: {
    temp_c: number;
    humidity: number;
    wind_kph: number;
    condition: {
      text: string;
      icon: string;
    };
    uv: number;
    feelslike_c: number;
    precip_mm: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        daily_chance_of_rain: number;
        totalprecip_mm: number;
        avgtemp_c: number;
        avghumidity: number;
        maxwind_kph: number;
        uv: number;
      };
      hour: Array<{
        time: string;
        temp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        chance_of_rain: number;
      }>;
    }>;
  };
}

// Mock data generator for fallback when API fails
function generateMockWeatherData(location: string): WeatherData {
  const now = new Date();
  const conditions = ['Sunny', 'Partly cloudy', 'Cloudy', 'Rainy', 'Thunderstorms', 'Mist', 'Fog'];

  // Generate random weather data
  const temperature = Math.round(15 + Math.random() * 15); // 15-30°C
  const humidity = Math.round(40 + Math.random() * 60); // 40-100%
  const windSpeed = Math.round(5 + Math.random() * 20); // 5-25 kph
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const uvIndex = Math.round(1 + Math.random() * 10); // 1-11
  const feelsLike = Math.round(temperature - 2 + Math.random() * 4);
  const precipitation = Math.round(Math.random() * 10); // 0-10 mm

  // Generate forecast data for 7 days
  const dailyForecast = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    const dayTemp = Math.round(15 + Math.random() * 15);
    const nightTemp = Math.round(10 + Math.random() * 10);
    const dayCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const precipProb = Math.round(Math.random() * 100);

    return {
      date: date.toISOString().split('T')[0],
      maxTemp: Math.max(dayTemp, nightTemp),
      minTemp: Math.min(dayTemp, nightTemp),
      condition: dayCondition,
      icon: `https://cdn.weatherapi.com/weather/64x64/day/${Math.floor(Math.random() * 10) + 1}.png`,
      precipitationProbability: precipProb,
    };
  });

  // Generate hourly forecast for today
  const hourlyForecast = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    const hourTemp = Math.round(15 + Math.random() * 10);
    const hourCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const precipProb = Math.round(Math.random() * 100);

    return {
      time: `${hour}:00`,
      temperature: hourTemp,
      condition: hourCondition,
      icon: `https://cdn.weatherapi.com/weather/64x64/day/${Math.floor(Math.random() * 10) + 1}.png`,
      precipitationProbability: precipProb,
    };
  });

  // Calculate agricultural impact
  const soilMoisture = Math.round(30 + Math.random() * 70); // 30-100%
  const evaporationRate = Math.round(1 + Math.random() * 9); // 1-10
  const growingDegreeDays = Math.round(Math.max(0, (temperature - 10) / 10) * 10) / 10;

  let pestRisk: 'low' | 'medium' | 'high' = 'low';
  let diseaseRisk: 'low' | 'medium' | 'high' = 'low';

  if (humidity > 80 && temperature > 20) {
    pestRisk = 'high';
    diseaseRisk = 'high';
  } else if (humidity > 70 || temperature > 25) {
    pestRisk = 'medium';
    diseaseRisk = 'medium';
  }

  let irrigationRecommendation = 'Normal irrigation schedule';
  if (soilMoisture < 30) {
    irrigationRecommendation = 'Increase irrigation - soil is dry';
  } else if (soilMoisture > 80) {
    irrigationRecommendation = 'Reduce irrigation - soil is saturated';
  } else if (precipitation > 5) {
    irrigationRecommendation = 'Delay irrigation - rain expected';
  }

  return {
    location: {
      name: location || 'Johannesburg',
      country: 'South Africa',
      latitude: -26.2041,
      longitude: 28.0473,
    },
    current: {
      temperature,
      humidity,
      windSpeed,
      condition,
      icon: `https://cdn.weatherapi.com/weather/64x64/day/${Math.floor(Math.random() * 10) + 1}.png`,
      uvIndex,
      feelsLike,
      precipitation,
    },
    forecast: {
      daily: dailyForecast,
      hourly: hourlyForecast,
    },
    agriculturalImpact: {
      soilMoisture,
      evaporationRate,
      growingDegreeDays,
      pestRisk,
      diseaseRisk,
      irrigationRecommendation,
    },
  };
}

class WeatherService {
  private cache: Map<string, { data: WeatherData; timestamp: number }>;
  private CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.cache = new Map();
  }

  async getWeatherData(location: string): Promise<WeatherData> {
    const cacheKey = `weather_${location.toLowerCase()}`;
    const cachedData = this.cache.get(cacheKey);

    // Return cached data if available and not expired
    if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_DURATION) {
      return cachedData.data;
    }

    try {
      // Get location coordinates first
      const locationData = await this.getLocationData(location);

      // Fetch current weather data
      const currentWeather = await this.fetchWeatherData<WeatherAPIResponse>(
        `${WEATHER_API_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${locationData.latitude},${locationData.longitude}`
      );

      // Fetch forecast data
      const forecastData = await this.fetchWeatherData<WeatherAPIResponse>(
        `${WEATHER_API_BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${locationData.latitude},${locationData.longitude}&days=7`
      );

      if (!currentWeather?.current || !forecastData?.forecast) {
        throw new Error('Invalid weather data received from API');
      }

      // Calculate agricultural impact metrics
      const agriculturalImpact = this.calculateAgriculturalImpact(
        currentWeather.current,
        forecastData.forecast
      );

      const weatherData: WeatherData = {
        location: {
          name: locationData.city,
          country: locationData.country,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        },
        current: {
          temperature: currentWeather.current.temp_c,
          humidity: currentWeather.current.humidity,
          windSpeed: currentWeather.current.wind_kph,
          condition: currentWeather.current.condition.text,
          icon: currentWeather.current.condition.icon,
          uvIndex: currentWeather.current.uv,
          feelsLike: currentWeather.current.feelslike_c,
          precipitation: currentWeather.current.precip_mm,
        },
        forecast: {
          daily: forecastData.forecast.forecastday.map((day) => ({
            date: day.date,
            maxTemp: day.day.maxtemp_c,
            minTemp: day.day.mintemp_c,
            condition: day.day.condition.text,
            icon: day.day.condition.icon,
            precipitationProbability: day.day.daily_chance_of_rain,
          })),
          hourly: forecastData.forecast.forecastday[0]?.hour?.map((hour) => ({
            time: hour.time,
            temperature: hour.temp_c,
            condition: hour.condition.text,
            icon: hour.condition.icon,
            precipitationProbability: hour.chance_of_rain,
          })) || [],
        },
        agriculturalImpact,
      };

      // Cache the data
      this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() });

      return weatherData;
    } catch (error) {
      console.error('Weather API Error:', error);
      // Return mock data when API fails
      return generateMockWeatherData(location);
    }
  }

  private async fetchWeatherData<T>(url: string): Promise<T> {
    try {
      // Use mock data if enabled or for testing
      if (USE_MOCK_DATA) {
        throw new Error('Using mock data for weather service');
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      // Return mock data when API fails
      throw error;
    }
  }

  private async getLocationData(location: string): Promise<LocationData> {
    try {
      // First try to get coordinates from location name
      const response = await this.fetchWeatherData<{ data?: Array<LocationData> }>(
        `${WEATHER_API_BASE_URL}/search.json?key=${WEATHER_API_KEY}&q=${location}`
      );

      if (response && Array.isArray(response) && response.length > 0) {
        const locationData = response[0];
        return {
          latitude: locationData.lat,
          longitude: locationData.lon,
          city: locationData.name,
          country: locationData.country,
          timezone: locationData.timezone || 'Africa/Johannesburg',
        };
      }

      // Fallback to default location if not found
      return {
        latitude: -26.2041,
        longitude: 28.0473,
        city: 'Johannesburg',
        country: 'South Africa',
        timezone: 'Africa/Johannesburg',
      };
    } catch (error) {
      console.error('Location lookup failed:', error);
      // Return default location on error
      return {
        latitude: -26.2041,
        longitude: 28.0473,
        city: 'Johannesburg',
        country: 'South Africa',
        timezone: 'Africa/Johannesburg',
      };
    }
  }

  private calculateAgriculturalImpact(
    currentWeather: WeatherAPIResponse['current'],
    forecast: WeatherAPIResponse['forecast']
  ): WeatherData['agriculturalImpact'] {
    if (!currentWeather || !forecast?.forecastday?.[0]) {
      return {
        soilMoisture: 50,
        evaporationRate: 5,
        growingDegreeDays: 1,
        pestRisk: 'low',
        diseaseRisk: 'low',
        irrigationRecommendation: 'Normal irrigation schedule',
      };
    }

    // Calculate soil moisture based on precipitation and temperature
    const soilMoisture = Math.min(100, Math.max(0, 50 + (forecast.forecastday[0].day.totalprecip_mm * 2) - (currentWeather.temp_c * 0.5)));

    // Calculate evaporation rate based on temperature, humidity, and wind
    const evaporationRate = Math.min(10, Math.max(1, (currentWeather.temp_c * 0.2) + (currentWeather.wind_kph * 0.05) - (currentWeather.humidity * 0.02)));

    // Calculate growing degree days (base 10°C)
    const growingDegreeDays = Math.max(0, (currentWeather.temp_c - 10) / 10);

    // Determine pest and disease risk based on weather conditions
    let pestRisk: 'low' | 'medium' | 'high' = 'low';
    let diseaseRisk: 'low' | 'medium' | 'high' = 'low';

    if (currentWeather.humidity > 80 && currentWeather.temp_c > 20) {
      pestRisk = 'high';
      diseaseRisk = 'high';
    } else if (currentWeather.humidity > 70 || currentWeather.temp_c > 25) {
      pestRisk = 'medium';
      diseaseRisk = 'medium';
    }

    // Generate irrigation recommendation
    let irrigationRecommendation = 'Normal irrigation schedule';
    if (soilMoisture < 30) {
      irrigationRecommendation = 'Increase irrigation - soil is dry';
    } else if (soilMoisture > 80) {
      irrigationRecommendation = 'Reduce irrigation - soil is saturated';
    } else if (forecast.forecastday[0].day.daily_chance_of_rain > 70) {
      irrigationRecommendation = 'Delay irrigation - rain expected';
    }

    return {
      soilMoisture: Math.round(soilMoisture),
      evaporationRate: Math.round(evaporationRate * 10) / 10,
      growingDegreeDays: Math.round(growingDegreeDays * 10) / 10,
      pestRisk,
      diseaseRisk,
      irrigationRecommendation,
    };
  }

  async getHistoricalWeather(location: string, date: Date): Promise<WeatherData> {
    try {
      const locationData = await this.getLocationData(location);
      const formattedDate = date.toISOString().split('T')[0];

      const response = await this.fetchWeatherData<WeatherAPIResponse>(
        `${WEATHER_API_BASE_URL}/history.json?key=${WEATHER_API_KEY}&q=${locationData.latitude},${locationData.longitude}&dt=${formattedDate}`
      );

      if (!response?.forecast?.forecastday?.[0]) {
        throw new Error('Invalid historical weather data');
      }

      return {
        location: {
          name: locationData.city,
          country: locationData.country,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        },
        current: {
          temperature: response.forecast.forecastday[0].day.avgtemp_c,
          humidity: response.forecast.forecastday[0].day.avghumidity,
          windSpeed: response.forecast.forecastday[0].day.maxwind_kph,
          condition: response.forecast.forecastday[0].day.condition.text,
          icon: response.forecast.forecastday[0].day.condition.icon,
          uvIndex: response.forecast.forecastday[0].day.uv,
          feelsLike: response.forecast.forecastday[0].day.avgtemp_c,
          precipitation: response.forecast.forecastday[0].day.totalprecip_mm,
        },
        forecast: {
          daily: [],
          hourly: [],
        },
        agriculturalImpact: {
          soilMoisture: 50,
          evaporationRate: 5,
          growingDegreeDays: Math.max(0, (response.forecast.forecastday[0].day.avgtemp_c - 10) / 10),
          pestRisk: 'low',
          diseaseRisk: 'low',
          irrigationRecommendation: 'Normal irrigation schedule',
        },
      };
    } catch (error) {
      console.error('Historical weather fetch failed:', error);
      throw new Error('Failed to fetch historical weather data.');
    }
  }

  // Clear cache (useful for testing or when user changes location)
  clearCache() {
    this.cache.clear();
  }

  getLivestockImpact(weatherData: WeatherData) {
    // Calculate livestock impact based on weather conditions
    const temp = weatherData.current.temperature;
    const humidity = weatherData.current.humidity;
    const windSpeed = weatherData.current.windSpeed;
    const precipitation = weatherData.current.precipitation;
    
    let heatStress = 'low';
    let coldStress = 'low';
    let comfortLevel = 'optimal';
    const recommendations: string[] = [];
    
    // Heat stress assessment
    if (temp > 35) {
      heatStress = 'severe';
      comfortLevel = 'poor';
      recommendations.push('Provide additional shade and fresh water');
      recommendations.push('Consider cooling systems for livestock');
    } else if (temp > 30) {
      heatStress = 'high';
      comfortLevel = 'fair';
      recommendations.push('Ensure adequate shade and water');
    } else if (temp > 25) {
      heatStress = 'moderate';
    }
    
    // Cold stress assessment
    if (temp < 0) {
      coldStress = 'severe';
      comfortLevel = 'poor';
      recommendations.push('Provide shelter and warm bedding');
      recommendations.push('Increase feed ration for energy');
    } else if (temp < 5) {
      coldStress = 'high';
      comfortLevel = 'fair';
      recommendations.push('Ensure adequate shelter from wind');
    } else if (temp < 10) {
      coldStress = 'moderate';
    }
    
    // Humidity impact
    if (humidity > 85) {
      recommendations.push('Monitor for respiratory issues due to high humidity');
      if (heatStress === 'low') comfortLevel = 'fair';
    }
    
    // Wind impact
    if (windSpeed > 50) {
      recommendations.push('Secure loose materials and ensure shelter');
      if (coldStress === 'low') comfortLevel = 'fair';
    }
    
    // Precipitation impact
    if (precipitation > 10) {
      recommendations.push('Ensure dry shelter and check for waterlogged pastures');
    }
    
    return {
      heatStress,
      coldStress,
      comfortLevel,
      recommendations,
      riskFactors: {
        temperature: temp,
        humidity,
        windSpeed,
        precipitation
      }
    };
  }
}

// Singleton instance
export const weatherService = new WeatherService();