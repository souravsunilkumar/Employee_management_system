import axios from "axios";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add a request interceptor to automatically add the token to all requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
