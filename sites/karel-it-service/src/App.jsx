import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Section from './components/Section';
import DockConnector from './components/DockConnector';
import allData from './data/all_data.json';

function App() {
  const [data, setData] = useState(allData);

  return (
    <div className="min-h-screen bg-white">
      {/* ⚓ Bridge for Visual Editor */}
      <DockConnector data={data} setData={setData} />

      <Header siteSettings={data._site_settings || {}} />
      <main>
        <Section data={data} />
      </main>
      <Footer siteSettings={data._site_settings || {}} />
    </div>
  );
}

export default App;
