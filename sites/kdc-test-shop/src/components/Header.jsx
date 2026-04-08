import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

export default function Header({ data = {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerData = data?.header || {};
  const settings = data?.site_settings || {};
  const { cartCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const siteName = headerData.site_name || settings.site_name || "Karel's Store";
  const displayLogo = headerData.site_logo || settings.site_logo_image || "athena-icon.svg";
  const navLinks = headerData.nav_links || [
    { label: "Home", url: "/" },
    { label: "Producten", url: "#producten" }
  ];

  const handleScroll = (e) => {
    const url = settings.header_cta_url || "#contact";
    setIsMenuOpen(false); // Close menu on click
    if (url.startsWith('#')) {
      e.preventDefault();
      const targetId = url.substring(1);
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[1000] border-b border-white/10 px-6 transition-all duration-500 flex items-center"
      style={{
        display: settings.header_visible === false ? 'none' : 'flex',
        backgroundColor: 'var(--header-bg, var(--color-header-bg, rgba(255,255,255,0.9)))',
        backdropFilter: 'var(--header-blur, blur(16px))',
        height: 'var(--header-height, 80px)',
        borderBottom: 'var(--header-border, 1px solid rgba(255,255,255,0.1))'
      }}
    >
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        {/* Logo & Identity */}
        {(settings.header_show_logo !== false || settings.header_show_title !== false) && (
          <Link to="/" className="flex items-center gap-4 group" onClick={() => setIsMenuOpen(false)}>

            {settings.header_show_logo !== false && (
              <div className="relative w-12 h-12 overflow-hidden transition-transform duration-500">
                <img src={displayLogo} className="w-full h-full object-contain" data-dock-type="media" data-dock-bind="header.site_logo" />
              </div>
            )}

            <div className="flex flex-col">
              {settings.header_show_title !== false && (
                <span className="text-2xl font-serif font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-accent leading-none mb-1">
                  <span data-dock-type="text" data-dock-bind="header.site_name">{siteName}</span>
                </span>
              )}
              {settings.header_show_tagline !== false && settings.tagline && (
                <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold opacity-80">
                  <span data-dock-type="text" data-dock-bind="site_settings.0.tagline">{settings.tagline}</span>
                </span>
              )}
            </div>
          </Link>
        )}

        {/* Actions & Tools */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* Cart Icon */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-primary hover:text-accent transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Open cart"
          >
            <i className="fa-solid fa-bag-shopping text-2xl"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg animate-in zoom-in duration-300">
                {cartCount}
              </span>
            )}
          </button>

          {/* Desktop Action Menu */}
          <div className="hidden md:flex items-center">
            {settings.header_show_button !== false && (
              <button 
                className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-accent transition-all duration-300 shadow-lg shadow-primary/10"
                onClick={(e) => { 
                  if (e.shiftKey) return; 
                  const target = document.getElementById("contact");
                  if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
              }} data-dock-type="link" data-dock-bind="site_settings.0.header_cta_text">Contact</button>
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
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-x-0 top-[var(--header-height,80px)] bg-white border-b border-gray-100 shadow-xl md:hidden transition-all duration-300 ease-in-out origin-top ${isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`}>
        <div className="p-6 flex flex-col gap-4">
          {navLinks.map((link, idx) => (
            <a 
              key={idx} 
              href={link.url} 
              className="text-lg font-bold text-primary py-2 border-b border-slate-50" 
              onClick={() => setIsMenuOpen(false)}
              data-dock-type="link"
              data-dock-bind={`header.nav_links.${idx}`}
            >
              {link.label}
            </a>
          ))}

          {settings.header_show_button !== false && (
            <button onClick={(e) => { 
                if (e.shiftKey) return; 
                const target = document.getElementById("contact");
                if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
            }} data-dock-type="link" data-dock-bind="site_settings.0.header_cta_text">Contact</button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;