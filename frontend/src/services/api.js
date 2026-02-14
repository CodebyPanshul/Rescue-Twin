import axios from 'axios';

// In dev we proxy /api -> backend (next.config rewrites), so same-origin = no CORS.
// Override with NEXT_PUBLIC_API_URL for production or custom backend.
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') return '/api';
  if (typeof window !== 'undefined') return `http://${window.location.hostname}:8000`;
  return 'http://127.0.0.1:8000';
};

const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Run flood simulation with specified parameters
 * @param {string} intensity - Severity level: 'low', 'medium', 'high'
 * @param {number|null} rainfall - Optional rainfall override in mm/hour
 * @returns {Promise} Simulation result
 */
export const simulateFlood = async (intensity = 'medium', rainfall = null) => {
  try {
    const params = { intensity };
    if (rainfall !== null) {
      params.rainfall = rainfall;
    }
    const response = await api.get('/simulate-flood', { params });
    return response.data;
  } catch (error) {
    console.error('Simulation error:', error);
    throw new Error(
      error.response?.data?.detail || 'Failed to run simulation. Is the backend running?'
    );
  }
};

/**
 * Check backend health status
 * @returns {Promise} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw new Error('Backend is not available');
  }
};

/**
 * Run earthquake simulation
 * @param {number} magnitude - 4–8 (Richter)
 * @param {string} epicenter - District ID (e.g. 'd1', 'd2')
 * @returns {Promise} Earthquake result with zones, metrics, AI explanation
 */
export const simulateEarthquake = async (magnitude = 6, epicenter = 'd1') => {
  try {
    const response = await api.get('/simulate-earthquake', {
      params: { magnitude, epicenter },
    });
    return response.data;
  } catch (error) {
    console.error('Earthquake simulation error:', error);
    throw new Error(
      error.response?.data?.detail || 'Failed to run earthquake simulation. Is the backend running?'
    );
  }
};

/**
 * Get all districts without simulation
 * @returns {Promise} Districts and shelters
 */
export const getDistricts = async () => {
  try {
    const response = await api.get('/districts');
    return response.data;
  } catch (error) {
    console.error('Get districts error:', error);
    throw new Error('Failed to load districts');
  }
};

export default api;
