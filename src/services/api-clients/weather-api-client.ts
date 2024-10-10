// src/services/api-clients/weather-api-client.ts
import axios from "axios";

const weatherApiClient = axios.create({
  baseURL: "https://api.weatherapi.com/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default weatherApiClient;
