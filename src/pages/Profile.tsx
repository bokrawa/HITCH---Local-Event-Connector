import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PREDEFINED_INTERESTS = [
  'Sports', 'Music', 'Technology', 'Art', 'Food', 'Travel',
  'Photography', 'Gaming', 'Reading', 'Fitness', 'Movies',
  'Science', 'Fashion', 'Business', 'Education'
];

export function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [profile, setProfile] = React.useState({
    full_name: '',
    bio: '',
    location: '',
    interest_tags: [] as string[]
  });
  const [newInterest, setNewInterest] = React.useState('');

  React.useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id);

      if (error) throw error;

      // If we have data and at least one profile, use it
      if (data && data.length > 0) {
        setProfile(data[0]);
      } else {
        // If no profile exists, we'll keep the default empty values
        // This allows the user to create their profile
        console.log('No profile found for user, using default empty values');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleInterestAdd() {
    if (newInterest && !profile.interest_tags.includes(newInterest)) {
      setProfile(prev => ({
        ...prev,
        interest_tags: [...prev.interest_tags, newInterest]
      }));
      setNewInterest('');
    }
  }

  function handleInterestRemove(interest: string) {
    setProfile(prev => ({
      ...prev,
      interest_tags: prev.interest_tags.filter(tag => tag !== interest)
    }));
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            value={profile.full_name}
            onChange={e => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            value={profile.bio}
            onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={profile.location}
            onChange={e => setProfile(prev => ({ ...prev, location: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interests
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.interest_tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleInterestRemove(tag)}
                  className="ml-2 inline-flex items-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <select
              value={newInterest}
              onChange={e => setNewInterest(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select an interest...</option>
              {PREDEFINED_INTERESTS.filter(interest => !profile.interest_tags.includes(interest))
                .map(interest => (
                  <option key={interest} value={interest}>
                    {interest}
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={handleInterestAdd}
              disabled={!newInterest}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}