import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './supabase';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getCurrentLocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          resolve({
            latitude,
            longitude,
            city: data.city,
            region: data.principalSubdivision,
            country: data.countryName,
          });
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export async function searchProfilesByDistance(criteria: {
  latitude: number;
  longitude: number;
  maxDistance: number;
  minAge?: number;
  maxAge?: number;
  gender?: string;
  lookingFor?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .rpc('search_profiles_by_distance', {
      p_user_id: user.id,
      p_latitude: criteria.latitude,
      p_longitude: criteria.longitude,
      p_max_distance: criteria.maxDistance,
      p_min_age: criteria.minAge,
      p_max_age: criteria.maxAge,
      p_gender: criteria.gender,
      p_looking_for: criteria.lookingFor
    });

  if (error) throw error;
  return data;
}