/// <reference types="../vite-env.d.ts" />

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Default to current origin in production, localhost in development
  const baseUrl = import.meta.env.DEV 
    ? 'http://localhost:5000'
    : window.location.origin;

  return `${baseUrl}/api`;
};

export const API_URL = getApiUrl();

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': import.meta.env.VITE_SPOONACULAR_API_KEY || '',
  },
  credentials: 'include' as RequestCredentials,
};
