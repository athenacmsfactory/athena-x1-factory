import React from 'react';

/**
 * Header (Docked Track)
 * Robust Hero section with support for Title Color and detached Header Image.
 */
function Header({ primaryTable, tableName, hero = {}, headerSettings = {}, navData = [] }) {
  const info = Array.isArray(primaryTable) ? (primaryTable[0] || {}) : (primaryTable || {});

  const heroData = Array.isArray(hero) ? (hero[0] || {}) : hero;
  const settings = Array.isArray(headerSettings) ? (headerSettings[0] || {}) : headerSettings;

  // Look for fields in primary table for fallbacks
  const keys = Object.keys(info);
  const fallbackTitleKey = keys.find(k => /naam|titel|header|kop|bedrijfsnaam/i.test(k)) || keys[0];
  const fallbackTaglineKey = keys.find(k => /slogan|tagline|ondertitel|subtitle/i.test(k));

  // Helper to safely extract text from potential Athena style-objects
  const extractText = (val, fallback = '') => {
    if (typeof val !== 'object' || val === null) return val ?? fallback;
    return val.text || val.title || val.label || val.name || val.value || fallback;
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (typeof url === 'object') url = url.text || url.url || '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = import.meta.env.BASE_URL || '/';
    return (base + '/images/' + url).replace(new RegExp('/+', 'g'), '/');
  };

  // 1. Separate Titles: Hero vs Navigation
  // Navigation Title: usually the business name from Footer table
  const navTitleValue = extractText(info[fallbackTitleKey] || 'De Schaar');
  
  // Hero Title: the main headline in the middle of the page
  const heroTitleValue = heroData.titel || heroData.title || navTitleValue;
  
  // Tagline
  const rawTagline = heroData.ondertitel || heroData.tagline || (fallbackTaglineKey ? info[fallbackTaglineKey] : '');

  const titleString = extractText(heroTitleValue, 'Welcome');
  const taglineString = extractText(rawTagline, '');

  const sortedNav = [...navData].sort((a, b) => (a.menu_positie || 0) - (b.menu_positie || 0));

  return (
    <>
      {/* Fixed Sticky Navigation Bar */}
      <nav
        data-dock-element="header-nav"
        className="fixed top-0 left-0 right-0 z-[1000] w-full px-8 py-4 flex items-center justify-between border-b transition-all duration-300"
        style={{
          display: (settings.header_zichtbaar === false || settings.header_visible === false) ? 'none' : 'flex',
          height: (settings.header_hoogte || settings.header_height) ? `${settings.header_hoogte || settings.header_height}px` : 'var(--header-height, auto)',
          backgroundColor: 'var(--header-bg, var(--color-header, rgba(var(--color-primary-rgb), 0.6)))',
          backdropFilter: 'var(--header-blur, blur(12px))',
          borderColor: 'var(--header-border, rgba(255,255,255,0.1))'
        }}
      >
        <div className="flex items-center gap-4">
          {(settings.logo_afbeelding || settings.site_logo_image) ? (
            <div 
              data-dock-element="header-logo"
              className="w-10 h-10 overflow-hidden"
              style={{ display: (settings.toon_logo === false || settings.header_show_logo === false) ? 'none' : 'block' }}
            >
              <img src={getImageUrl(settings.logo_afbeelding || settings.site_logo_image)} className="w-full h-full object-contain" data-dock-type="media" data-dock-bind="header_settings.0.settings.logo_afbeelding" />
            </div>
          ) : (
            <div 
              data-dock-element="header-logo"
              className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-xl"
              style={{ display: (settings.toon_logo === false || settings.header_show_logo === false) ? 'none' : 'flex' }}
            >
              <i className="fa-solid fa-scissors text-white"></i>
            </div>
          )}
          <span className="font-serif font-bold text-xl tracking-tighter uppercase" data-dock-type="text" data-dock-bind="footer.0.bedrijfsnaam">{navTitleValue}</span>
        </div>

        <div 
          data-dock-element="header-navbar"
          className="hidden md:flex items-center gap-8"
          style={{ display: (settings.toon_navigatie === false || settings.header_show_navbar === false) ? 'none' : 'flex' }}
        >
          {sortedNav.map((item, idx) => (
            <a
              key={idx}
              href={`#${item.slug}`}
              data-dock-element={item.is_call_to_action ? "header-button" : undefined}
              style={{ display: (item.is_call_to_action && (settings.toon_cta_knop === false || settings.header_show_button === false)) ? 'none' : undefined }}
              className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-accent ${item.is_call_to_action ? 'px-5 py-2 bg-accent text-white rounded-full shadow-lg shadow-accent/20' : 'text-white/70'}`}
            >
              <span data-dock-type="text" data-dock-bind={`navbar.${idx}.titel_navigatie`}>{extractText(item.titel_navigatie)}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Main Header / Hero Section */}
      <header 
        id="hero" 
        data-dock-section="hero"
        className="relative min-h-[85vh] flex flex-col overflow-hidden bg-primary text-white pt-20"
      >
        {/* Background Media */}
        <div className="absolute inset-0">
          <img src={getImageUrl(heroData.hero_afbeelding || heroData.hero_image)} className="w-full h-full object-cover" data-dock-type="media" data-dock-bind="hero.0.heroData.hero_afbeelding" />
          {/* Dynamic Gradient Overlay */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, var(--hero-overlay-start, rgba(0,0,0,0.8)), var(--hero-overlay-end, rgba(0,0,0,0.3)))`
            }}
          ></div>
        </div>

        <div className="flex-1 flex items-center justify-center text-center px-6 relative z-20">
          <div className="relative z-10 max-w-4xl mx-auto reveal">
            <h1 
              className="text-5xl md:text-7xl lg:text-9xl mb-8 font-serif font-bold leading-tight" 
              style={{ color: (typeof heroData.titel === 'object' && heroData.titel?.color) ? heroData.titel.color : 'inherit' }}
              data-dock-type="text" 
              data-dock-bind="hero.0.heroData.titel"
            >
              {titleString}
            </h1>

            {taglineString && (
              <p className="text-xl md:text-3xl font-light text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed italic" data-dock-type="text" data-dock-bind="hero.0.heroData.ondertitel">{taglineString}</p>
            )}
            <div className="flex gap-6 justify-center">
              <a href="#tarieven" className="btn-primary px-10 py-5 text-lg">Onze Diensten</a>
              <a href="#footer" className="px-10 py-5 border-2 border-white/30 rounded-full font-bold hover:bg-white hover:text-primary transition-all">Contact</a>
            </div>
          </div>
        </div>

        {/* Modern Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180 z-20">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-20 fill-background">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V46.96C25.54,60.05,72.59,70.97,121.39,70.97c48.8,0,105.51-12.21,135.51-24.54l64.49,10Z"></path>
          </svg>
        </div>
      </header>
    </>
  );
}

export default Header;
