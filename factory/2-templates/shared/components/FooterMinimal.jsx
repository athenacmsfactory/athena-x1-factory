import React from 'react';

const FooterMinimal = ({ data }) => {
  const settings = data.site_settings?.[0] || {};
  return (
    <footer className="py-8 border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs">
        <p>© {new Date().getFullYear()} {settings.bedrijfsnaam}. Alle rechten voorbehouden.</p>
        <div className="flex gap-6">
          <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-primary transition-colors">Voorwaarden</a>
        </div>
      </div>
    </footer>
  );
};

export default FooterMinimal;
