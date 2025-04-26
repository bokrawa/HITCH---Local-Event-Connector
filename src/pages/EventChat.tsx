import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  message: string;
  created_at: string;
  sender_id: string;
  sender: {
    full_name: string;
  };
  is_organizer?: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  organizer_name: string;
  attendee_count: number;
}

export function EventChat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [event, setEvent] = React.useState<Event | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [canAccess, setCanAccess] = React.useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<{ id: string; full_name: string } | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    checkAccess();
    fetchEventDetails();
    fetchMessages();
    getCurrentUser();

    const channel = supabase
      .channel(`event-chat-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `event_id=eq.${id}`
      }, payload => {
        const newMessage = payload.new as Message;
        setMessages(current => [...current, { ...newMessage, is_organizer: event?.organizer_id === newMessage.sender_id }]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', session.user.id)
        .single();
      
      if (data) {
        setCurrentUser(data);
      }
    }
  }

  async function checkAccess() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data } = await supabase
        .from('event_attendees')
        .select('id, first_chat')
        .eq('event_id', id)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data) {
        setCanAccess(true);
        if (!data.first_chat) {
          setIsFirstTimeUser(true);
          // Update first_chat status
          await supabase
            .from('event_attendees')
            .update({ first_chat: true })
            .eq('id', data.id);
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setError('Failed to verify access. Please try again.');
    }
  }

  async function fetchEventDetails() {
    try {
      const { data, error } = await supabase
        .from('event_details')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setEvent(data);

      // If first time user, send welcome message
      if (isFirstTimeUser && data && currentUser) {
        const welcomeMessage = `Welcome ${currentUser.full_name} to ${data.title}! This event is organized by ${data.organizer_name}. ${data.description} There are currently ${data.attendee_count} participants.`;
        await sendSystemMessage(welcomeMessage);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      setError('Failed to load event details.');
    }
  }

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          message,
          created_at,
          sender_id,
          sender:profiles(full_name)
        `)
        .eq('event_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Add is_organizer flag to messages
      const messagesWithOrganizerFlag = data?.map(message => ({
        ...message,
        is_organizer: event?.organizer_id === message.sender_id
      })) || [];

      setMessages(messagesWithOrganizerFlag);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }

  async function sendSystemMessage(message: string) {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          event_id: id,
          sender_id: event?.organizer_id,
          message: message
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending system message:', error);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('messages')
        .insert({
          event_id: id,
          sender_id: session.user.id,
          message: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  if (!canAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Want to join the conversation?
        </h2>
        <p className="text-gray-600 mb-6">
          You need to RSVP to this event to access the chat room.
        </p>
        <button
          onClick={() => navigate(`/events`)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Events
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate('/events')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Events
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {event?.title} - Chat Room
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`flex flex-col ${
                  message.is_organizer ? 'bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500' : ''
                }`}
              >
                <div className="flex items-baseline space-x-2">
                  <span className={`font-medium ${message.is_organizer ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {message.sender?.full_name || 'Anonymous'}
                    {message.is_organizer && (
                      <span className="ml-2 text-xs font-normal text-indigo-600">(Organizer)</span>
                    )}:
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className={`mt-1 ${message.is_organizer ? 'text-indigo-900' : 'text-gray-600'}`}>
                  {message.message}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}