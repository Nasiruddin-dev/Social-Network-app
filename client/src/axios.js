import axios from "axios";

export const makeRequest = axios.create({
  baseURL: "https://social-network-app-ools.onrender.com/api/",
  withCredentials: true,
});
