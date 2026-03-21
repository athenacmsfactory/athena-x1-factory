import React from 'react';

const Hero = ({ data, sectionName, features = {}, style = {} }) => {
    const hero = data[0];
    if (!hero) return null;

    const heroTitle = hero.titel || hero.hero_header || hero.site_naam;
    const hasSearchLinks = features.google_search_links;

    const getGoogleSearchUrl = (query) => {
        return `https://www.google.com/search?q=${encodeURIComponent(query + ' ' + (features.search_context || ''))}`;
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
            data-dock-section={sectionName}
            className="relative w-full flex items-center justify-center overflow-hidden bg-slate-900"
            style={{ 
                minHeight: `var(--hero-height, ${hero.hero_full_height ? '100vh' : '85vh'})`,
                ...style 
            }}
        >
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={hero.image ? (hero.image.startsWith('http') ? hero.image : `${import.meta.env.BASE_URL}images/${hero.image}`) : ""} 
                    className="w-full h-full object-cover object-top" 
                    data-dock-type="media" 
                    data-dock-bind="hero.0.image" 
                />
                <div 
                    className="absolute inset-0 z-10 bg-black pointer-events-none transition-opacity duration-300" 
                    style={{ opacity: `var(--hero-overlay-opacity, ${hero.hero_overlay_transparantie ?? 0.6})` }}
                ></div>
            </div>

            {/* Content Container */}
            <div className={`relative z-20 px-6 max-w-6xl w-full flex flex-col transition-all duration-500 ${alignmentClass}`}>
                <h1 className="text-5xl md:text-8xl font-serif font-bold text-white mb-8 leading-tight drop-shadow-2xl animate-reveal">
                    <span data-dock-type="text" data-dock-bind="hero.0.title">{hero.title || heroTitle}</span>
                </h1>
                
                <div className="h-2 w-32 bg-accent mb-10 rounded-full shadow-lg shadow-accent/50 animate-reveal" style={{ animationDelay: '0.2s' }}></div>
                
                <div className={`flex flex-col gap-12 w-full ${alignmentClass}`}>
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl leading-relaxed drop-shadow-lg font-light italic animate-reveal" style={{ animationDelay: '0.4s' }}>
                        <span data-dock-type="text" data-dock-bind="hero.0.subtitle">{hero.subtitle || hero.ondertitel}</span>
                    </p>
                    
                    <div className="flex flex-wrap gap-4 animate-reveal" style={{ animationDelay: '0.6s' }}>
                        {/* CTA Knop */}
                        <button 
                            onClick={(e) => { 
                                if (e.shiftKey) return; 
                                const target = document.getElementById("showcase");
                                if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
                            }} 
                            className={`px-10 py-4 font-black rounded-full transition-all active:scale-95 shadow-2xl ${
                                hero.hero_cta_style === 'outline' 
                                ? 'border-2 border-white text-white hover:bg-white hover:text-slate-900' 
                                : hero.hero_cta_style === 'glass'
                                ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20'
                                : 'bg-accent text-white hover:bg-accent/90'
                            }`}
                            data-dock-type="link" 
                            data-dock-bind="hero.0.cta"
                        >
                            {hero.cta?.label || hero.cta_text || "Ontdek Meer"}
                        </button>

                        {hasSearchLinks && (
                            <a href={getGoogleSearchUrl(heroTitle)} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-3 rounded-full backdrop-blur-md transition-all font-bold flex items-center gap-3 group">
                                <i className="fa-brands fa-google group-hover:text-accent transition-colors"></i>
                                Meer Info
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            {hero.hero_show_arrow !== false && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 animate-bounce text-white/50 cursor-pointer">
                    <i className="fa-solid fa-chevron-down text-3xl"></i>
                </div>
            )}
        </section>
    );
};

export default Hero;
