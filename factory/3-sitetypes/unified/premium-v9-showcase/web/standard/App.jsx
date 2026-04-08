import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import Header from './components/Header';
import Section from './components/Section';
import Footer from './components/Footer';
import StyleInjector from './components/StyleInjector';
import { DisplayConfigProvider } from './components/DisplayConfigContext';

/**
 * App.jsx (premium-v9-showcase)
 * Root component for the premium v9 experience.
 */
const App = ({ data }) => {
  return (
    <DisplayConfigProvider data={data}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 font-sans">
          <StyleInjector siteSettings={data['site_settings']} />
          
          <Header siteSettings={data['site_settings']} navigationData={data['navigation']} />
          
          <main>
            <Section data={data} />
          </main>

          <Footer siteSettings={data['site_settings']} navigationData={data['navigation']} />
        </div>
      </Router>
    </DisplayConfigProvider>
  );
};

export default App;
