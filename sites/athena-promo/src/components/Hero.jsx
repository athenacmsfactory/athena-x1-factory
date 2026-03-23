import React from 'react';
import EditableMedia from './EditableMedia';

const Hero = ({ data, sectionName, features = {}, style = {} }) => {
    const getImageUrl = (url) => {
    if (!url) return '';
    if (typeof url === 'object') url = url.text || url.url || '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = import.meta.env.BASE_URL || '/';
    if (url.startsWith(base) && base !== '/') return url;
    const isRootPublic = url.startsWith('./') || url.endsWith('.svg') || url.endsWith('.ico') || url === 'site-logo.svg' || url === 'athena-icon.svg';
    const hasImagesPrefix = url.includes('/images/') || url.startsWith('images/');
    const pathPrefix = (isRootPublic || hasImagesPrefix) ? '' : 'images/';
    return (base + pathPrefix + url.replace('./', '')).replace(new RegExp('/+', 'g'), '/');
  };
    const hero = data?.[0];
    if (!hero) return null;

    const heroTitle = hero.titel || hero.hero_header || hero.site_naam;
    const imgKey = hero.hero_afbeelding ? 'hero_afbeelding' : 'foto_url';

    const handleScroll = (e) => {
        const url = hero.cta_url || "#contact";
        if (url.startsWith('#')) {
            e.preventDefault();
            const target = document.getElementById(url.substring(1));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section
            id="hero"
            data-dock-section={sectionName}
            className="relative w-full h-auto min-h-[var(--hero-height,85vh)] max-h-[var(--hero-max-height,150vh)] aspect-[var(--hero-aspect-ratio,16/9)] flex items-center justify-center overflow-hidden bg-[var(--color-hero-bg)]"
            style={style}
        >
            <div className="absolute inset-0 z-0">
                <EditableMedia
                    src={getImageUrl(hero[imgKey])}
                    className="w-full h-full object-cover object-top"
                    cmsBind={{ file: sectionName, index: 0, key: imgKey }}
                />
                <div className="absolute inset-0 z-20 pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(to bottom, var(--hero-overlay-start, rgba(0,0,0,0.6)), var(--hero-overlay-end, rgba(0,0,0,0.6)))'
                }}></div>
            </div>
            <div className="relative z-10 text-center px-6 max-w-5xl">
                <h1 
                    className="text-5xl md:text-8xl font-serif font-bold text-white mb-8 leading-tight drop-shadow-2xl"
                >
                    <span data-dock-type="text" data-dock-bind={`${sectionName}.0.titel`}>{heroTitle}</span>
                </h1>
                <div className="h-2 w-32 bg-accent mx-auto mb-10 rounded-full shadow-lg shadow-accent/50"></div>
                <div className="flex flex-col items-center gap-12">
                    <p 
                        className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-light italic"
                    >
                        <span data-dock-type="text" data-dock-bind={`${sectionName}.0.ondertitel`}>{hero.ondertitel || hero.introductie}</span>
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={handleScroll}
                            className="bg-[var(--color-button-bg)] text-white px-10 py-4 rounded-full text-xl font-bold shadow-2xl hover:opacity-90 transition-all transform hover:scale-105"
                        >
                            <span data-dock-type="text" data-dock-bind={`${sectionName}.0.cta_label`}>{hero.cta_label || "Contact"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
