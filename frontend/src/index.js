import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
import App from './App';

// Handle GitHub Pages redirect
const path = sessionStorage.getItem('redirect-path');
if (path) {
  sessionStorage.removeItem('redirect-path');
  window.history.replaceState({}, '', path);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);