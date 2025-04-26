import React from 'react';
import Map, { Marker } from 'react-map-gl';
import { MapPin, Search, X } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoicm9oYW50OG1hciIsImEiOiJjbTZrdTg4b2MwMjF5MnNzOHBsY3A1dWttIn0.N4lXjVBHw9zal_Z8SDI-Aw';

interface Location {
  latitude: number;
  longitude: number;
  location_name: string;
}

interface LocationPickerProps {
  value: Location;
  onChange: (location: Location) => void;
  onError?: (error: string) => void;
}

export function LocationPicker({ value, onChange, onError }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [viewport, setViewport] = React.useState({
    latitude: value.latitude || 0,
    longitude: value.longitude || 0,
    zoom: value.latitude ? 13 : 1
  });
  const [loading, setLoading] = React.useState(false);

  const handleSearch = React.useCallback(async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${MAPBOX_TOKEN}&types=address,place`
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setSearchResults(data.features);
    } catch (error) {
      console.error('Search error:', error);
      onError?.('Failed to search location. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, onError]);

  const handleSelectLocation = async (feature: any) => {
    const [longitude, latitude] = feature.center;
    const location_name = feature.place_name;

    setViewport({
      latitude,
      longitude,
      zoom: 13
    });

    onChange({
      latitude,
      longitude,
      location_name
    });

    setSearchQuery('');
    setSearchResults([]);
  };

  const handleMapClick = async (event: any) => {
    const { lngLat } = event;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${MAPBOX_TOKEN}`
      );

      if (!response.ok) throw new Error('Reverse geocoding failed');

      const data = await response.json();
      const location = data.features[0];

      onChange({
        latitude: lngLat.lat,
        longitude: lngLat.lng,
        location_name: location?.place_name || `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`
      });
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      onError?.('Failed to get address. Please try again or enter manually.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for a location..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelectLocation(result)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
              >
                {result.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <ErrorBoundary>
        <div className="h-[400px] rounded-lg overflow-hidden border border-gray-300">
          <Map
            {...viewport}
            onMove={evt => setViewport(evt.viewState)}
            onClick={handleMapClick}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            {value.latitude && value.longitude && (
              <Marker
                latitude={value.latitude}
                longitude={value.longitude}
                anchor="bottom"
              >
                <MapPin className="h-8 w-8 text-indigo-600" />
              </Marker>
            )}
          </Map>
        </div>
      </ErrorBoundary>

      {value.location_name && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium text-gray-700 mb-2">Selected Location</h4>
          <p className="text-gray-600">{value.location_name}</p>
          <div className="mt-2 text-sm text-gray-500">
            Coordinates: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
}