import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Section from './components/Section';
import { useCart } from './components/CartContext';

// ⚓ Athena v33 Sync Bridge
const syncData = async () => {
  try {
    const base = import.meta.env.BASE_URL;
    const res = await fetch(`${base}src/data/all_data.json?t=${Date.now()}`);
    return await res.json();
  } catch (e) { return null; }
};

function App() {
  const [data, setData] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    syncData().then(d => setData(d));
    
    // Listen for live updates from Dock
    const handleMessage = (e) => {
      if (e.data.type === 'DATA_UPDATE') {
        setData(prev => ({ ...prev, ...e.data.payload }));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!data) return <div className="h-screen flex items-center justify-center font-mono text-xs text-slate-400">LOADING ATHENA v8.5...</div>;

  return (
    <main className="min-h-screen bg-white">
      <Header data={data} />
      <Section data={data} />
    </main>
  );
}

export default App;
