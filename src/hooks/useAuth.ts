import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'sales_manager' | 'sales_rep' | 'technician' | 'inventory_manager' | 'accountant';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  dealership_id: string;
  dealership_name: string; // Keep for compatibility
  role_id: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  dealerships?: {
    name: string;
  };
  roles?: {
    name: string;
    permissions: any; // Use any for JSON compatibility
  };
  // Add computed properties for compatibility
  role?: UserRole;
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

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    return { error };
  };

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

  const signInWithApple = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
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

    try {
      // Special handling for tdebique@gmail.com - auto-associate with "Trucks and Boats"
      let finalDealershipName = profileData.dealership_name;
      if (state.user.email === 'tdebique@gmail.com') {
        finalDealershipName = 'Trucks and Boats';
      }

      // First, create or get dealership
      let dealership_id: string;
      
      const { data: existingDealership } = await supabase
        .from('dealerships')
        .select('id')
        .eq('name', finalDealershipName)
        .single();

      if (existingDealership) {
        dealership_id = existingDealership.id;
      } else {
        const { data: newDealership, error: dealershipError } = await supabase
          .from('dealerships')
          .insert({ name: finalDealershipName })
          .select('id')
          .single();

        if (dealershipError || !newDealership) {
          return { error: new Error('Failed to create dealership') };
        }

        dealership_id = newDealership.id;
      }

      // Get the role_id for the specified role
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('dealership_id', dealership_id)
        .eq('name', profileData.role)
        .single();

      if (!role) {
        return { error: new Error('Role not found') };
      }

      // Create profile with minimal fields (dealership_name will be populated by trigger)
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: state.user.id,
          email: state.user.email!,
          full_name: profileData.full_name,
          dealership_id: dealership_id,
          role_id: role.id,
          phone: profileData.phone || null,
          dealership_name: finalDealershipName, // Keep for compatibility
        });

      return { error };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  return {
    ...state,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    createProfile,
  };
};