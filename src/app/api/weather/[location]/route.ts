import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../middleware/auth';
import { weatherService } from '../../../../services/weatherService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ location: string }> }
) {
  return withAuth(
    request,
    async (_request: NextRequest, _session: unknown) => {
      try {
        const { location } = await params;

        if (!location) {
          return NextResponse.json(
            { error: 'Location parameter is required' },
            { status: 400 }
          );
        }

        const weatherData = await weatherService.getWeatherData(decodeURIComponent(location));

        if (!weatherData) {
          return NextResponse.json(
            { error: 'Weather data not found for this location' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: weatherData,
          livestockImpact: weatherService.getLivestockImpact(weatherData),
        });
      } catch (error) {
        console.error('Weather API error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch weather data' },
          { status: 500 }
        );
      }
    },
    { allowPublic: true } // Allow public access to weather data
  );
}