import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Database['public']['Tables']['profiles']['Row'] | null;
  loading: boolean;
  signUp: (email: string, password: string, profileData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  signUp: async (email, password, profileData) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    
    // Create profile after successful signup
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: email.split('@')[0],
          full_name: profileData.full_name,
          birth_date: profileData.birth_date,
          gender: profileData.gender,
          looking_for: profileData.looking_for,
          location: profileData.location || null,
          latitude: profileData.geoLocation?.latitude || null,
          longitude: profileData.geoLocation?.longitude || null,
          bio: profileData.bio,
        });
      if (profileError) throw profileError;
    }
  },
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data?.user) {
      throw new Error('No user returned from sign in');
    }
    
    set({ user: data.user });
    return data.user;
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Signout error:', error);
      }
    } catch (error) {
      console.error('Error during signout:', error);
    } finally {
      // Always clear local state regardless of signout success
      localStorage.removeItem('sb-uwqknlbeousnaieoiwvx-auth-token');
    }
    
    set({ user: null, profile: null });
  },
  loadProfile: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

      if (session && user) {
        set({ user });
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        set({ profile });
      } else {
        set({ user: null, profile: null });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      set({ user: null, profile: null });
    } finally {
      set({ loading: false });
    }
  },
}));