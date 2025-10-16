import mongoose, { Document, Schema } from 'mongoose';

export interface IWeatherData extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: string;
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
  alerts: Array<{
    type: 'rain' | 'storm' | 'heat' | 'cold' | 'wind';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const WeatherDataSchema = new Schema<IWeatherData>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    location: {
      name: { type: String, required: true },
      country: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    current: {
      temperature: { type: Number, required: true },
      humidity: { type: Number, required: true },
      windSpeed: { type: Number, required: true },
      windDirection: { type: Number, required: true },
      pressure: { type: Number, required: true },
      visibility: { type: Number, required: true },
      uvIndex: { type: Number, required: true },
      condition: { type: String, required: true },
      icon: { type: String, required: true },
      lastUpdated: { type: Date, default: Date.now },
    },
    forecast: [{
      date: { type: Date, required: true },
      maxTemp: { type: Number, required: true },
      minTemp: { type: Number, required: true },
      condition: { type: String, required: true },
      icon: { type: String, required: true },
      precipitation: { type: Number, required: true },
      humidity: { type: Number, required: true },
    }],
    alerts: [{
      type: {
        type: String,
        enum: ['rain', 'storm', 'heat', 'cold', 'wind'],
        required: true,
      },
      message: { type: String, required: true },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
WeatherDataSchema.index({ tenantId: 1, 'location.name': 1 });
WeatherDataSchema.index({ tenantId: 1, 'location.latitude': 1, 'location.longitude': 1 });
WeatherDataSchema.index({ tenantId: 1, lastUpdated: -1 });

// TTL index to automatically delete old weather data (30 days)
WeatherDataSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Static method to find weather by tenant
WeatherDataSchema.statics.findByTenant = function (tenantId: string) {
  return this.find({ tenantId });
};

// Static method to find recent weather data
WeatherDataSchema.statics.findRecent = function (tenantId: string, hours: number = 24) {
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({
    tenantId,
    lastUpdated: { $gte: cutoffDate },
  });
};

// Create model with safe access to mongoose.models
const createWeatherDataModel = () => {
  try {
    if (mongoose.models && mongoose.models.WeatherData) {
      return mongoose.models.WeatherData;
    }
    return mongoose.model<IWeatherData>('WeatherData', WeatherDataSchema);
  } catch (error) {
    // If mongoose isn't connected yet, return a placeholder
    console.warn('WeatherData model accessed before mongoose connection');
    return null;
  }
};

export default createWeatherDataModel();

// Also export the model as WeatherDataModel for clarity
export const WeatherDataModel = createWeatherDataModel();