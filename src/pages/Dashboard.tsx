import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Footer } from '../components/Footer';

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [hasEvents, setHasEvents] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    checkUserAndEvents();
  }, [navigate]);

  async function checkUserAndEvents() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);

      // Check if user has any created events
      const { count } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('organizer_id', session.user.id);

      setHasEvents(count > 0);
    } catch (error) {
      console.error('Error checking user events:', error);
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

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover • Connect • Thrive
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join events that matter, connect with your community, and create lasting memories together.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">          
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
                <h2 className="text-xl font-semibold mb-4">Organize Events</h2>
                <p className="mb-6">Create and manage your own events, track RSVPs, and engage with attendees.</p>
                <button
                  onClick={() => navigate('/dashboard/organizer')}
                  className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                >
                  {hasEvents ? 'View Your Events' : 'Create Your First Event'}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg p-6 text-white">
                <h2 className="text-xl font-semibold mb-4">Discover Events</h2>
                <p className="mb-6">Find exciting events in your area and connect with like-minded people.</p>
                <button
                  onClick={() => navigate('/events')}
                  className="inline-flex items-center px-4 py-2 bg-white text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                >
                  Browse Events
                  <Calendar className="ml-2 h-5 w-5" />
                </button>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg p-6 text-white">
                <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
                <p className="mb-6">Update your information and manage your event preferences.</p>
                <button
                  onClick={() => navigate('/profile')}
                  className="inline-flex items-center px-4 py-2 bg-white text-amber-600 rounded-md hover:bg-amber-50 transition-colors"
                >
                  Edit Profile
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}