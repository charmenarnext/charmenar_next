
// frontend/src/config.js

const getConfig = () => {
  // Use environment variable if set
  if (process.env.REACT_APP_API_URL) {
    return {
      API_URL: process.env.REACT_APP_API_URL,
      APP_NAME: 'Charmenar Next',
      MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    };
  }

  // Fallback: Auto-detect based on hostname
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return {
      API_URL: 'http://localhost:5000/api',
      APP_NAME: 'Charmenar Next',
      MAX_FILE_SIZE: 5 * 1024 * 1024,
    };
  }
  
  // Production (both custom domain and GitHub Pages)
  return {
    API_URL: 'https://charmenar-next-api.onrender.com/api',
    APP_NAME: 'Charmenar Next',
    MAX_FILE_SIZE: 5 * 1024 * 1024,
  };
};

const config = getConfig();
export default config;