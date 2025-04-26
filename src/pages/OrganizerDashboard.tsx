import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, MessageSquare, Users, Calendar, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Line } from 'react-chartjs-2';
import { DeleteEventModal } from '../components/DeleteEventModal';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Event {
  id: string;
  title: string;
  description: string;
  datetime: string;
  location_name: string;
  category: string;
  rsvp_count: number;
  message_count: number;
  created_at: string;
}

export function OrganizerDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedEvent, setSelectedEvent] = React.useState<string | null>(null);
  const [rsvpData, setRsvpData] = React.useState<{ labels: string[]; data: number[] }>({
    labels: [],
    data: []
  });
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [eventToDelete, setEventToDelete] = React.useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    checkAccess();
    fetchEvents();
  }, [filter]);

  async function checkAccess() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
  }

  async function fetchEvents() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let query = supabase
        .from('events')
        .select(`
          *,
          rsvp_count:event_attendees(count),
          message_count:messages(count)
        `)
        .eq('organizer_id', session.user.id);

      if (filter === 'upcoming') {
        query = query.gte('datetime', new Date().toISOString());
      } else if (filter === 'past') {
        query = query.lt('datetime', new Date().toISOString());
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedEvents = data?.map(event => ({
        ...event,
        rsvp_count: event.rsvp_count?.[0]?.count || 0,
        message_count: event.message_count?.[0]?.count || 0
      })) || [];

      setEvents(formattedEvents);

      if (selectedEvent) {
        fetchRSVPData(selectedEvent);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchRSVPData(eventId: string) {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('created_at')
        .eq('event_id', eventId)
        .order('created_at');

      if (error) throw error;

      // Group RSVPs by date
      const rsvpsByDate = data.reduce((acc: { [key: string]: number }, rsvp) => {
        const date = new Date(rsvp.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      setRsvpData({
        labels: Object.keys(rsvpsByDate),
        data: Object.values(rsvpsByDate)
      });
    } catch (error) {
      console.error('Error fetching RSVP data:', error);
    }
  }

  async function handleDeleteEvent() {
    if (!eventToDelete) return;

    try {
      setIsDeleting(true);
      setError('');

      // Delete event - this will cascade to all related tables
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete.id);

      if (error) throw error;

      // Update local state
      setEvents(events.filter(event => event.id !== eventToDelete.id));
      setEventToDelete(null);
      setDeleteModalOpen(false);

      // Show success message
      alert('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }

  function handleEditEvent(eventId: string) {
    navigate(`/create-event?edit=${eventId}`);
  }

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            You haven't created any events yet
          </h2>
          <p className="text-gray-600 mb-8">
            Get started by creating your first event and connecting with your community.
          </p>
          <button
            onClick={() => navigate('/create-event')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Your First Event
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your events and track their performance
          </p>
        </div>
        <button
          onClick={() => navigate('/create-event')}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create New Event
          <Calendar className="ml-2 h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'upcoming' | 'past')}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RSVPs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Messages
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.map(event => (
              <tr 
                key={event.id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  selectedEvent === event.id ? 'bg-indigo-50' : ''
                }`}
                onClick={() => {
                  setSelectedEvent(event.id);
                  fetchRSVPData(event.id);
                }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {event.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.category}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(event.datetime).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{event.rsvp_count}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{event.message_count}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event.id);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventToDelete(event);
                        setDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEvent && rsvpData.labels.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">RSVP Growth</h2>
          <div className="h-64">
            <Line
              data={{
                labels: rsvpData.labels,
                datasets: [
                  {
                    label: 'RSVPs',
                    data: rsvpData.data,
                    borderColor: 'rgb(79, 70, 229)',
                    tension: 0.1
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      <DeleteEventModal
        isOpen={deleteModalOpen}
        eventTitle={eventToDelete?.title || ''}
        onConfirm={handleDeleteEvent}
        onCancel={() => {
          setDeleteModalOpen(false);
          setEventToDelete(null);
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
}