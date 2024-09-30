// WeatherResponse.ts
export interface WeatherResponse {
  current: {
    temp_f: number;
    feelslike_f: number;
    humidity: number;
    precip_in: number;
    wind_mph: number;
    wind_dir: string;
    gust_mph: number;
    dewpoint_f: number;
    condition: {
      text: string;
      icon: string;
    };
  };
  location: {
    name: string;
    country: string;
    region: string;
    localtime: string;
    tz_id: string;
  };
  name: string;
  country: string;
  forecast: {
    forecastday: [
      {
        date: string;
        day: {
          avgtemp_f: number;
          maxtemp_f: number;
          avghumidity: number;
          totalprecip_in: number;
          maxwind_mph: number;
          condition: {
            text: string;
            icon: string;
          };
        };
        high: {
          temp_f: number;
          feelslike_f: number;
          wind_mph: number;
          wind_dir: string;
          gust_mph: number;
          dewpoint_f: number;
        };
        low: {
          temp_f: number;
          feelslike_f: number;
          wind_mph: number;
          wind_dir: string;
          gust_mph: number;
          dewpoint_f: number;
        };
        precip_in: number;
        precip_mm: number;
        precip_type: string;
        precip_probability: number;
        time: string;
        astro: {
          sunrise: string;
          sunset: string;
        };
        hour: [
          {
            condition: {
              text: string;
              icon: string;
            };
            time: string;
            temp_f: number;
            feelslike_f: number;
            wind_mph: number;
            wind_dir: string;
            windchill_f: number;
            gust_mph: number;
            dewpoint_f: number;
            will_it_rain: boolean;
            chance_of_rain: number;
            will_it_snow: boolean;
            chance_of_snow: number;
            vis_miles: number;
          }
        ];
      }
    ];
  };
}
