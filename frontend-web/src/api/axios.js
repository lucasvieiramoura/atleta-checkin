import axios from "axios";

const uri =
  process.env.NODE_ENV === 'production'
  ? 'https://atleta-checkin-backend.onrender.com/api' 
  : 'http://localhost:3000/api';

const api = axios.create({
    baseURL: uri, 
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