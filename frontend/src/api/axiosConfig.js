import axios from "axios";

export const resolveBaseUrl = () => {
    if (import.meta.env.VITE_API_URL !== undefined) {
        return import.meta.env.VITE_API_URL;
    }
    if (typeof window !== "undefined" && window.location.port === "5173") {
        return "http://localhost:8080";
    }
    return "";
};

export const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }
    const base = resolveBaseUrl();
    return `${base}${url}`;
};

const api = axios.create({
    baseURL: resolveBaseUrl(),
});

api.interceptors.request.use((config) => {
    const authHeader = localStorage.getItem('authHeader');
    if (authHeader) {
        config.headers.Authorization = authHeader;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('authHeader');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;