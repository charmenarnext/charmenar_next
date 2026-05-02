const config = {
  API_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:5010/api'
    : 'https://charmenar-next-api.onrender.com/api'  // ✅ Must end with /api
};
export default config;