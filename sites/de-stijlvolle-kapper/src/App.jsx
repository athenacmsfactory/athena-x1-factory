import React, { useState, useEffect } from 'react';
import { StyleInjector } from './components/StyleInjector';

// 🔱 Athena v33 Modular Sync Bridge
function App() {
  const [data, setData] = useState(null);
  const [sectionOrder, setSectionOrder] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      // 1. Laad Sectie Volgorde
      const orderRes = await fetch(`${import.meta.env.BASE_URL}src/data/section_order.json?v=${Date.now()}`);
      const order = await orderRes.json();
      setSectionOrder(order);

      // 2. Laad Geaggregeerde Data (of afzonderlijke bestanden)
      // Voor deze upgrade laden we direct de bestanden uit de data map
      const files = ['site_settings', 'diensten', 'style_config'];
      const loadedData = {};
      
      for (const file of files) {
        try {
          const res = await fetch(`${import.meta.env.BASE_URL}src/data/${file}.json?v=${Date.now()}`);
          loadedData[file] = await res.json();
        } catch (e) {
          console.warn(`⚠️ Kon ${file}.json niet laden, fallback naar leeg.`);
          loadedData[file] = [];
        }
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
    // Luister naar berichten van de Dock voor live updates
    window.addEventListener('message', (event) => {
      if (event.data.type === 'DATA_UPDATED') refreshData();
    });
  }, []);

  if (loading) return <div className="bg-black min-h-screen flex items-center justify-center text-gold font-black animate-pulse">ATHENA LOADING...</div>;

  return (
    <div className="athena-site-root">
      <StyleInjector config={data.style_config?.[0] || {}} />
      
      {sectionOrder.map((sectionId, index) => {
        const Component = React.lazy(() => import(`./components/sections/${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}.jsx`));
        return (
          <React.Suspense key={index} fallback={<div className="h-20 bg-gray-900/50"></div>}>
            <Component 
              data={data[sectionId] || data.site_settings?.[0]} 
              settings={data.site_settings?.[0]} 
            />
          </React.Suspense>
        );
      })}

      {/* Footer is vaak hardcoded of een vaste sectie */}
      <footer className="py-10 bg-[#0a0a0a] border-t border-white/5 text-center text-[10px] text-gray-600 uppercase tracking-widest">
          <p data-dock-type="text" data-dock-bind="site_settings.0.bedrijfsnaam">
            &copy; {new Date().getFullYear()} {data.site_settings?.[0]?.bedrijfsnaam}
          </p>
      </footer>
    </div>
  );
}

export default App;
