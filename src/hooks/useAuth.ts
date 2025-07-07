import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'sales_manager' | 'sales_rep' | 'technician' | 'inventory_manager' | 'accountant';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  dealership_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
}

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
                .select('*')
                .eq('user_id', session.user.id)
                .single();
              
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

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const createProfile = async (profileData: {
    full_name: string;
    role: UserRole;
    dealership_name: string;
    phone?: string;
  }) => {
    if (!state.user) return { error: new Error('No user found') };

    const { error } = await supabase
      .from('profiles')
      .insert({
        user_id: state.user.id,
        email: state.user.email!,
        ...profileData,
      });

    return { error };
  };

  return {
    ...state,
    signInWithGoogle,
    signOut,
    createProfile,
  };
};