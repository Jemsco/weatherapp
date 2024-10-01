import axios from "axios";

const geoApiClient = axios.create({
  baseURL: "https://freeipapi.com/api/json",

});

export default geoApiClient;
