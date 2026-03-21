import React, { useState, useEffect } from 'react';
import { StyleInjector } from './components/StyleInjector';

// 🔱 Athena v33 Modular Sync Bridge for Bakkerij
function App() {
  const [data, setData] = useState(null);
  const [sectionOrder, setSectionOrder] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      const orderRes = await fetch(`${import.meta.env.BASE_URL}src/data/section_order.json?v=${Date.now()}`);
      const order = await orderRes.json();
      setSectionOrder(order);

      const files = ['site_settings', 'kenmerken', 'style_config'];
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

  if (loading) return <div className="bg-[#fdfbf7] min-h-screen flex items-center justify-center text-amber-800 font-black animate-pulse">BAKKERIJ LOADING...</div>;

  return (
    <div className="bakkerij-root">
      <StyleInjector config={data.style_config?.[0] || {}} />
      
      {sectionOrder.map((sectionId, index) => {
        // Map sectionId to component file
        let compName = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
        
        const Component = React.lazy(() => import(`./components/sections/${compName}.jsx`));
        return (
          <React.Suspense key={index} fallback={<div className="h-40 bg-amber-50"></div>}>
            <Component 
              id={sectionId}
              data={data[sectionId] || data.site_settings?.[0]} 
              settings={data.site_settings?.[0]} 
            />
          </React.Suspense>
        );
      })}

      <footer className="bg-amber-950 text-amber-100 py-12 px-8 text-center">
          <p data-dock-type="text" data-dock-bind="site_settings.0.bedrijfsnaam">
            &copy; {new Date().getFullYear()} {data.site_settings?.[0]?.bedrijfsnaam}
          </p>
      </footer>
    </div>
  );
}

export default App;
