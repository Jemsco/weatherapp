import geoApiClient from "./api-clients/geo-api-client";

// Fields as returned by freeipapi.com (/api/json).
export interface LocationData {
  cityName: string;
  regionName: string;
  countryName: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  zipCode: string;
  timeZone: string;
}

/**
 * IP-based geolocation (freeipapi).
 * No permission prompt and works instantly, but only city-level accurate and
 * can be wrong behind VPNs or mobile carriers. Used as a fallback.
 */
export const getGeoLocation = async (): Promise<LocationData> => {
  try {
    const response = await geoApiClient.get<LocationData>("");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch geolocation data:", error);
    throw error;
  }
};

/**
 * Browser Geolocation API.
 * Device-level accuracy (GPS/Wi-Fi) but requires HTTPS and a user permission
 * prompt. Rejects if unsupported, denied, or it times out. Used as the primary
 * source, with getGeoLocation() as the fallback.
 */
export const getBrowserCoords = (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
};
