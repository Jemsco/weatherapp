import React, { useEffect, useRef, useState, useCallback } from "react";
import { getGeoLocation, LocationData } from "../services/geo-service";
import { getWeatherData, WeatherData } from "../services/weather-service";
import { AxiosError, CanceledError } from "axios";

const KEY = import.meta.env.VITE_REACT_APP_API_KEY;

const Weather = () => {
  const [place, setPlace] = useState("");
  const [response, setResponse] = useState<WeatherData | null>(null);
  const isForecast = true;
  const [isFetching, setIsFetching] = useState(false);
  const [currentHourly, setCurrentHourly] = useState(false);
  const [tomorrowHourly, setTomorrowHourly] = useState(false);
  const [theNextDayHourly, setTheNextDayHourly] = useState(false);
  const [isLocationInitialized, setIsLocationInitialized] = useState(false);
  const inputRef = useRef(null);
  const future = isForecast ? response?.forecast?.forecastday : [];
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  console.log('ERORR',error);
  

   const fetchWeather = useCallback(async () => {
     const endpoint = isForecast ? "forecast.json" : "current.json";
     const url = `${endpoint}?key=${KEY}&q=${place}&days=3&aqi=no`;
     if (!isFetching) {
       setIsFetching(true);
       try {
         const data = await getWeatherData(url);
         setResponse(data);
       } catch (error: unknown) {
         setError((error as AxiosError).message);
         console.error("Error fetching weather data:", error);
         setResponse(null);
       } finally {
         setIsFetching(false);
       }
     } 
    
   }, [isFetching, isForecast, place]);

   //geolocation
 useEffect(() => {

   const fetchLocation = async () => {
     try {
       const locationData = await getGeoLocation();
       setLocationData(locationData);
     } catch (err: unknown) { 
       if (err instanceof CanceledError) {
         if (err.name === "AbortError") {
           console.log("Fetch aborted");
           setError(`Failed to load location data: ${err.message}`);
         } else {
           setError(null);
         }
       } else {
         console.error("An unexpected error occurred:", err);
       }
     }
     finally {
       setIsFetching(false);
       setError(null);
     }
   };

   fetchLocation();
 }, [error]);


  // Initialize the location data
  useEffect(() => {
    if (locationData && !isLocationInitialized) {
      setPlace(`${locationData.cityName}, ${locationData.regionName}`);
      setIsLocationInitialized(true);
    } else if (!locationData) {
      setPlace("");
      setIsLocationInitialized(false);
    }
  }, [locationData, isLocationInitialized]);

  // Fetch weather data when place changes
  useEffect(() => {
    if (place.length === 5 && !isNaN(Number(place))) {
      // If input length is 5 and all are numbers (US zip code)
      fetchWeather();
    } else if (place.length > 5 && !isNaN(Number(place))) {
      // If input length is greater than 5 and all are numbers
      console.log("Invalid: Input number is longer than 5 characters.");
    } else if (place.length > 0) {
      // If input is a city name or other valid text
      fetchWeather();
    }
  }, [place, isForecast, fetchWeather]);

  const handleFocus = (event: { target: { select: () => void } }) => {
    event.target.select(); // Select the content when the input gets focus
  };

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    fetchWeather();
  };

  function formatDateString(dateString: string) {
    const date = new Date(dateString);
    const timeZoneOffset = date.getTimezoneOffset() * 60 * 1000;
    const adjustedDate = new Date(date.getTime() + timeZoneOffset);

    return adjustedDate.toLocaleDateString(undefined, {
      timeZone: response?.location?.tz_id,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="app">
      <h1 className="text-5xl mb-6">Weather App</h1>
      <div className="search-input flex flex-col sm:flex-row justify-center w-full sm:w-1/3 mx-auto gap-2 my-4">
        <label htmlFor="location" className="xs:mr-2 justify-center items-center flex h-full">
          Location
        </label>
        <input
          type="text"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          onFocus={handleFocus}
          ref={inputRef}
          className=" border-black rounded-md px-4 py-2 w-full sm:w-auto min-w-[20ch] max-h-10 my-2 border-2"
        />
        <div className="flex flex-col xs:flex-row justify-center gap-2">
          <button
            onClick={() => {
              handleSubmit({ preventDefault: () => {} });
            }}
            name="submit"
            type="submit"
            aria-label="Search"
            className=" border-black rounded-md bg-blue-500 text-white px-4 py-2 my-2 min-w-max"
          >
            Search
          </button>
        </div>
      </div>
      <div className="italic">Enter a city and state or a zip code</div>
      {error && <p className="text-red-600 font-bold">{error}</p>}
      {place && place.length > 0 && (
        <>
          {" "}
          <div className="flex flex-col items-center justify-center max-h-10 px-8 py-8 my-4">
            <h2 className="mr-2 text-3xl my-2">
              {response?.location?.name}
              {response?.location?.region && `, ${response?.location?.region}`}
            </h2>
            {response?.location?.country !== "United States of America" &&
              response?.location?.country !== "USA" && (
                <h2 className="mr-2 text-4xl mb-4">
                  {response?.location?.country}
                </h2>
              )}
          </div>
          <div className="text-green-600 font-bold ml-2 my-4">
            <span>
              {response?.location?.localtime
                ? new Date(response.location.localtime).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "Time not available"}
              <span className="ml-2">
                {formatDateString(
                  response?.location?.localtime
                    ? response?.location?.localtime
                    : "Date not available"
                )}
              </span>
            </span>
          </div>
        </>
      )}
      {place && place.length > 0 && (
        <>
          {/* //current */}
          <div className="weather-container flex justify-center items-center mt-4 ">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className=" ">
                <h1 className="font-bold">Current</h1>
                <h1 className="font-bold">Conditions</h1>
                <p className="text-sm">{response?.current?.condition?.text}</p>
                <div className="flex justify-center items-center">
                  <img
                    src={response?.current?.condition?.icon}
                    alt="weather icon"
                    className="w-16 h-16"
                  />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <h1>Temp: {response?.current?.temp_f}° F</h1>
                <h1>Feels Like {response?.current?.feelslike_f}° F</h1>
                <h1>Humidity {response?.current?.humidity}%</h1>
                <h1>Precip {response?.current?.precip_in} in.</h1>
                <h1>
                  Wind {response?.current?.wind_mph} mph {"  "}{" "}
                  {response?.current?.wind_dir}
                  <p className="text-sm italic">
                    Gusts {response?.current?.gust_mph} mph
                  </p>
                </h1>
                <h1>Dew Point {response?.current?.dewpoint_f}° F</h1>
                <h1>Sunrise {future?.[0]?.astro?.sunrise}</h1>
                <h1>Sunset {future?.[0]?.astro?.sunset}</h1>
              </div>
            </div>
          </div>
          <div className="weather-container flex justify-center items-center mt-4 ">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className=" ">
                <button onClick={() => setCurrentHourly(!currentHourly)}>
                  {currentHourly ? "Hide Hourly " : "Show Hourly"}
                </button>
              </div>
              {currentHourly &&
                future
                  ?.filter((_, index) => index === 0)
                  .map((item, index) => (
                    <>
                      {/* Loop through the results helpful when there is more than one day selected */}
                      <React.Fragment key={index}>
                        {/* Hourly */}
                        <div className="space-y-2 text-left">
                          {item.hour
                            .filter((hour) => {
                              const currentTime = new Date();
                              const hourTime = new Date(hour.time);
                              return hourTime >= currentTime;
                            })
                            .map((hour, idx) => (
                              <React.Fragment key={idx}>
                                <h1 className="font-bold">
                                  {new Date(hour.time).toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </h1>
                                <h1>Temp: {hour.temp_f}° F</h1>
                                <h1>Feels Like {hour.feelslike_f}° F</h1>
                                <h1>
                                  Wind {hour.wind_mph} mph {"  "}{" "}
                                  {hour.wind_dir}
                                  <p className="text-sm italic">
                                    Gusts {hour.gust_mph} mph
                                  </p>
                                </h1>
                                <h1>Wind Chill {hour.windchill_f}° F</h1>
                                <h1>Dew Point {hour.dewpoint_f}° F</h1>
                                <h1>Chance of Rain {hour.chance_of_rain} %</h1>
                                <h1>Chance of Snow {hour.chance_of_snow} %</h1>
                                <h1>Visibility {hour.vis_miles} miles</h1>
                              </React.Fragment>
                            ))}
                        </div>
                      </React.Fragment>
                    </>
                  ))}
            </div>
          </div>
          <hr className="w-full col-span-5 border-gray-300 mt-4" />
          {/* // Future */}
          <p className="text-green-600 font-bold">
            {formatDateString(
              future?.[1].date ? future?.[1].date : "Date not available"
            )}
          </p>
          <div className="forecast-container flex justify-center items-center mt-4 ">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className=" ">
                <h1 className="font-bold">Tomorrow's</h1>
                <h1 className="font-bold">Conditions</h1>
                <p className="text-sm">{future?.[1]?.day.condition?.text}</p>
                <div className="flex justify-center items-center">
                  <img
                    src={future?.[1]?.day.condition?.icon}
                    alt="weather icon"
                    className="w-16 h-16"
                  />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <h1>Avg Temp: {future?.[1]?.day?.avgtemp_f}° F</h1>
                <h1>Max Temp: {future?.[1]?.day?.maxtemp_f}° F</h1>
                <h1>Humidity {future?.[1]?.day?.avghumidity}%</h1>
                <h1>Precip {future?.[1]?.day?.totalprecip_in} in.</h1>
                <h1>Max Wind {future?.[1]?.day?.maxwind_mph} mph</h1>
                <h1>Sunrise {future?.[1]?.astro?.sunrise}</h1>
                <h1>Sunset {future?.[1]?.astro?.sunset}</h1>
              </div>
            </div>
          </div>
          {/* Hourly */}
          <div className="weather-container flex justify-center items-center mt-4 ">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className=" ">
                <button onClick={() => setTomorrowHourly(!tomorrowHourly)}>
                  {tomorrowHourly ? "Hide Hourly " : "Show Hourly"}
                </button>
              </div>
              {tomorrowHourly &&
                future
                  ?.filter((_, index) => index === 1)
                  .map((item, index) => (
                    <>
                      {/* Loop through the results helpful when there is more than one day selected */}
                      <React.Fragment key={index}>
                        {/* Hourly */}
                        <div className="space-y-2 text-left">
                          {item.hour
                            .filter((hour) => {
                              const currentTime = new Date();
                              const hourTime = new Date(hour.time);
                              return hourTime >= currentTime;
                            })
                            .map((hour, idx) => (
                              <React.Fragment key={idx}>
                                <h1 className="font-bold">
                                  {new Date(hour.time).toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </h1>
                                <h1>Temp: {hour.temp_f}° F</h1>
                                <h1>Feels Like {hour.feelslike_f}° F</h1>
                                <h1>
                                  Wind {hour.wind_mph} mph {"  "}{" "}
                                  {hour.wind_dir}
                                  <p className="text-sm italic">
                                    Gusts {hour.gust_mph} mph
                                  </p>
                                </h1>
                                <h1>Wind Chill {hour.windchill_f}° F</h1>
                                <h1>Dew Point {hour.dewpoint_f}° F</h1>
                                <h1>Chance of Rain {hour.chance_of_rain} %</h1>
                                <h1>Chance of Snow {hour.chance_of_snow} %</h1>
                                <h1>Visibility {hour.vis_miles} miles</h1>
                              </React.Fragment>
                            ))}
                        </div>
                      </React.Fragment>
                    </>
                  ))}
            </div>
          </div>
          <hr className="w-full col-span-5 border-gray-300 mt-4" />
          {/* The Next Day */}
          <p className="text-green-600 font-bold">
            {formatDateString(
              future?.[1].date ? future?.[2].date : "Date not available"
            )}
          </p>
          <div className="forecast-container flex justify-center items-center mt-4">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div>
                <h1 className="font-bold">The Next Day's</h1>
                <h1 className="font-bold">Conditions</h1>
                <p className="text-sm">{future?.[2]?.day.condition?.text}</p>
                <div className="flex justify-center items-center">
                  <img
                    src={future?.[2]?.day.condition?.icon}
                    alt="weather icon"
                    className="w-16 h-16"
                  />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <h1>Avg Temp: {future?.[2]?.day?.avgtemp_f}° F</h1>
                <h1>Max Temp: {future?.[2]?.day?.maxtemp_f}° F</h1>
                <h1>Humidity {future?.[2]?.day?.avghumidity}%</h1>
                <h1>Precip {future?.[2]?.day?.totalprecip_in} in.</h1>
                <h1>Max Wind {future?.[2]?.day?.maxwind_mph} mph</h1>
                <h1>Sunrise {future?.[2]?.astro?.sunrise}</h1>
                <h1>Sunset {future?.[2]?.astro?.sunset}</h1>
              </div>
            </div>
          </div>
          {/* Hourly */}
          <div className="weather-container flex justify-center items-center mt-4 ">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className=" ">
                <button onClick={() => setTheNextDayHourly(!theNextDayHourly)}>
                  {theNextDayHourly ? "Hide Hourly " : "Show Hourly"}
                </button>
              </div>
              {theNextDayHourly &&
                future
                  ?.filter((_, index) => index === 2)
                  .map((item, index) => (
                    <>
                      {/* Loop through the results helpful when there is more than one day selected */}
                      <React.Fragment key={index}>
                        {/* Hourly */}
                        <div className="space-y-2 text-left">
                          {item.hour
                            .filter((hour) => {
                              const currentTime = new Date();
                              const hourTime = new Date(hour.time);
                              return hourTime >= currentTime;
                            })
                            .map((hour, idx) => (
                              <React.Fragment key={idx}>
                                <h1 className="font-bold">
                                  {new Date(hour.time).toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </h1>
                                <h1>Temp: {hour.temp_f}° F</h1>
                                <h1>Feels Like {hour.feelslike_f}° F</h1>
                                <h1>
                                  Wind {hour.wind_mph} mph {"  "}{" "}
                                  {hour.wind_dir}
                                  <p className="text-sm italic">
                                    Gusts {hour.gust_mph} mph
                                  </p>
                                </h1>
                                <h1>Wind Chill {hour.windchill_f}° F</h1>
                                <h1>Wind Gust {hour.gust_mph} mph</h1>
                                <h1>Dew Point {hour.dewpoint_f}° F</h1>
                                <h1>Chance of Rain {hour.chance_of_rain} %</h1>
                                <h1>Chance of Snow {hour.chance_of_snow} %</h1>
                                <h1>Visibility {hour.vis_miles} miles</h1>
                              </React.Fragment>
                            ))}
                        </div>
                      </React.Fragment>
                    </>
                  ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Weather;
