import { ENV } from '../config/env.config';

export interface GeoCoords {
  latitude: number | null;
  longitude: number | null;
}

/**
 * Resolves latitude and longitude from city/province via OpenCage when omitted.
 */
export async function geocodeLocation(
  city?: string,
  province?: string,
): Promise<GeoCoords> {
  const query = [city, province, 'Indonesia'].filter(Boolean).join(', ');
  if (!ENV.OPENCAGE_API_KEY || !query) return { latitude: null, longitude: null };
  try {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${ENV.OPENCAGE_API_KEY}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return { latitude: null, longitude: null };
    const json = (await res.json()) as { results?: { geometry?: { lat: number; lng: number } }[] };
    const geo = json.results?.[0]?.geometry;
    return geo ? { latitude: geo.lat, longitude: geo.lng } : { latitude: null, longitude: null };
  } catch {
    return { latitude: null, longitude: null };
  }
}
