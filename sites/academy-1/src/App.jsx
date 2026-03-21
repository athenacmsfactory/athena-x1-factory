import React, { useState, useEffect } from 'react';
import { StyleInjector } from './components/StyleInjector';

// 🔱 Athena v33 Modular Sync Bridge for Academy-1
function App() {
  const [data, setData] = useState(null);
  const [sectionOrder, setSectionOrder] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      const orderRes = await fetch(`${import.meta.env.BASE_URL}src/data/section_order.json?v=${Date.now()}`);
      const order = await orderRes.json();
      setSectionOrder(order);

      const files = ['site_settings', 'cursussen', 'docenten', 'reviews', 'style_config'];
      const loadedData = {};
      for (const file of files) {
        try {
          const res = await fetch(`${import.meta.env.BASE_URL}src/data/${file}.json?v=${Date.now()}`);
          loadedData[file] = await res.json();
        } catch (e) { loadedData[file] = []; }
      }
      setData(loadedData);
      setLoading(false);
    } catch (err) {
      console.error("🔱 Athena Sync Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('message', (event) => {
      if (event.data.type === 'DATA_UPDATED') refreshData();
    });
  }, []);

  if (loading) return <div className="bg-slate-900 min-h-screen flex items-center justify-center text-blue-400 font-black animate-pulse">ACADEMY LOADING...</div>;

  return (
    <div className="academy-root font-sans">
      <StyleInjector config={data.style_config?.[0] || {}} />
      
      {sectionOrder.map((sectionId, index) => {
        // Map sectionId to component file
        let compName = 'Lijst';
        if (sectionId === 'hero') compName = 'Hero';
        
        const Component = React.lazy(() => import(`./components/sections/${compName}.jsx`));
        return (
          <React.Suspense key={index} fallback={<div className="h-40 bg-slate-800/20"></div>}>
            <Component 
              id={sectionId}
              data={data[sectionId] || data.site_settings?.[0]} 
              settings={data.site_settings?.[0]} 
            />
          </React.Suspense>
        );
      })}

      <footer className="bg-slate-950 text-slate-400 py-12 px-8 border-t border-white/5 text-center">
          <p data-dock-type="text" data-dock-bind="site_settings.0.bedrijfsnaam">
            &copy; {new Date().getFullYear()} {data.site_settings?.[0]?.bedrijfsnaam}
          </p>
      </footer>
    </div>
  );
}

export default App;
