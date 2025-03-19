const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Default to current origin in production, localhost in development
  return import.meta.env.DEV 
    ? 'http://localhost:5000'
    : window.location.origin;
};

export const API_URL = getApiUrl();
