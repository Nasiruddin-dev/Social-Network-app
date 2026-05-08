import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8800/api/";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});
