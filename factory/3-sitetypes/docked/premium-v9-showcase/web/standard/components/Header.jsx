import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * HeaderGlass (v9.0 Clean - Dehydrated)
 * Using standard HTML tags with data-dock-* attributes for maximum Dock transparency.
 */
export default function HeaderGlass({ siteSettings = {}, navigationData = [] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const settings = Array.isArray(siteSettings) ? (siteSettings[0] || {}) : (siteSettings || {});
  const siteName = settings.site_name || '{{PROJECT_NAME}}';
  const displayLogo = settings.site_logo_image || "athena-icon.svg";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, url) => {
    setIsMenuOpen(false);
    if (url && url.startsWith('#')) {
      e.preventDefault();
      const targetId = url.substring(1);
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = Array.isArray(navigationData) ? navigationData : [];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[2000] px-6 transition-all duration-700 pointer-events-none`}
      style={{ 
        display: settings.header_visible === false ? 'none' : 'block',
        paddingTop: isScrolled ? '12px' : '24px'
      }}
    >
      <nav 
        className={`max-w-6xl mx-auto flex items-center justify-between px-6 md:px-10 rounded-[2rem] border transition-all duration-700 pointer-events-auto
          ${isScrolled 
            ? 'h-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 shadow-2xl shadow-blue-500/10' 
            : 'h-24 bg-transparent border-transparent'
          }`}
      >
        {/* Logo & Identity */}
        <Link to="/" className="flex items-center gap-4 group" onClick={() => setIsMenuOpen(false)}>
          {settings.header_show_logo !== false && (
            <div className="relative w-12 h-12 overflow-hidden transition-all duration-500 group-hover:scale-110">
              <img 
                src={displayLogo} 
                data-dock-bind="site_settings.0.site_logo_image" 
                data-dock-type="media"
                className="w-full h-full object-contain"
                alt="Logo"
              />
            </div>
          )}
          
          <div className="flex flex-col">
            {settings.header_show_title !== false && (
              <span className="text-xl md:text-2xl font-black tracking-tight text-primary leading-none">
                <span data-dock-bind="site_settings.0.site_name" data-dock-type="text">{siteName}</span>
              </span>
            )}
            {settings.header_show_tagline !== false && settings.tagline && (
              <span className="text-[9px] uppercase tracking-[0.4em] text-accent font-black opacity-80 mt-1">
                <span data-dock-bind="site_settings.0.tagline" data-dock-type="text">{settings.tagline}</span>
              </span>
            )}
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          <ul className="flex items-center gap-8">
            {navLinks.map((link, idx) => (
              <li key={idx} className="relative group/item">
                <a 
                  href={link.url}
                  data-dock-bind={`navigation.${idx}.label`}
                  data-dock-type="link"
                  className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors py-2"
                  onClick={(e) => handleNavClick(e, link.url)}
                >
                  {link.label}
                </a>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover/item:w-full rounded-full"></span>
              </li>
            ))}
          </ul>

          {settings.header_show_button !== false && (
            <button 
              data-dock-bind="site_settings.0.header_cta_label"
              data-dock-type="link"
              className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95 shadow-xl shadow-primary/10"
              onClick={(e) => handleNavClick(e, settings.header_cta_url || "#contact")}
            >
              {settings.header_cta_label || "Get Started"}
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 text-primary transition-all active:scale-90"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="w-6 flex flex-col gap-1.5 items-end overflow-hidden">
            <span className={`h-1 bg-current transition-all duration-300 rounded-full ${isMenuOpen ? 'w-6 translate-y-2.5 -rotate-45' : 'w-6'}`}></span>
            <span className={`h-1 bg-accent transition-all duration-300 rounded-full ${isMenuOpen ? 'opacity-0 translate-x-4' : 'w-4'}`}></span>
            <span className={`h-1 bg-current transition-all duration-300 rounded-full ${isMenuOpen ? 'w-6 -translate-y-2.5 rotate-45' : 'w-5'}`}></span>
          </div>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[-1] transition-all duration-500 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute top-24 left-6 right-6 bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl transition-all duration-500 origin-top ${isMenuOpen ? 'scale-100 translate-y-0' : 'scale-90 -translate-y-10'}`}>
          <div className="flex flex-col gap-8">
            {navLinks.map((link, idx) => (
              <a 
                key={`mob-${idx}`}
                href={link.url}
                data-dock-bind={`navigation.${idx}.label`}
                data-dock-type="link"
                className="text-2xl font-black text-slate-900 dark:text-white hover:text-accent transition-colors border-b border-slate-50 dark:border-slate-800 pb-4"
                onClick={(e) => handleNavClick(e, link.url)}
              >
                {link.label}
              </a>
            ))}
            
            {settings.header_show_button !== false && (
              <button 
                data-dock-bind="site_settings.0.header_cta_label"
                data-dock-type="link"
                className="w-full bg-primary text-white px-8 py-6 rounded-3xl font-black text-lg uppercase tracking-widest text-center shadow-2xl shadow-primary/20 mt-4"
                onClick={(e) => handleNavClick(e, settings.header_cta_url || "#contact")}
              >
                {settings.header_cta_label || "Get Started"}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
