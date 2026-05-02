const config = {
  API_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:5010/api'  // Local
    : 'https://charmenar-next-api.onrender.com/api'  // Production
};

export default config;