import React from 'react';

const Hero = ({ data, sectionName, features = {}, style = {} }) => {
    const hero = data[0];
    if (!hero) return null;

    const heroTitle = hero.titel || hero.hero_header || hero.site_naam;
    const hasSearchLinks = features.google_search_links;

    const getGoogleSearchUrl = (query) => {
        return `https://www.google.com/search?q=${encodeURIComponent(query + ' ' + (features.search_context || ''))}`;
    };

    return (
        <section
            id="hero"
            data-dock-section={sectionName}
            className="relative w-full h-auto min-h-[var(--hero-height,85vh)] max-h-[var(--hero-max-height,150vh)] aspect-[var(--hero-aspect-ratio,16/9)] flex items-center justify-center overflow-hidden bg-[var(--color-hero-bg)]"
            style={style}
        >
            <div className="absolute inset-0 z-0">
                <img src={hero.hero_afbeelding || hero.foto_url} className="w-full h-full object-cover object-top" data-dock-type="media" data-dock-bind={`sectionName.0.hero.hero_afbeelding`} />
                <div className="absolute inset-0 z-20 pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(to bottom, var(--hero-overlay-start, rgba(0,0,0,0.6)), var(--hero-overlay-end, rgba(0,0,0,0.6)))'
                }}></div>
            </div>
            <div className="relative z-10 text-center px-6 max-w-5xl">
                <h1 className="text-5xl md:text-8xl font-serif font-bold text-white mb-8 leading-tight drop-shadow-2xl">
                    <span data-dock-type="text" data-dock-bind={`sectionName.0.hero.titel`}>{heroTitle}</span>
                </h1>
                <div className="h-2 w-32 bg-accent mx-auto mb-10 rounded-full shadow-lg shadow-accent/50"></div>
                <div className="flex flex-col items-center gap-12">
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-light italic">
                        <span data-dock-type="text" data-dock-bind={`sectionName.0.hero.ondertitel`}>{hero.ondertitel || hero.introductie}</span>
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button onClick={(e) => { 
                if (e.shiftKey) return; 
                const target = document.getElementById("contact");
                if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
            }} data-dock-type="link" data-dock-bind="site_settings.0.titel">{}</button>
                        {hasSearchLinks && (
                            <a href={getGoogleSearchUrl(heroTitle)} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-3 rounded-full backdrop-blur-md transition-all font-bold flex items-center gap-3 group">
                                <i className="fa-brands fa-google group-hover:text-accent transition-colors"></i>
                                Zoek meer inzichten
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
