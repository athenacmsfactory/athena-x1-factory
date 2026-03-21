import React from 'react';

const HeroSection = ({ items: data, sectionName, siteSettings }) => {
  if (!data || data.length === 0) return null;
  const hero = data[0];
  const settings = siteSettings || {};

  // v8.8 Hub-specifieke herstelactie - respecteer lege strings
  const heroTitle = (hero.title !== undefined && hero.title !== null) ? hero.title : (hero.titel || '');
  const heroSubtitle = (hero.subtitle !== undefined && hero.subtitle !== null) ? hero.subtitle : (hero.ondertitel || '');
  const rawImg = hero.image || 'hero-athenahub-1-1770366162431.webp';
  const imgSrc = (rawImg || "").startsWith('http') ? rawImg : `${import.meta.env.BASE_URL}images/${rawImg}`;

  const handleScroll = (e) => {
    if (e.shiftKey) return;
    const url = (hero.cta && hero.cta.url) ? hero.cta.url : "#showcase";
    if ((url || "").startsWith('#')) {
      e.preventDefault();
      const target = document.getElementById(url.substring(1));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Stijl mapping voor uitlijning
  const alignmentClass = {
    'left': 'text-left items-start',
    'right': 'text-right items-end',
    'center': 'text-center items-center'
  }[hero.hero_alignment || 'center'] || 'text-center items-center';

  return (
    <section 
      id="hero" 
      className="relative w-full flex items-center justify-center overflow-hidden bg-primary" 
      data-dock-section={sectionName}
      style={{ 
        minHeight: `var(--hero-height, ${hero.hero_full_height ? '100vh' : '85vh'})`
      }}
    >
      <div className="absolute inset-0 z-0">
        <img 
          src={imgSrc} 
          className="w-full h-full object-cover object-top" 
          data-dock-type="media" 
          data-dock-bind={`${sectionName}.0.image`} 
        />
        <div 
            className="absolute inset-0 bg-black z-10 pointer-events-none transition-opacity duration-300" 
            style={{ opacity: `var(--hero-overlay-opacity, ${hero.hero_overlay_transparantie ?? 0.6})` }}
        ></div>

      </div>

      <div className={`relative z-20 px-6 max-w-6xl w-full flex flex-col transition-all duration-500 ${alignmentClass}`}>
        <h1 className="text-6xl md:text-9xl font-serif font-black text-white mb-8 leading-tight drop-shadow-2xl animate-reveal">
          <span data-dock-type="text" data-dock-bind={`${sectionName}.0.title`}>{heroTitle}</span>
        </h1>
        
        <p className="text-xl md:text-3xl text-white/90 max-w-3xl leading-relaxed drop-shadow-lg font-light italic mb-12 animate-reveal" style={{ animationDelay: '0.2s' }}>
          <span data-dock-type="text" data-dock-bind={`${sectionName}.0.subtitle`}>{heroSubtitle}</span>
        </p>

        <div className={`flex flex-wrap gap-6 animate-reveal ${alignmentClass}`} style={{ animationDelay: '0.4s' }}>
          <button 
            onClick={handleScroll} 
            className={`px-10 py-4 font-black rounded-full transition-all active:scale-95 shadow-2xl ${
                hero.hero_cta_style === 'outline' 
                ? 'border-2 border-white text-white hover:bg-white hover:text-slate-900' 
                : hero.hero_cta_style === 'glass'
                ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20'
                : 'bg-accent text-white hover:bg-accent/90'
            }`}
            data-dock-type="link" 
            data-dock-bind={`${sectionName}.0.cta`}
          >
            {hero.cta?.label || hero.cta_text || "Ontdek Meer"}
          </button>
        </div>
      </div>

      {hero.hero_show_arrow !== false && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/30 text-4xl cursor-pointer">
            <i className="fa-solid fa-chevron-down"></i>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
