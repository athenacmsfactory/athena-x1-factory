import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

async function init() {
  let data = {};
  
  // This placeholder will be replaced by the factory during site generation
  // or it will load from /data/blueprint.json in local dev
  try {
    const response = await fetch('./data/blueprint.json');
    if (response.ok) {
      data = await response.json();
    }
  } catch (e) {
    console.warn("No blueprint.json found, using empty data.");
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App data={data} />
    </React.StrictMode>
  );
}

init();
