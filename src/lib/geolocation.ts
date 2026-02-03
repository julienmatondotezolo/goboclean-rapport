export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

/**
 * Gets the user's current position
 * @returns Promise with coordinates
 */
export async function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'La géolocalisation n\'est pas supportée par votre navigateur',
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let message = 'Erreur lors de la géolocalisation';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permission de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Position indisponible';
            break;
          case error.TIMEOUT:
            message = 'Délai de géolocalisation dépassé';
            break;
        }
        
        reject({
          code: error.code,
          message,
        });
      },
      options
    );
  });
}

/**
 * Formats coordinates for display
 * @param coords - Coordinates object
 * @returns Formatted string
 */
export function formatCoordinates(coords: Coordinates): string {
  return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
}

/**
 * Creates a Google Maps URL from coordinates
 * @param coords - Coordinates object
 * @returns Google Maps URL
 */
export function createMapsUrl(coords: Coordinates): string {
  return `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
}

/**
 * Checks if geolocation is available
 * @returns True if geolocation is supported
 */
export function isGeolocationAvailable(): boolean {
  return 'geolocation' in navigator;
}
