import React from 'react';
import { Link } from 'react-router-dom';

function StandardHeader({ siteSettings, sectionName = '_site_settings' }) {
  const settings = siteSettings?.[0] || {};
  const logo = settings.site_logo_image || 'athena-icon.svg';

  return (
    <header className="fixed top-0 w-full h-20 bg-white/90 backdrop-blur-md z-50 flex items-center px-8 border-b border-slate-100">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src={logo.startsWith('http') ? logo : `./${logo}`} 
            alt="Logo" 
            className="w-10 h-10 object-contain"
            data-dock-bind={`${sectionName}.0.site_logo_image`}
            data-dock-type="media"
          />
          <span 
            className="text-xl font-bold text-slate-900"
            data-dock-bind={`${sectionName}.0.site_name`}
          >
            {settings.site_name || 'Athena v9.0'}
          </span>
        </Link>
        <nav className="hidden md:flex gap-8 font-medium text-slate-600">
           <a href="#about" className="hover:text-primary transition-colors">Over Ons</a>
           <a href="#services" className="hover:text-primary transition-colors">Diensten</a>
           <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
        </nav>
      </div>
    </header>
  );
}

export default StandardHeader;
