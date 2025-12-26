'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GradientCard } from './dashboard/GradientCard';

interface FarmSection {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  size: number;
  soilType: string;
  cropType: string;
  animals: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface AnimalLocation {
  id: string;
  name: string;
  species: string;
  latitude: number;
  longitude: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
}

interface MapLegendItem {
  color: string;
  label: string;
  description: string;
}

const InteractiveMap: React.FC = () => {
  const [farmSections, setFarmSections] = useState<FarmSection[]>([]);
  const [animalLocations, setAnimalLocations] = useState<AnimalLocation[]>([]);
  const [selectedSection, setSelectedSection] = useState<FarmSection | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration - in production this would come from API
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock farm sections data
        const sections: FarmSection[] = [
          {
            id: 'section-1',
            name: 'Main Grazing Area',
            latitude: -26.2041,
            longitude: 28.0473,
            size: 50,
            soilType: 'Clay Loam',
            cropType: 'Pasture',
            animals: 25,
            status: 'healthy'
          },
          {
            id: 'section-2',
            name: 'Northern Pasture',
            latitude: -26.2050,
            longitude: 28.0480,
            size: 30,
            soilType: 'Sandy Loam',
            cropType: 'Pasture',
            animals: 12,
            status: 'warning'
          },
          {
            id: 'section-3',
            name: 'Watering Zone',
            latitude: -26.2035,
            longitude: 28.0465,
            size: 15,
            soilType: 'Clay',
            cropType: 'Water Source',
            animals: 8,
            status: 'healthy'
          },
          {
            id: 'section-4',
            name: 'Breeding Area',
            latitude: -26.2055,
            longitude: 28.0470,
            size: 20,
            soilType: 'Loamy Sand',
            cropType: 'Special Feed',
            animals: 6,
            status: 'healthy'
          }
        ];

        // Mock animal locations data
        const animals: AnimalLocation[] = [
          {
            id: 'animal-1',
            name: 'Bella',
            species: 'Cattle',
            latitude: -26.2042,
            longitude: 28.0474,
            healthStatus: 'healthy',
            lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          },
          {
            id: 'animal-2',
            name: 'Max',
            species: 'Cattle',
            latitude: -26.2048,
            longitude: 28.0478,
            healthStatus: 'healthy',
            lastUpdated: new Date(Date.now() - 15 * 60 * 1000).toISOString()
          },
          {
            id: 'animal-3',
            name: 'Daisy',
            species: 'Sheep',
            latitude: -26.2036,
            longitude: 28.0466,
            healthStatus: 'warning',
            lastUpdated: new Date(Date.now() - 45 * 60 * 1000).toISOString()
          },
          {
            id: 'animal-4',
            name: 'Rocky',
            species: 'Sheep',
            latitude: -26.2052,
            longitude: 28.0472,
            healthStatus: 'healthy',
            lastUpdated: new Date(Date.now() - 20 * 60 * 1000).toISOString()
          }
        ];

        setFarmSections(sections);
        setAnimalLocations(animals);
        setMapLoaded(true);
      } catch (err) {
        console.error('Failed to fetch map data:', err);
        setError('Failed to load farm map data. Using cached data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: 'healthy' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'warning': return 'Warning';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };

  const handleSectionClick = (section: FarmSection) => {
    setSelectedSection(section);
    setSelectedAnimal(null);
  };

  const handleAnimalClick = (animal: AnimalLocation) => {
    setSelectedAnimal(animal);
    setSelectedSection(null);
  };

  const handleCloseDetails = () => {
    setSelectedSection(null);
    setSelectedAnimal(null);
  };

  const MapLegend: React.FC = () => {
    const legendItems: MapLegendItem[] = [
      { color: 'bg-green-500', label: 'Healthy', description: 'Optimal conditions' },
      { color: 'bg-yellow-500', label: 'Warning', description: 'Needs attention' },
      { color: 'bg-red-500', label: 'Critical', description: 'Urgent action required' },
      { color: 'bg-blue-500', label: 'Water', description: 'Water sources' },
      { color: 'bg-purple-500', label: 'Animals', description: 'Livestock locations' }
    ];

    return (
      <div className="map-legend bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
          MAP LEGEND:
        </div>
        <div className="space-y-2">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                {item.label}: <span className="text-gray-500 dark:text-gray-400">{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const FarmSectionDetails: React.FC<{ section: FarmSection }> = ({ section }) => {
    return (
      <div className="section-details bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {section.name}
          </h3>
          <button
            onClick={handleCloseDetails}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Size</div>
            <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {section.size} ha
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Animals</div>
            <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {section.animals}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Soil Type</div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {section.soilType}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Crop Type</div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {section.cropType}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(section.status)} mr-2`}></div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {getStatusText(section.status)}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Coordinates: {section.latitude.toFixed(4)}, {section.longitude.toFixed(4)}
        </div>

        <button className="w-full btn-primary text-sm py-2 px-4 rounded mt-3">
          View Detailed Analytics
        </button>
      </div>
    );
  };

  const AnimalDetails: React.FC<{ animal: AnimalLocation }> = ({ animal }) => {
    return (
      <div className="animal-details bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {animal.name} ({animal.species})
          </h3>
          <button
            onClick={handleCloseDetails}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Health Status</div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(animal.healthStatus)} mr-2`}></div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {getStatusText(animal.healthStatus)}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Updated</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {new Date(animal.lastUpdated).toLocaleString()}
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Location: {animal.latitude.toFixed(4)}, {animal.longitude.toFixed(4)}
        </div>

        <div className="flex gap-2 mt-4">
          <button className="flex-1 btn-primary text-sm py-2 px-4 rounded">
            View Health Records
          </button>
          <button className="flex-1 btn-secondary text-sm py-2 px-4 rounded">
            Track Movement
          </button>
        </div>
      </div>
    );
  };

  if (loading && !mapLoaded) {
    return (
      <GradientCard
        title="Farm Map"
        value="Loading..."
        gradient="metallic-blue"
        className="interactive-map"
      >
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-2">
          Loading farm map and location data...
        </div>
      </GradientCard>
    );
  }

  if (error) {
    return (
      <GradientCard
        title="Farm Map"
        value="Offline"
        gradient="metallic-blue"
        className="interactive-map"
      >
        <div className="text-center p-4">
          <div className="text-yellow-500 mb-2">⚠️</div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {error}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Some features may be limited
          </div>
        </div>
      </GradientCard>
    );
  }

  return (
    <GradientCard
      title="Farm Map"
      value={`${farmSections.length} Sections • ${animalLocations.length} Animals`}
      gradient="metallic-blue"
      className="interactive-map"
    >
      <div className="map-container relative">
        {/* Interactive Map Visualization */}
        <div
          ref={mapRef}
          className="farm-map bg-gradient-to-br from-green-100 to-blue-100 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden relative"
          style={{ height: '400px', position: 'relative' }}
        >
          {/* Farm Sections */}
          {farmSections.map((section) => (
            <div
              key={section.id}
              className={`farm-section absolute cursor-pointer hover:z-10 transition-all duration-200 ${getStatusColor(section.status)}`}
              style={{
                left: `${((section.longitude - 28.0460) / 0.0020) * 100}%`,
                top: `${((section.latitude + 26.2060) / 0.0020) * 100}%`,
                width: `${Math.sqrt(section.size) * 8}%`,
                height: `${Math.sqrt(section.size) * 6}%`,
                minWidth: '40px',
                minHeight: '30px',
                borderRadius: '8px',
                opacity: '0.8',
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handleSectionClick(section)}
            >
              <div className="section-label absolute inset-0 flex items-center justify-center text-white text-xs font-bold p-1">
                {section.name.split(' ')[0]}
              </div>
              <div className="animal-count absolute bottom-1 right-1 bg-white bg-opacity-20 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {section.animals}
              </div>
            </div>
          ))}

          {/* Animal Locations */}
          {animalLocations.map((animal) => (
            <div
              key={animal.id}
              className="animal-marker absolute cursor-pointer hover:z-20 transition-all duration-200 bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-sm font-bold"
              style={{
                left: `${((animal.longitude - 28.0460) / 0.0020) * 100}%`,
                top: `${((animal.latitude + 26.2060) / 0.0020) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handleAnimalClick(animal)}
            >
              {animal.species.charAt(0)}
            </div>
          ))}

          {/* Water Sources */}
          <div className="water-source absolute bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold cursor-pointer hover:z-10 transition-all duration-200"
               style={{
                 left: '70%',
                 top: '60%',
                 transform: 'translate(-50%, -50%)'
               }}>
            💧
          </div>

          {/* Map Controls */}
          <div className="map-controls absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <button className="control-button bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              🔍
            </button>
            <button className="control-button bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              📍
            </button>
            <button className="control-button bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              🔄
            </button>
          </div>
        </div>

        {/* Map Legend */}
        <div className="mt-4">
          <MapLegend />
        </div>

        {/* Details Panel */}
        {(selectedSection || selectedAnimal) && (
          <div className="details-panel mt-4">
            {selectedSection && <FarmSectionDetails section={selectedSection} />}
            {selectedAnimal && <AnimalDetails animal={selectedAnimal} />}
          </div>
        )}

        {/* Map Stats */}
        <div className="map-stats mt-4 grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Area</div>
            <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {farmSections.reduce((sum, section) => sum + section.size, 0)} ha
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Animals</div>
            <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {farmSections.reduce((sum, section) => sum + section.animals, 0)}
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          Interactive farm map • Real-time location tracking • Agricultural analytics
        </div>
      </div>
    </GradientCard>
  );
};

// Export for use in dashboard
export default InteractiveMap;