export const API_CONFIG = {
  SPOONACULAR_BASE_URL: 'https://api.spoonacular.com',
  SPOONACULAR_API_KEY: import.meta.env.VITE_SPOONACULAR_API_KEY || '',
};

export const getApiHeaders = () => ({
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_CONFIG.SPOONACULAR_API_KEY,
  },
}); 