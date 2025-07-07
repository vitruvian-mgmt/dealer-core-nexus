import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, UserProfile, UserRole, CreateProfileData } from '@/types/auth';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  signInWithApple, 
  signOut 
} from '@/services/authService';
import { createProfile } from '@/services/profileService';

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({ ...prev, session, user: session?.user ?? null }));
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select(`
                  *,
                  dealerships (name),
                  roles (name, permissions)
                `)
                .eq('user_id', session.user.id)
                .single();
              // Add computed properties for compatibility
              if (profile) {
                profile.role = profile.roles?.name as UserRole;
                profile.dealership_name = profile.dealerships?.name || '';
              }
              
              setState(prev => ({ ...prev, profile, loading: false }));
            } catch (error) {
              console.error('Error fetching profile:', error);
              setState(prev => ({ ...prev, loading: false }));
            }
          }, 0);
        } else {
          setState(prev => ({ ...prev, profile: null, loading: false }));
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null }));
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCreateProfile = async (profileData: CreateProfileData) => {
    return createProfile(state.user, profileData);
  };

  return {
    ...state,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    createProfile: handleCreateProfile,
  };
};

export type { UserRole, UserProfile, CreateProfileData };