import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Add error handling for token refresh failures
    onAuthStateChange: (event, session) => {
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.log('Token refresh failed, session cleared');
      }
    }
  }
});

// Helper function to get current user profile with retry logic
export const getCurrentUserProfile = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        return null;
      }
      
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found, try to create it
          console.log('Profile not found, attempting to create...');
          
          const { data: createdProfile, error: createError } = await supabase
            .rpc('create_user_profile', {
              p_auth_id: user.id,
              p_nome: user.user_metadata?.nome || 'Usuário',
              p_cpf: user.user_metadata?.cpf || '',
              p_telefone: user.user_metadata?.telefone || null,
              p_role: user.email === 'admin@rifa.com' ? 'admin' : 'user'
            });

          if (createError) {
            console.error('Error creating user profile:', createError);
            if (i === retries - 1) return null;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            continue;
          }

          // Try to fetch the profile again
          const { data: newProfile, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', user.id)
            .single();

          if (fetchError) {
            console.error('Error fetching created profile:', fetchError);
            if (i === retries - 1) return null;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            continue;
          }

          return newProfile;
        } else {
          console.error('Error fetching user profile:', error);
          if (i === retries - 1) return null;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
      }

      return profile;
    } catch (error) {
      console.error('Exception getting user profile:', error);
      if (i === retries - 1) return null;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  return null;
};

// Helper function to check if user is admin
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const profile = await getCurrentUserProfile();
    return profile?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};