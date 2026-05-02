import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// ✅ Handle GitHub Pages redirect from 404.html
const redirectPath = sessionStorage.getItem('gh-pages-redirect-path');
if (redirectPath) {
  sessionStorage.removeItem('gh-pages-redirect-path');
  // Use replaceState to update URL without reload
  window.history.replaceState({}, '', redirectPath);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);