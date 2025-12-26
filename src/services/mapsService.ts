/**
 * Maps Service - Google Maps API Integration for AgrIntelV3
 * Provides farmland visualization, soil analysis, and location tracking
 */

// Google Maps API Configuration
const GOOGLE_MAPS_API_KEY = 'AIzaSyBI59tTTz6BuKekWEB83ena7lb1-34VT1s';
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

// Interface definitions
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface FarmBoundary {
  id: string;
  name: string;
  coordinates: Coordinates[];
  area: number;
  soilType: string;
  cropType: string;
}

interface SoilAnalysis {
  soilType: string;
  moisture: number;
  pH: number;
  organicMatter: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  healthScore: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  deviceId: string;
}

interface WeatherOverlay {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
}

interface MapStyle {
  featureType: string;
  elementType: string;
  stylers: Array<{
    color?: string;
    visibility?: string;
    weight?: number;
  }>;
}

class MapsService {
  private mapInstance: google.maps.Map | null = null;
  private markers: google.maps.Marker[] = [];
  private polygons: google.maps.Polygon[] = [];
  private infoWindows: google.maps.InfoWindow[] = [];
  private heatmapLayer: google.maps.visualization.HeatmapLayer | null = null;
  private weatherOverlay: google.maps.GroundOverlay | null = null;

  /**
   * Initialize Google Maps with farm-specific settings
   */
  async initializeMap(
    containerId: string,
    center: Coordinates,
    zoom: number = 15
  ): Promise<google.maps.Map> {
    try {
      // Load Google Maps API if not already loaded
      await this.loadGoogleMapsAPI();

      const mapOptions: google.maps.MapOptions = {
        center: new google.maps.LatLng(center.latitude, center.longitude),
        zoom: zoom,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        gestureHandling: 'greedy',
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: true,
        zoomControl: true,
        styles: this.getAgriculturalMapStyles()
      };

      this.mapInstance = new google.maps.Map(
        document.getElementById(containerId) as HTMLElement,
        mapOptions
      ) || undefined;

      // Add farm-specific controls
      this.addCustomControls();

      return this.mapInstance;
    } catch (error) {
      console.error('Failed to initialize map:', error);
      throw new Error('Map initialization failed. Please check your internet connection.');
    }
  }

  /**
   * Load Google Maps API dynamically
   */
  private loadGoogleMapsAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization,geometry&callback=initMap`;
      script.async = true;
      script.defer = true;

      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps API'));

      document.head.appendChild(script);
    });
  }

  /**
   * Get agricultural-specific map styles
   */
  private getAgriculturalMapStyles(): MapStyle[] {
    return [
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#4299e1' }, { visibility: 'on' }]
      },
      {
        featureType: 'landscape.natural',
        elementType: 'geometry',
        stylers: [{ color: '#48bb78' }, { visibility: 'on' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#38a169' }, { visibility: 'on' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ];
  }

  /**
   * Add custom farm management controls
   */
  private addCustomControls(): void {
    if (!this.mapInstance) return;

    // Create control container
    const controlDiv = document.createElement('div');
    controlDiv.className = 'map-controls';
    controlDiv.style.margin = '10px';
    controlDiv.style.backgroundColor = 'white';
    controlDiv.style.padding = '8px';
    controlDiv.style.borderRadius = '4px';
    controlDiv.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

    // Add soil analysis button
    const soilBtn = document.createElement('button');
    soilBtn.textContent = 'Soil Analysis';
    soilBtn.className = 'map-control-btn';
    soilBtn.style.marginRight = '8px';
    soilBtn.addEventListener('click', () => this.showSoilAnalysis());

    // Add animal tracking button
    const animalBtn = document.createElement('button');
    animalBtn.textContent = 'Animal Tracking';
    animalBtn.className = 'map-control-btn';
    animalBtn.addEventListener('click', () => {
      // For demo purposes, generate mock animal locations
      const mockAnimalLocations: LocationData[] = [];
      if (this.mapInstance) {
        const center = this.mapInstance.getCenter();
        if (center) {
          for (let i = 0; i < 5; i++) {
            mockAnimalLocations.push({
              latitude: center.lat() + (Math.random() - 0.5) * 0.01,
              longitude: center.lng() + (Math.random() - 0.5) * 0.01,
              accuracy: 5,
              timestamp: new Date().toISOString(),
              deviceId: `device-${i + 1}`
            });
          }
        }
      }
      this.showAnimalTracking(mockAnimalLocations);
    });

    // Add weather overlay button
    const weatherBtn = document.createElement('button');
    weatherBtn.textContent = 'Weather Overlay';
    weatherBtn.className = 'map-control-btn';
    weatherBtn.addEventListener('click', () => this.toggleWeatherOverlay());

    controlDiv.appendChild(soilBtn);
    controlDiv.appendChild(animalBtn);
    controlDiv.appendChild(weatherBtn);

    this.mapInstance.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
  }

  /**
   * Display farm boundaries and sections
   */
  async showFarmBoundaries(farmSections: FarmBoundary[]): Promise<void> {
    if (!this.mapInstance) {
      console.error('Map not initialized');
      return;
    }

    // Clear existing polygons
    this.clearPolygons();

    // Create farm sections with different colors
    const colors = ['#48bb78', '#38a169', '#2f855a', '#276749', '#22543d'];

    farmSections.forEach((section, index) => {
      const path = section.coordinates.map(coord =>
        new google.maps.LatLng(coord.latitude, coord.longitude)
      );

      const polygon = new google.maps.Polygon({
        paths: path,
        strokeColor: '#2d3748',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: colors[index % colors.length],
        fillOpacity: 0.5,
        clickable: true,
        editable: false,
        zIndex: 1
      });

      polygon.addListener('click', () => {
        this.showSectionInfo(section);
      });

      polygon.setMap(this.mapInstance);
      this.polygons.push(polygon);

      // Add section label
      const center = this.calculatePolygonCenter(path);
      const label = new google.maps.Marker({
        position: center,
        label: {
          text: section.name,
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        icon: {
          url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="15" fill="%232d3748"/></svg>',
          anchor: new google.maps.Point(15, 15),
          labelOrigin: new google.maps.Point(15, 10)
        },
        zIndex: 2
      });

      label.setMap(this.mapInstance);
      this.markers.push(label);
    });

    // Fit map to show all sections
    const bounds = new google.maps.LatLngBounds();
    farmSections.forEach(section => {
      section.coordinates.forEach(coord => {
        bounds.extend(new google.maps.LatLng(coord.latitude, coord.longitude));
      });
    });
    this.mapInstance?.fitBounds(bounds);
  }

  /**
   * Show soil analysis overlay
   */
  async showSoilAnalysis(): Promise<void> {
    if (!this.mapInstance) return;

    try {
      // In a real implementation, this would fetch soil data from your API
      // For demo purposes, we'll show a heatmap of soil health
      const soilData = this.generateMockSoilData();

      // Clear existing heatmap
      if (this.heatmapLayer) {
        this.heatmapLayer.setMap(null);
      }

      // Create heatmap
      this.heatmapLayer = new google.maps.visualization.HeatmapLayer({
        data: soilData,
        map: (this.mapInstance as google.maps.Map) || undefined,
        radius: 20,
        opacity: 0.6,
        gradient: [
          'rgba(0, 255, 0, 0)',
          'rgba(0, 255, 0, 1)',
          'rgba(255, 255, 0, 1)',
          'rgba(255, 0, 0, 1)'
        ]
      });

      // Add legend
      this.addSoilLegend();
    } catch (error) {
      console.error('Failed to show soil analysis:', error);
    }
  }

  /**
   * Generate mock soil data for heatmap
   */
  private generateMockSoilData(): google.maps.LatLng[] {
    const data: google.maps.LatLng[] = [];
    const center = this.mapInstance?.getCenter();

    if (!center) return data;

    // Generate points in a grid pattern around the farm
    for (let i = -5; i <= 5; i++) {
      for (let j = -5; j <= 5; j++) {
        const lat = center.lat() + (i * 0.001);
        const lng = center.lng() + (j * 0.001);

        // Add multiple points with varying intensity
        const intensity = Math.random() * 3 + 1;
        for (let k = 0; k < intensity; k++) {
          data.push(new google.maps.LatLng(
            lat + (Math.random() - 0.5) * 0.0002,
            lng + (Math.random() - 0.5) * 0.0002
          ));
        }
      }
    }

    return data;
  }

  /**
   * Add soil analysis legend
   */
  private addSoilLegend(): void {
    if (!this.mapInstance) return;

    const legend = document.createElement('div');
    legend.className = 'soil-legend';
    legend.style.backgroundColor = 'white';
    legend.style.padding = '10px';
    legend.style.borderRadius = '4px';
    legend.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    legend.style.fontFamily = 'Arial, sans-serif';
    legend.style.fontSize = '12px';

    legend.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px;">Soil Health Analysis</div>
      <div style="display: flex; align-items: center; margin-bottom: 4px;">
        <div style="width: 20px; height: 20px; background: green; margin-right: 8px;"></div>
        <div>Healthy (High organic matter)</div>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 4px;">
        <div style="width: 20px; height: 20px; background: yellow; margin-right: 8px;"></div>
        <div>Moderate (Needs attention)</div>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <div style="width: 20px; height: 20px; background: red; margin-right: 8px;"></div>
        <div>Poor (Urgent action needed)</div>
      </div>
      <div style="font-size: 10px; color: #666;">
        Click on map for detailed soil analysis
      </div>
    `;

    this.mapInstance.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(legend);
  }

  /**
   * Show animal tracking with RFID locations
   */
  async showAnimalTracking(animalLocations: LocationData[]): Promise<void> {
    if (!this.mapInstance) return;

    // Clear existing markers
    this.clearMarkers();

    // Create animal markers with different icons based on species
    animalLocations.forEach((location, index) => {
      const icon = this.getAnimalIcon(index);

      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(location.latitude, location.longitude),
        map: this.mapInstance,
        icon: icon,
        title: `Animal #${index + 1}`,
        zIndex: 100 + index
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-family: Arial, sans-serif; font-size: 14px;">
            <div style="font-weight: bold; margin-bottom: 4px;">Animal #${index + 1}</div>
            <div style="margin-bottom: 4px;">Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}</div>
            <div style="margin-bottom: 4px;">Accuracy: ${location.accuracy}m</div>
            <div style="margin-bottom: 4px;">Last updated: ${new Date(location.timestamp).toLocaleString()}</div>
            <div style="margin-bottom: 4px;">Device: ${location.deviceId}</div>
            <div style="color: #48bb78; font-weight: bold;">Healthy</div>
          </div>
        `
      });

      marker.addListener('click', () => {
        this.infoWindows.forEach(window => window.close());
        infoWindow.open(this.mapInstance, marker);
      });

      this.markers.push(marker);
      this.infoWindows.push(infoWindow);
    });

    // Fit map to show all animals
    if (animalLocations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      animalLocations.forEach(location => {
        bounds.extend(new google.maps.LatLng(location.latitude, location.longitude));
      });
      this.mapInstance.fitBounds(bounds);
    }
  }

  /**
   * Get animal icon based on index
   */
  private getAnimalIcon(index: number): google.maps.Icon {
    const colors = ['#48bb78', '#38a169', '#e53e3e', '#ed8936', '#9f7aea'];
    const icons = ['🐄', '🐑', '🐖', '🐔', '🐎'];

    return {
      url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%23ffffff" stroke="%23${colors[index % colors.length].substring(1)}" stroke-width="2"/><text x="20" y="25" font-family="Arial" font-size="16" fill="%23${colors[index % colors.length].substring(1)}" text-anchor="middle">${icons[index % icons.length]}</text></svg>`,
      anchor: new google.maps.Point(20, 20),
      scaledSize: new google.maps.Size(40, 40)
    };
  }

  /**
   * Toggle weather overlay
   */
  async toggleWeatherOverlay(): Promise<void> {
    if (!this.mapInstance) return;

    if (this.weatherOverlay) {
      // Remove existing overlay
      this.weatherOverlay.setMap(null);
      this.weatherOverlay = null;
      return;
    }

    try {
      // Fetch weather data (in real implementation)
      const weatherData = await this.fetchWeatherData();

      // Create weather overlay
      const bounds = this.mapInstance?.getBounds();
      const overlayBounds = bounds ?? new google.maps.LatLngBounds();
      overlayBounds.extend(new google.maps.LatLng(weatherData.latitude - 0.01, weatherData.longitude - 0.01));
      overlayBounds.extend(new google.maps.LatLng(weatherData.latitude + 0.01, weatherData.longitude + 0.01));
      
      // For this demo, we'll skip the ground overlay due to API complexity
      // and just show weather info
      console.log('Weather overlay would be shown here');

      // Add weather info
      this.addWeatherInfo(weatherData);
    } catch (error) {
      console.error('Failed to load weather overlay:', error);
    }
  }

  /**
   * Fetch weather data for overlay
   */
  private async fetchWeatherData(): Promise<WeatherOverlay & Coordinates> {
    // In a real implementation, this would call your weather API
    // For demo purposes, return mock data
    return {
      latitude: -26.2041,
      longitude: 28.0473,
      temperature: 22.5,
      humidity: 65,
      precipitation: 0,
      windSpeed: 12,
      windDirection: 180
    };
  }

  /**
   * Add weather information panel
   */
  private addWeatherInfo(weather: WeatherOverlay & Coordinates): void {
    if (!this.mapInstance) return;

    const weatherInfo = document.createElement('div');
    weatherInfo.className = 'weather-info';
    weatherInfo.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    weatherInfo.style.padding = '12px';
    weatherInfo.style.borderRadius = '6px';
    weatherInfo.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    weatherInfo.style.fontFamily = 'Arial, sans-serif';

    weatherInfo.innerHTML = `
      <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #2d3748;">
        Current Weather Conditions
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #4299e1;">${weather.temperature}°C</div>
          <div style="font-size: 12px; color: #718096;">Temperature</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #38b2ac;">${weather.humidity}%</div>
          <div style="font-size: 12px; color: #718096;">Humidity</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #63b3ed;">${weather.windSpeed} km/h</div>
          <div style="font-size: 12px; color: #718096;">Wind Speed</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #9f7aea;">${weather.precipitation} mm</div>
          <div style="font-size: 12px; color: #718096;">Precipitation</div>
        </div>
      </div>
    `;

    this.mapInstance.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(weatherInfo);
  }

  /**
   * Show section information
   */
  private showSectionInfo(section: FarmBoundary): void {
    if (!this.mapInstance) return;

    // Close existing info windows
    this.infoWindows.forEach(window => window.close());

    // Calculate center of section
    const center = this.calculatePolygonCenter(
      section.coordinates.map(coord => new google.maps.LatLng(coord.latitude, coord.longitude))
    );

    const infoWindow = new google.maps.InfoWindow({
      position: center,
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 300px;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #2d3748;">
            ${section.name}
          </div>
          <div style="margin-bottom: 6px;"><strong>Area:</strong> ${section.area} hectares</div>
          <div style="margin-bottom: 6px;"><strong>Soil Type:</strong> ${section.soilType}</div>
          <div style="margin-bottom: 6px;"><strong>Crop Type:</strong> ${section.cropType}</div>
          <div style="margin-bottom: 8px;"><strong>Status:</strong> <span style="color: #48bb78;">Healthy</span></div>
          <button onclick="alert('Navigating to section details...')" style="
            background-color: #4299e1;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            width: 100%;
          ">View Details</button>
        </div>
      `
    });

    infoWindow.open(this.mapInstance);
    this.infoWindows.push(infoWindow);
  }

  /**
   * Calculate center of polygon
   */
  private calculatePolygonCenter(points: google.maps.LatLng[]): google.maps.LatLng {
    let lat = 0, lng = 0;

    points.forEach(point => {
      lat += point.lat();
      lng += point.lng();
    });

    return new google.maps.LatLng(lat / points.length, lng / points.length);
  }

  /**
   * Clear all markers from map
   */
  clearMarkers(): void {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }

  /**
   * Clear all polygons from map
   */
  clearPolygons(): void {
    this.polygons.forEach(polygon => polygon.setMap(null));
    this.polygons = [];
  }

  /**
   * Clear all info windows
   */
  clearInfoWindows(): void {
    this.infoWindows.forEach(window => window.close());
    this.infoWindows = [];
  }

  /**
   * Clear all map data
   */
  clearMap(): void {
    this.clearMarkers();
    this.clearPolygons();
    this.clearInfoWindows();

    if (this.heatmapLayer) {
      this.heatmapLayer.setMap(null);
      this.heatmapLayer = null;
    }

    if (this.weatherOverlay) {
      this.weatherOverlay.setMap(null);
      this.weatherOverlay = null;
    }
  }

  /**
   * Get current map instance
   */
  getMapInstance(): google.maps.Map | undefined {
    return this.mapInstance ?? undefined;
  }
}

// Singleton instance
export const mapsService = new MapsService();