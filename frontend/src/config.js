const config = {
  API_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:5010/api'  // Local development
    : 'https://charmenar-next-api.onrender.com/api'  // Production (your Render URL)
};

export default config;