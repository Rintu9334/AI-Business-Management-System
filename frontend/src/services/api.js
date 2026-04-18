import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor: Add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global logs and errors
api.interceptors.response.use(
  (response) => {
    // Debugging: Log all successful responses
    console.log(`[API SUCCESS] ${response.config.method.toUpperCase()} ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      console.error("[AUTH ERROR] Unauthorized (401). Token may be expired.");
      localStorage.clear();
      window.location.href = '/login';
    } else if (status === 403) {
      console.error("[AUTH ERROR] Forbidden (403). You lack permissions for this action.");
      alert("Permission denied. You are not authorized to perform this operation.");
    } else {
      console.error(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
