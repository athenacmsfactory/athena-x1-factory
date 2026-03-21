import React from 'react';

function Header({ siteSettings = {}, headerData = {}, data }) {
  const settings = Array.isArray(siteSettings) ? (siteSettings[0] || {}) : (siteSettings || {});
  const header = Array.isArray(headerData) ? (headerData[0] || {}) : (headerData || {});
  const siteName = settings.site_name || 'athena-hub';
  
  // Use a reliable default logo if site_logo_image is missing
  const rawLogo = header.site_logo_image || settings.site_logo_image || "athena-icon.svg";
  const displayLogo = (rawLogo || "").startsWith('http') || (rawLogo || "").startsWith('/') 
    ? rawLogo 
    : `${import.meta.env.BASE_URL}images/${rawLogo}`.replace(/\/+/g, '/');

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScroll = (e) => {
    if (e.shiftKey) return;
    const target = document.getElementById("contact");
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-[1000] px-6 transition-all duration-500 flex items-center"
      style={{ 
        display: header.header_visible === false ? 'none' : 'flex',
        backgroundColor: 'var(--header-bg, var(--color-header-bg, rgba(255,255,255,0.9)))', 
        backdropFilter: 'var(--header-blur, blur(16px))',
        height: `${header.header_height || 80}px`,
        borderBottom: 'var(--header-border, 1px solid rgba(255,255,255,0.1))'
      }}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          <a href="/" onClick={scrollToTop} className="flex items-center gap-3 group">
            {header.header_show_logo !== false && (
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                <img 
                    src={displayLogo} 
                    alt="Logo" 
                    className="w-full h-full object-contain" 
                    data-dock-type="media" 
                    data-dock-bind="header.0.site_logo_image" 
                />
              </div>
            )}
            {(header.header_show_title !== false || header.header_show_tagline !== false) && (
              <div className="flex flex-col">
                {header.header_show_title !== false && (
                  <span className="text-xl font-black tracking-tighter text-primary" data-dock-type="text" data-dock-bind="header.0.logo_text">
                    {header.logo_text || settings.logo_text || siteName}
                  </span>
                )}
                {header.header_show_tagline !== false && (
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {settings.tagline}
                  </span>
                )}
              </div>
            )}
          </a>
        </div>

        {/* Action Menu */}
        <div className="flex items-center gap-8">
            {header.header_show_button !== false && (
              <button 
                onClick={handleScroll} 
                className="bg-primary text-white px-6 py-1 rounded-full font-bold hover:bg-accent transition-all"
                data-dock-type="link" 
                data-dock-bind="header.0.cta_label"
              >
                {header.cta_label || "Start Nu"}
              </button>
            )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
