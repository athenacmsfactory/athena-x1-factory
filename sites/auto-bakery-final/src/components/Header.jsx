import React, { useState } from 'react';
import { useLego, bindProps } from '../lib/LegoUtils';
import { Link } from 'react-router-dom';

function Header({ siteSettings = {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const settings = Array.isArray(siteSettings) ? (siteSettings[0] || {}) : (siteSettings || {});
  
  const siteNameRes    = useLego(settings, 'site_name', "auto-bakery-final");
  const taglineRes     = useLego(settings, 'tagline', "");
  const logoImageRes   = useLego(settings, 'site_logo_image', "athena-icon.svg");
  const ctaLabelRes    = useLego(settings, 'header_cta_label', "Contact");

  const logoChar = (settings.logo_text || siteNameRes.content).charAt(0).toUpperCase();

  const handleScroll = (e) => {
    const url = settings.header_cta_url || "#contact";
    setIsMenuOpen(false); // Close menu on click
    if (url.startsWith('#')) {
      e.preventDefault();
      const targetId = url.substring(1);
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sectionName = 'site_settings';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[1000] px-6 transition-all duration-500 flex items-center"
      style={{
        display: settings.header_visible === false ? 'none' : 'flex',
        backgroundColor: 'var(--header-bg, var(--color-header-bg, rgba(255,255,255,0.9)))',
        backdropFilter: 'var(--header-blur, blur(16px))',
        height: 'var(--header-height, 80px)',
        borderBottom: 'var(--header-border, none)'
      }}
    >
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        {/* Logo & Identity */}
        {(settings.header_show_logo !== false || settings.header_show_title !== false) && (
          <a href="#" className="flex items-center gap-4 group" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); setIsMenuOpen(false); }}>

            {settings.header_show_logo !== false && (
              <div className="relative w-12 h-12 overflow-hidden transition-transform duration-500">
                <img
                  src={logoImageRes.content}
                  {...bindProps(logoImageRes, sectionName, 0, 'image')}
                  className="w-full h-full object-contain"
                  alt="Logo"
                />
              </div>
            )}

            <div className="flex flex-col">
              {settings.header_show_title !== false && (
                <span 
                  className="text-2xl font-serif font-black tracking-tight text-primary leading-none mb-1"
                  {...bindProps(siteNameRes, sectionName, 0, 'text')}
                >
                  {siteNameRes.content}
                </span>
              )}
              {settings.header_show_tagline !== false && taglineRes.content && (
                <span 
                  className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold opacity-80"
                  {...bindProps(taglineRes, sectionName, 0, 'text')}
                >
                  {taglineRes.content}
                </span>
              )}
            </div>
          </a>
        )}

        {/* Desktop Action Menu */}
        <div className="hidden md:flex items-center gap-8">
          {settings.header_show_button !== false && (
            <a
              href={settings.header_cta_url || "#contact"}
              {...bindProps(ctaLabelRes, sectionName, 0, 'link')}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-accent transition-colors"
              onClick={handleScroll}
            >
              {ctaLabelRes.content}
            </a>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-2xl text-primary p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-x-0 top-[var(--header-height,80px)] bg-white border-b border-gray-100 shadow-xl md:hidden transition-all duration-300 ease-in-out origin-top ${isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`}>
        <div className="p-6 flex flex-col gap-4">
          <a href="#"   className="text-lg font-bold text-primary py-2 border-b border-slate-50" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            Home
          </a>
          {/* Placeholder for dynamic links if available later */}

          {settings.header_show_button !== false && (
            <a
              href={settings.header_cta_url || "#contact"}
              {...bindProps(ctaLabelRes, sectionName, 0, 'link')}
              className="w-full bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-accent transition-colors text-center mt-2"
              onClick={handleScroll}
            >
              {ctaLabelRes.content}
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;