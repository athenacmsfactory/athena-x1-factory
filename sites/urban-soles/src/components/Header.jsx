import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';

function Header({ siteSettings = {} }) {
  const { cartCount, setIsCartOpen } = useCart();
  const settings = Array.isArray(siteSettings) ? (siteSettings[0] || {}) : (siteSettings || {});
  const siteName = settings.site_name || 'urban-soles';
  const logoChar = (settings.logo_text || siteName).charAt(0).toUpperCase();
  
  // Use a reliable default logo if site_logo_image is missing
  const displayLogo = settings.site_logo_image || "athena-icon.svg";

  const getImageUrl = (url) => {
    if (!url) return '';
    if (typeof url === 'object') url = url.text || url.url || '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = import.meta.env.BASE_URL || '/';
    return (base + '/images/' + url).replace(new RegExp('/+', 'g'), '/');
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-[1000] border-b border-white/10 px-6 py-5 transition-all duration-500"
      style={{ backgroundColor: 'var(--color-header-bg, rgba(255,255,255,0.9))', backdropFilter: 'blur(16px)' }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo & Identity */}
        <Link to="/" className="flex items-center gap-4 group">
          
          <div className="relative w-12 h-12 overflow-hidden transition-transform duration-500">
             <img src={getImageUrl(displayLogo)} className="w-full h-full object-contain" data-dock-type="media" data-dock-bind="site_settings.0.site_logo_image" />
          </div>
          
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-black tracking-tight text-primary leading-none mb-1">
              <span data-dock-type="text" data-dock-bind="site_settings.0.site_name">{siteName}</span>
            </span>
            {settings.tagline && (
              <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold opacity-80">
                <span data-dock-type="text" data-dock-bind="site_settings.0.tagline">{settings.tagline}</span>
              </span>
            )}
          </div>
        </Link>

        {/* Action Menu */}
        <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="group relative p-2 text-primary hover:text-accent transition-all duration-500 active:scale-90"
              aria-label="Winkelwagen"
            >
              <div className="relative p-1">
                {/* Minimalist Architectural Cart Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 stroke-[1.2] transition-transform duration-500 group-hover:-rotate-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-accent text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg transform translate-x-1 -translate-y-1 border-2 border-[var(--color-header-bg,white)] group-hover:scale-110 transition-all duration-500">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>
        </div>
      </div>
    </nav>
  );
}

export default Header;