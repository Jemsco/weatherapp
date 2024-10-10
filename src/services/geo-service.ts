import geoApiClient from "./api-clients/geo-api-client";

export interface LocationData {
  country: string;
  countryCode: string;
  regionName: string;
  cityName: string;
  lat: number;
  lon: number;
  zip: string;
  timezone: string;
}

export const getGeoLocation = async (): Promise<LocationData> => {
  try {
    const response = await geoApiClient.get<LocationData>("");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch geolocation data:", error);
    throw error;
  }
};
