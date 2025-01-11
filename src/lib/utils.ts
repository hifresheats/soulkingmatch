import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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