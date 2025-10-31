// src/plugins/axios.ts
import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/`,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
});

// Intercepta requests
api.interceptors.request.use(async (config) => {
    return config;
});

// Intercepta responses (refresh em 401)
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        return Promise.reject(error);
    }
);

export default api;
