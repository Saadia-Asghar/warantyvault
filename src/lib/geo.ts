/** Haversine distance in kilometres between two WGS84 points */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function mapsDirectionsUrl(lat: number, lng: number, label?: string): string {
  const q = label ? encodeURIComponent(label) : `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&query=${q}`;
}

/** Fallback city centres when GPS is denied */
export const PK_CITY_CENTERS: Record<string, { lat: number; lng: number; label: string }> = {
  islamabad: { lat: 33.6844, lng: 73.0479, label: "Islamabad" },
  karachi: { lat: 24.8607, lng: 67.0011, label: "Karachi" },
  lahore: { lat: 31.5204, lng: 74.3587, label: "Lahore" },
  rawalpindi: { lat: 33.5651, lng: 73.0169, label: "Rawalpindi" },
};
