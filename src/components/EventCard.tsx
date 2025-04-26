import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

interface Props {
  event: Event;
  categoryColor: string;
}

export function EventCard({ event, categoryColor }: Props) {
  const [isRSVPed, setIsRSVPed] = React.useState(false);
  const [attendeeCount, setAttendeeCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const isPastEvent = new Date(event.datetime) < new Date();

  React.useEffect(() => {
    checkRSVPStatus();
    fetchAttendeeCount();

    const channel = supabase
      .channel(`event-${event.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'event_attendees',
        filter: `event_id=eq.${event.id}`
      }, () => {
        fetchAttendeeCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id]);

  async function checkRSVPStatus() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', session.user.id)
        .maybeSingle();

      setIsRSVPed(!!data);
    } catch (error) {
      console.error('Error checking RSVP status:', error);
    }
  }

  async function fetchAttendeeCount() {
    try {
      const { count } = await supabase
        .from('event_attendees')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event.id);

      setAttendeeCount(count || 0);
    } catch (error) {
      console.error('Error fetching attendee count:', error);
    }
  }

  async function handleRSVP() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = '/login';
        return;
      }

      if (isRSVPed) {
        await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', session.user.id);
      } else {
        await supabase
          .from('event_attendees')
          .insert({
            event_id: event.id,
            user_id: session.user.id,
            first_chat: false
          });
      }

      setIsRSVPed(!isRSVPed);
    } catch (error) {
      console.error('Error updating RSVP:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all relative ${
        isPastEvent ? 'opacity-70 grayscale' : ''
      }`}
    >
      {isPastEvent && (
        <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
          Past Event • Ended {new Date(event.datetime).toLocaleDateString()} at {new Date(event.datetime).toLocaleTimeString()}
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
          <span 
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${categoryColor}20`,
              color: categoryColor
            }}
          >
            {event.category}
          </span>
        </div>
        <p className="mt-2 text-gray-600 line-clamp-2">{event.description}</p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-gray-500">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{new Date(event.datetime).toLocaleString()}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{event.location_name}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Users className="h-5 w-5 mr-2" />
            <span>{attendeeCount} attending</span>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleRSVP}
            disabled={loading || isPastEvent}
            className={`flex-1 mr-2 px-4 py-2 border rounded-md font-medium ${
              isRSVPed
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700'
            } transition-colors disabled:opacity-50`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              </div>
            ) : isPastEvent ? (
              'Event Ended'
            ) : isRSVPed ? (
              'Going!'
            ) : (
              'RSVP'
            )}
          </button>
          {isRSVPed && !isPastEvent && (
            <Link
              to={`/events/${event.id}/chat`}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}