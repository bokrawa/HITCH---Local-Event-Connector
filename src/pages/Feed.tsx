import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Calendar, Tag as TagIcon, Search as SearchIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EventCard } from '../components/EventCard';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { useDebounce } from '../hooks/useDebounce';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  datetime: string;
  location_name: string;
  latitude: number;
  longitude: number;
  organizer_id: string;
}

interface Profile {
  interest_tags: string[];
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

export function Feed() {
  const navigate = useNavigate();
  const [events, setEvents] = React.useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = React.useState<Event[]>([]);
  const [userProfile, setUserProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showAllEvents, setShowAllEvents] = React.useState(false);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 300);

  React.useEffect(() => {
    checkAuth();
    fetchUserProfile();
  }, []);

  React.useEffect(() => {
    if (userProfile) {
      fetchEvents();
    }
  }, [userProfile, showAllEvents]);

  React.useEffect(() => {
    filterEvents();
  }, [events, selectedCategories, debouncedSearch]);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
  }

  async function fetchUserProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('interest_tags')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
      setSelectedCategories(data?.interest_tags || []);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user preferences.');
    }
  }

  async function fetchEvents() {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .gte('datetime', new Date().toISOString())
        .order('datetime', { ascending: true });

      if (!showAllEvents && userProfile?.interest_tags.length > 0) {
        query = query.in('category', userProfile.interest_tags);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
      setFilteredEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }

  function filterEvents() {
    let filtered = [...events];

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(event => selectedCategories.includes(event.category));
    }

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location_name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredEvents(filtered);

    // Update search suggestions
    if (searchQuery) {
      const newSuggestions = events
        .filter(event => 
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(event => event.title)
        .slice(0, 5);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }

  const categoryStats = React.useMemo(() => {
    return Object.entries(CATEGORY_COLORS).map(([category]) => ({
      name: category,
      count: events.filter(event => event.category === category).length
    }));
  }, [events]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Personalized Feed</h1>
          <p className="mt-2 text-gray-600">
            Discover events matching your interests
          </p>
        </div>
        <button
          onClick={() => setShowAllEvents(!showAllEvents)}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Filter className="h-5 w-5 mr-2" />
          {showAllEvents ? 'Show Matched Events' : 'Show All Events'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-[1fr,auto]">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            suggestions={suggestions}
            onSuggestionClick={(suggestion) => setSearchQuery(suggestion)}
            placeholder="Search by event name, description, or location..."
          />
          <div className="hidden md:block">
            <button
              onClick={() => setSelectedCategories([])}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear filters
            </button>
          </div>
        </div>

        <CategoryFilter
          categories={categoryStats}
          selectedCategories={selectedCategories}
          onToggleCategory={(category) => {
            setSelectedCategories(prev =>
              prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
            );
          }}
        />
      </div>

      {userProfile?.interest_tags.length === 0 ? (
        <div className="text-center py-12">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No interests set</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add some interests to your profile to get personalized event recommendations.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/profile')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Update Profile
            </button>
          </div>
        </div>
      ) : (
        <>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "No events match your search criteria"
                  : "No events found for the selected categories"}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategories([]);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  categoryColor={CATEGORY_COLORS[event.category]}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}