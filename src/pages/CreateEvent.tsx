import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LocationPicker } from '../components/LocationPicker';
import { useToast } from '../hooks/useToast';

const CATEGORIES = [
  'Music',
  'Tech',
  'Art',
  'Sports',
  'Food',
  'Business',
  'Education',
  'Social',
  'Other'
];

interface EventForm {
  title: string;
  description: string;
  category: string;
  datetime: string;
  location_name: string;
  latitude: number;
  longitude: number;
}

export function CreateEvent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [event, setEvent] = React.useState<EventForm>({
    title: '',
    description: '',
    category: '',
    datetime: '',
    location_name: '',
    latitude: 0,
    longitude: 0
  });

  React.useEffect(() => {
    const editId = new URLSearchParams(location.search).get('edit');
    if (editId) {
      fetchEventDetails(editId);
    }
  }, [location]);

  async function fetchEventDetails(eventId: string) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      if (data) {
        setEvent({
          ...data,
          datetime: new Date(data.datetime).toISOString().slice(0, 16)
        });
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      addToast('Failed to load event details', 'error');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      if (!event.location_name || !event.latitude || !event.longitude) {
        throw new Error('Please select a location for your event');
      }

      const editId = new URLSearchParams(location.search).get('edit');
      const { error } = editId
        ? await supabase
            .from('events')
            .update(event)
            .eq('id', editId)
        : await supabase
            .from('events')
            .insert({
              ...event,
              organizer_id: session.user.id
            });

      if (error) throw error;

      addToast(
        editId ? 'Event updated successfully' : 'Event created successfully',
        'success'
      );
      navigate('/dashboard/organizer');
    } catch (error) {
      console.error('Error saving event:', error);
      setError(error.message);
      addToast('Failed to save event', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {location.search.includes('edit') ? 'Edit Event' : 'Create New Event'}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Event Title
          </label>
          <input
            type="text"
            id="title"
            required
            value={event.title}
            onChange={e => setEvent(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={event.description}
            onChange={e => setEvent(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            required
            value={event.category}
            onChange={e => setEvent(prev => ({ ...prev, category: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a category...</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="datetime" className="block text-sm font-medium text-gray-700">
            Date & Time
          </label>
          <div className="mt-1 relative">
            <input
              type="datetime-local"
              id="datetime"
              required
              value={event.datetime}
              onChange={e => setEvent(prev => ({ ...prev, datetime: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <LocationPicker
            value={{
              latitude: event.latitude,
              longitude: event.longitude,
              location_name: event.location_name
            }}
            onChange={({ latitude, longitude, location_name }) => 
              setEvent(prev => ({
                ...prev,
                latitude,
                longitude,
                location_name
              }))
            }
            onError={(error) => {
              setError(error);
              addToast(error, 'error');
            }}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {location.search.includes('edit') ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {location.search.includes('edit') ? 'Update Event' : 'Create Event'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}