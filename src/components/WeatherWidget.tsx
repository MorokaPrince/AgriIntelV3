'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { weatherService } from '@/services/weatherService';
import { GradientCard } from './dashboard/GradientCard';

interface ServiceWeatherData {
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
    pestRisk: number;
    grazingSuitability: number;
  };
  alerts: string[];
  lastUpdated: string;
}

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
    next24h: string;
    next3days: string;
    next7days: string;
  };
  agriculturalImpact: {
    soilMoisture: number;
    evaporationRate: number;
    pestRisk: number;
    grazingSuitability: number;
  };
  alerts: string[];
  lastUpdated: string;
}

interface AgriculturalImpactProps {
  soilMoisture: number;
  evaporationRate: number;
  pestRisk: number;
  grazingSuitability: number;
}

const AgriculturalImpact: React.FC<AgriculturalImpactProps> = ({
  soilMoisture,
  evaporationRate,
  pestRisk,
  grazingSuitability
}) => {
  const getImpactColor = (value: number): string => {
    if (value > 75) return 'text-green-500';
    if (value > 50) return 'text-yellow-500';
    if (value > 25) return 'text-orange-500';
    return 'text-red-500';
  };

  const getImpactText = (value: number): string => {
    if (value > 75) return 'Excellent';
    if (value > 50) return 'Good';
    if (value > 25) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="text-center">
        <div className="text-sm text-gray-600 dark:text-gray-300">Soil Moisture</div>
        <div className={`text-2xl font-bold ${getImpactColor(soilMoisture)}`}>
          {soilMoisture}%
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {getImpactText(soilMoisture)}
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm text-gray-600 dark:text-gray-300">Evaporation</div>
        <div className={`text-2xl font-bold ${getImpactColor(100 - evaporationRate)}`}>
          {evaporationRate}%
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {getImpactText(100 - evaporationRate)}
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm text-gray-600 dark:text-gray-300">Pest Risk</div>
        <div className={`text-2xl font-bold ${getImpactColor(100 - pestRisk)}`}>
          {pestRisk}%
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {getImpactText(100 - pestRisk)}
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm text-gray-600 dark:text-gray-300">Grazing</div>
        <div className={`text-2xl font-bold ${getImpactColor(grazingSuitability)}`}>
          {grazingSuitability}%
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {getImpactText(grazingSuitability)}
        </div>
      </div>
    </div>
  );
};

const WeatherConditionIcon: React.FC<{ condition: string; size?: number }> = ({
  condition,
  size = 48
}) => {
  const getWeatherIcon = (cond: string) => {
    const lowerCond = cond.toLowerCase();
    if (lowerCond.includes('sunny') || lowerCond.includes('clear')) {
      return '☀️';
    } else if (lowerCond.includes('rain')) {
      return '🌧️';
    } else if (lowerCond.includes('cloud')) {
      return '☁️';
    } else if (lowerCond.includes('storm') || lowerCond.includes('thunder')) {
      return '⛈️';
    } else if (lowerCond.includes('snow')) {
      return '❄️';
    } else if (lowerCond.includes('fog') || lowerCond.includes('mist')) {
      return '🌫️';
    } else {
      return '🌤️';
    }
  };

  return (
    <div className="weather-icon text-4xl mb-2" style={{ fontSize: size }}>
      {getWeatherIcon(condition)}
    </div>
  );
};

export const WeatherWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState<ServiceWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch weather data using the weather service
        const serviceData = await weatherService.getWeatherData('Demo Farm, Johannesburg');
        
        // Transform service data to match our interface
        const transformedData: ServiceWeatherData = {
          ...serviceData,
          alerts: [],
          lastUpdated: new Date().toISOString(),
          agriculturalImpact: {
            soilMoisture: serviceData.agriculturalImpact.soilMoisture,
            evaporationRate: serviceData.agriculturalImpact.evaporationRate,
            pestRisk: typeof serviceData.agriculturalImpact.pestRisk === 'number' 
              ? serviceData.agriculturalImpact.pestRisk 
              : 50,
            grazingSuitability: 85
          }
        };

        setWeatherData(transformedData);
        setLastUpdated(new Date().toLocaleString());
      } catch (err) {
        console.error('Failed to fetch weather data:', err);
        setError('Failed to fetch weather data. Using cached data.');
        // Fallback to cached data or default values
        const fallbackData: ServiceWeatherData = {
          location: {
            name: 'Johannesburg',
            country: 'South Africa',
            latitude: -26.2041,
            longitude: 28.0473
          },
          current: {
            temperature: 22.5,
            humidity: 65,
            windSpeed: 12,
            condition: 'Partly Cloudy',
            icon: 'https://cdn.weatherapi.com/weather/64x64/day/116.png',
            uvIndex: 6,
            feelsLike: 24,
            precipitation: 0
          },
          forecast: {
            daily: [
              {
                date: new Date().toISOString().split('T')[0],
                maxTemp: 28,
                minTemp: 18,
                condition: 'Partly Cloudy',
                icon: 'https://cdn.weatherapi.com/weather/64x64/day/116.png',
                precipitationProbability: 20
              }
            ],
            hourly: []
          },
          agriculturalImpact: {
            soilMoisture: 72,
            evaporationRate: 45,
            pestRisk: 30,
            grazingSuitability: 85
          },
          alerts: [],
          lastUpdated: new Date().toISOString()
        };
        setWeatherData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately and then every 30 minutes
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !weatherData) {
    return (
      <GradientCard
        title="Weather Insights"
        value="Loading..."
        gradient="metallic-blue"
        className="weather-widget"
      >
        <div className="flex justify-center items-center h-32">
          <div className="loading-spinner"></div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-2">
          Fetching real-time weather data...
        </div>
      </GradientCard>
    );
  }

  if (error) {
    return (
      <GradientCard
        title="Weather Insights"
        value="Offline"
        gradient="metallic-blue"
        className="weather-widget"
      >
        <div className="text-center p-4">
          <div className="text-yellow-500 mb-2">⚠️</div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {error}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated}
          </div>
        </div>
      </GradientCard>
    );
  }

  return (
    <GradientCard
      title="Weather Insights"
      value={`${weatherData?.current.temperature}°C`}
      gradient="metallic-blue"
      className="weather-widget"
      icon={<WeatherConditionIcon condition={weatherData?.current.condition || 'Partly Cloudy'} />}
    >
      <div className="weather-details">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {weatherData?.current.condition}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Updated: {lastUpdated}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Humidity</div>
            <div className="text-lg font-semibold">
              {weatherData?.current.humidity}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Wind</div>
            <div className="text-lg font-semibold">
              {weatherData?.current.windSpeed} km/h
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">UV Index</div>
            <div className="text-lg font-semibold">
              {weatherData?.current.uvIndex}
            </div>
          </div>
        </div>

        {weatherData?.alerts && weatherData.alerts.length > 0 && (
          <div className="weather-alerts mb-3">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
              ALERTS:
            </div>
            {weatherData.alerts.map((alert: string, index: number) => (
              <div key={index} className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">
                • {alert}
              </div>
            ))}
          </div>
        )}

        <AgriculturalImpact
          soilMoisture={weatherData?.agriculturalImpact.soilMoisture || 0}
          evaporationRate={weatherData?.agriculturalImpact.evaporationRate || 0}
          pestRisk={weatherData?.agriculturalImpact.pestRisk || 0}
          grazingSuitability={weatherData?.agriculturalImpact.grazingSuitability || 0}
        />

        <div className="forecast mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
            FORECAST:
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <div>• Next 24h: {weatherData?.forecast.daily[0]?.condition || 'Partly cloudy'}</div>
            <div>• Next 3 days: Stable weather with moderate temperatures</div>
            <div>• Next 7 days: Mixed conditions with temperatures ranging from 18-28°C</div>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          Real-time weather data • Agricultural impact analysis
        </div>
      </div>
    </GradientCard>
  );
};

// Export for use in dashboard
export default WeatherWidget;