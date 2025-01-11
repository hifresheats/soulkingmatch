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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null });
  },
  loadProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    set({ user });

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      set({ profile });
    }
    
    set({ loading: false });
  },
}));