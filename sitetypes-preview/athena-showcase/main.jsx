import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Dynamically load all JSON files from src/data
const modules = import.meta.glob('./src/data/*.json', { eager: true });
const loadedData = {};

Object.keys(modules).forEach((path) => {
  const fileName = path.split('/').pop().replace('.json', '');
  loadedData[fileName] = modules[path].default;
});

// Fallback / Default structure if data is missing
const finalData = {
  header: loadedData.header || { 
    site_name: "Athena Showcase", 
    logo: "athena-icon.svg",
    menu_links: [{ label: 'Home', url: '/' }]
  },
  site_settings: loadedData.site_settings || { 
    theme: 'dark', 
    dark_primary_color: '#3b82f6',
    dark_bg_color: '#0f172a'
  },
  hero: Array.isArray(loadedData.hero) ? loadedData.hero[0] : (loadedData.hero || {}),
  section_order: loadedData.section_order || ['header', 'hero', 'footer'],
  ...loadedData
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App data={finalData} />
  </React.StrictMode>
);
