import React from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl';
import { Calendar, MapPin, List, Map as MapIcon, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { EventCard } from '../components/EventCard';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox access token
const MAPBOX_TOKEN = 'pk.eyJ1Ijoicm9oYW50OG1hciIsImEiOiJjbTZrdTg4b2MwMjF5MnNzOHBsY3A1dWttIn0.N4lXjVBHw9zal_Z8SDI-Aw';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  datetime: string;
  location_name: string;
  latitude: number;
  longitude: number;
}

const CATEGORY_COLORS = {
  'Music': '#FF0000',
  'Tech': '#00FF00',
  'Art': '#0000FF',
  'Sports': '#FFA500',
  'Food': '#800080',
  'Business': '#008080',
  'Education': '#FFD700',
  'Social': '#FF69B4',
  'Other': '#808080'
};

export function Events() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'map' | 'list'>('map');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [viewport, setViewport] = React.useState({
    latitude: 0,
    longitude: 0,
    zoom: 1
  });

  React.useEffect(() => {
    fetchEvents();

    // Set up real-time subscription
    const channel = supabase
      .channel('events_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCategory, selectedDate, searchQuery]);

  async function fetchEvents() {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .order('datetime', { ascending: true });

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (selectedDate) {
        const startDate = new Date(selectedDate);
        const endDate = new Date(selectedDate);
        endDate.setDate(endDate.getDate() + 1);
        
        query = query
          .gte('datetime', startDate.toISOString())
          .lt('datetime', endDate.toISOString());
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,location_name.ilike.%${searchQuery}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setEvents(data || []);

      // If we have events, center the map on the first event
      if (data && data.length > 0) {
        setViewport({
          latitude: data[0].latitude,
          longitude: data[0].longitude,
          zoom: 10
        });
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredEvents = events.filter(event => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(searchLower) ||
        event.location_name.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover Events</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center px-3 py-2 rounded-md ${
              viewMode === 'map'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MapIcon className="h-5 w-5 mr-2" />
            Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center px-3 py-2 rounded-md ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="h-5 w-5 mr-2" />
            List
          </button>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {Object.keys(CATEGORY_COLORS).map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {viewMode === 'map' ? (
        <div className="relative">
          <ErrorBoundary>
            <div className="h-[600px] rounded-lg overflow-hidden shadow-lg">
              <Map
                {...viewport}
                onMove={evt => setViewport(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
              >
                <NavigationControl position="top-right" />
                <FullscreenControl position="top-right" />

                {filteredEvents.map(event => (
                  <Marker
                    key={event.id}
                    latitude={event.latitude}
                    longitude={event.longitude}
                    onClick={e => {
                      e.originalEvent.stopPropagation();
                      setSelectedEvent(event);
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer transform transition-transform hover:scale-110"
                      style={{ backgroundColor: CATEGORY_COLORS[event.category] }}
                    />
                  </Marker>
                ))}

                {selectedEvent && (
                  <Popup
                    latitude={selectedEvent.latitude}
                    longitude={selectedEvent.longitude}
                    onClose={() => setSelectedEvent(null)}
                    closeButton={true}
                    closeOnClick={false}
                    anchor="bottom"
                  >
                    <div className="p-2 max-w-xs">
                      <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{selectedEvent.description}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(selectedEvent.datetime).toLocaleString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {selectedEvent.location_name}
                        </div>
                      </div>
                    </div>
                  </Popup>
                )}
              </Map>
            </div>
          </ErrorBoundary>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
            <h4 className="font-semibold mb-2">Event Categories</h4>
            <div className="space-y-2">
              {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
                <div key={category} className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm">{category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              categoryColor={CATEGORY_COLORS[event.category]}
            />
          ))}
        </div>
      )}
    </div>
  );
}