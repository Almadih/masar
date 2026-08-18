import type { Waypoint } from '../types';

export interface KnownLocation {
  name: string;
  nameAr: string;
  latitude: number;
  longitude: number;
  country: string;
  countryAr?: string;
}

export const KNOWN_LOCATIONS: KnownLocation[] = [
  { name: 'Khartoum - Center', nameAr: 'الخرطوم - المركز', latitude: 15.5007, longitude: 32.5599, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Omdurman - Al-Thawra', nameAr: 'أم درمان - الثورة', latitude: 15.6500, longitude: 32.4800, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Bahri - Shambat', nameAr: 'بحري - شمبات', latitude: 15.6667, longitude: 32.5333, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Wad Madani', nameAr: 'ود مدني', latitude: 14.4012, longitude: 33.5199, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Sennar', nameAr: 'سنار', latitude: 13.5691, longitude: 33.5672, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Kosti', nameAr: 'كوستي', latitude: 13.1629, longitude: 32.6635, country: 'Sudan', countryAr: 'السودان' },
  { name: 'El Obeid', nameAr: 'الأبيض', latitude: 13.1843, longitude: 30.2167, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Gedaref', nameAr: 'القضارف', latitude: 14.0349, longitude: 35.3834, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Kassala', nameAr: 'كسلا', latitude: 15.4510, longitude: 36.4000, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Port Sudan', nameAr: 'بورتسودان', latitude: 19.6158, longitude: 37.2164, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Sawakin', nameAr: 'سواكن', latitude: 19.1058, longitude: 37.3321, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Atbara', nameAr: 'أتبرة', latitude: 17.6908, longitude: 33.9782, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Dongola', nameAr: 'دنقلا', latitude: 19.1764, longitude: 30.4739, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Wadi Halfa', nameAr: 'وادي حلفا', latitude: 21.7961, longitude: 31.3718, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Ashkeet Border Crossing', nameAr: 'معبر أرقين / أشكال الحدودية', latitude: 21.9880, longitude: 31.4240, country: 'Sudan/Egypt', countryAr: 'السودان / مصر' },
  { name: 'Metema / Gallabat Border', nameAr: 'معبر القلابات / ميتيما', latitude: 12.9606, longitude: 36.1492, country: 'Sudan/Ethiopia', countryAr: 'السودان / إثيوبيا' },
  { name: 'Renk Border', nameAr: 'الرنك - الحدود', latitude: 11.8317, longitude: 32.8025, country: 'South Sudan', countryAr: 'جنوب السودان' },
  { name: 'Cairo', nameAr: 'القاهرة', latitude: 30.0444, longitude: 31.2357, country: 'Egypt', countryAr: 'مصر' },
  { name: 'Aswan', nameAr: 'أسوان', latitude: 24.0889, longitude: 32.8998, country: 'Egypt', countryAr: 'مصر' },
  { name: 'Juba', nameAr: 'جوبا', latitude: 4.8594, longitude: 31.5713, country: 'South Sudan', countryAr: 'جنوب السودان' },
  { name: 'Kampala', nameAr: 'كمبالا', latitude: 0.3476, longitude: 32.5825, country: 'Uganda', countryAr: 'أوغندا' },
  { name: 'Addis Ababa', nameAr: 'أديس أبابا', latitude: 9.0300, longitude: 38.7400, country: 'Ethiopia', countryAr: 'إثيوبيا' },
  { name: 'Jeddah', nameAr: 'جدة', latitude: 21.5433, longitude: 39.1728, country: 'Saudi Arabia', countryAr: 'المملكة العربية السعودية' },
  { name: 'Nyala', nameAr: 'نيالا', latitude: 12.0500, longitude: 24.8833, country: 'Sudan', countryAr: 'السودان' },
  { name: 'El Fasher', nameAr: 'الفاشر', latitude: 13.6279, longitude: 25.3494, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Geneina', nameAr: 'الجنينة', latitude: 13.4500, longitude: 22.4500, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Zalingei', nameAr: 'زالنجي', latitude: 12.9000, longitude: 23.4833, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Ed Daein', nameAr: 'الضعين', latitude: 11.4600, longitude: 26.1300, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Kadugli', nameAr: 'كادوقلي', latitude: 11.0167, longitude: 29.7167, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Damazin', nameAr: 'الدمازين', latitude: 11.7667, longitude: 34.3500, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Rabak', nameAr: 'ربك', latitude: 13.1809, longitude: 32.7400, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Shendi', nameAr: 'شندي', latitude: 16.6915, longitude: 33.4344, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Berber', nameAr: 'بربر', latitude: 18.0217, longitude: 33.9833, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Karima', nameAr: 'كريمة', latitude: 18.5500, longitude: 31.8500, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Abu Hamad', nameAr: 'أبو حمد', latitude: 19.5333, longitude: 33.3167, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Singa', nameAr: 'سنجة', latitude: 13.1500, longitude: 33.9333, country: 'Sudan', countryAr: 'السودان' },
  { name: 'Adre / Chad Border', nameAr: 'معبر أدري - الحدود التشادية', latitude: 13.4667, longitude: 22.2000, country: 'Sudan/Chad', countryAr: 'السودان / تشاد' },
];

export interface LocationSearchResult {
  id: string;
  name: string;
  nameAr?: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  isPreset?: boolean;
}

/**
 * Searches locations using both local presets and OpenStreetMap Nominatim API
 */
export async function searchLocations(query: string, locale: string = 'ar'): Promise<LocationSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const results: LocationSearchResult[] = [];
  const lower = trimmed.toLowerCase();

  // 1. Search local known presets first (instant and verified)
  for (const loc of KNOWN_LOCATIONS) {
    const matchName = loc.name.toLowerCase().includes(lower);
    const matchAr = loc.nameAr.includes(trimmed);
    const matchCountry = loc.country.toLowerCase().includes(lower) || (loc.countryAr && loc.countryAr.includes(trimmed));

    if (matchName || matchAr || matchCountry) {
      const displayName = locale === 'ar' ? loc.nameAr : loc.name;
      const displayCountry = locale === 'ar' ? (loc.countryAr || loc.country) : loc.country;
      results.push({
        id: `preset-${loc.name}-${loc.latitude}-${loc.longitude}`,
        name: displayName,
        nameAr: loc.nameAr,
        fullAddress: `${displayName}, ${displayCountry}`,
        latitude: loc.latitude,
        longitude: loc.longitude,
        isPreset: true,
      });
    }
  }

  // 2. Query Nominatim for global/regional searches if query has 2+ characters
  if (trimmed.length >= 2) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=6&addressdetails=1`,
        {
          headers: { 'User-Agent': 'MasarSudanDisplacementApp/1.0' },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          for (const item of data) {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            if (!isNaN(lat) && !isNaN(lon)) {
              // Avoid duplicates with local presets that are very close (< 5km)
              const isDupe = results.some(
                r => calculateHaversineDistance(r.latitude, r.longitude, lat, lon) < 5
              );
              if (!isDupe) {
                const parts = (item.display_name || '').split(',');
                const title = parts[0]?.trim() || item.name || trimmed;
                const details = parts.slice(1, 4).map((p: string) => p.trim()).join(', ');

                results.push({
                  id: `nom-${item.place_id || `${lat}-${lon}`}`,
                  name: title,
                  fullAddress: details ? `${title}, ${details}` : title,
                  latitude: lat,
                  longitude: lon,
                  isPreset: false,
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Nominatim search failed or timed out:', e);
    }
  }

  return results;
}

/**
 * Calculates Haversine distance in kilometers between two lat/lng points
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculates total path distance along an array of waypoints
 */
export function calculateTotalJourneyDistance(
  waypoints: Array<{ latitude: number; longitude: number; timestamp?: string; order?: number }>
): number {
  if (!waypoints || waypoints.length < 2) return 0;
  const sorted = [...waypoints].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.timestamp && b.timestamp) {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    return 0;
  });
  let totalKm = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    totalKm += calculateHaversineDistance(
      sorted[i].latitude,
      sorted[i].longitude,
      sorted[i + 1].latitude,
      sorted[i + 1].longitude
    );
  }
  return totalKm;
}

/**
 * Find nearest known location name given lat/lng
 */
export function getNearestKnownLocation(lat: number, lng: number): string {
  let minDistance = Infinity;
  let nearestName = 'Unknown Location';

  for (const loc of KNOWN_LOCATIONS) {
    const dist = calculateHaversineDistance(lat, lng, loc.latitude, loc.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearestName = `${loc.name} (${loc.country})`;
    }
  }

  if (minDistance > 150) {
    return `Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
  return nearestName;
}

/**
 * Perform reverse geocoding via Nominatim with fallback to local lookup
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      { headers: { 'User-Agent': 'MasarSudanDisplacementApp/1.0' } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.suburb ||
          data.address.county ||
          data.address.state;
        const country = data.address.country;
        if (city && country) {
          return `${city}, ${country}`;
        } else if (data.display_name) {
          return data.display_name.split(',').slice(0, 2).join(', ');
        }
      }
    }
  } catch (e) {
    console.warn('Reverse geocode API failed, using fallback:', e);
  }

  return getNearestKnownLocation(lat, lng);
}
