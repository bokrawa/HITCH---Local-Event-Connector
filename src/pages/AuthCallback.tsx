import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Create or update user profile
        const createOrUpdateProfile = async () => {
          const { user } = session;
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              full_name: user.user_metadata.full_name || '',
              email: user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (error) {
            console.error('Error updating profile:', error);
          }
        };

        createOrUpdateProfile();
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}