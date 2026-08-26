import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:300/api', 
});

// Interceptor para injetar o Token no Header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('@AtletaCheckin:token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
});

export default api;