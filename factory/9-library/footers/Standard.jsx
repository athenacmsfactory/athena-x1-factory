import React from 'react';

function StandardFooter({ siteSettings, sectionName = '_site_settings' }) {
  const settings = siteSettings?.[0] || {};

  return (
    <footer className="bg-slate-900 text-slate-400 py-16 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <h3 
            className="text-white font-bold text-lg mb-2"
            data-dock-bind={`${sectionName}.0.site_name`}
          >
            {settings.site_name || 'Athena v9.0'}
          </h3>
          <p 
            className="text-sm max-w-xs"
            data-dock-bind={`${sectionName}.0.tagline`}
          >
            {settings.tagline || 'Gebouwd met de Lego Factory.'}
          </p>
        </div>
        <div className="flex gap-8 text-sm">
          <span>&copy; {new Date().getFullYear()} Alle rechten voorbehouden.</span>
        </div>
      </div>
    </footer>
  );
}

export default StandardFooter;
