import { supabase } from '@/integrations/supabase/client';

export const signInWithEmail = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { error };
};

export const signUpWithEmail = async (email: string, password: string) => {
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

export const signInWithGoogle = async () => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl
    }
  });
  
  return { error };
};

export const signInWithApple = async () => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: redirectUrl
    }
  });
  
  return { error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};