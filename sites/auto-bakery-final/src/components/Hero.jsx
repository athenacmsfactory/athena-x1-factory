import React from 'react';
import { useLego, bindProps, getImageUrl } from '../lib/LegoUtils';

const Hero = ({ data, sectionName, features = {}, style = {} }) => {
    const hero = data[0];
    if (!hero) return null;

    // Use v9.x hook for managed data
    const titleRes    = useLego(hero, 'title', hero.titel || hero.hero_header || '');
    const subtitleRes = useLego(hero, 'subtitle', hero.ondertitel || hero.introductie || '');
    const imageRes    = useLego(hero, 'image', hero.hero_afbeelding || hero.foto_url || '');
    const ctaRes      = useLego(hero, 'cta', hero.cta_label || hero.button_text || 'Meer info');

    const heroCtaUrl = hero.cta_url || hero.link || '#contact';
    const hasSearchLinks = features.google_search_links;

    const getGoogleSearchUrl = (query) =>
        `https://www.google.com/search?q=${encodeURIComponent(query + ' ' + (features.search_context || ''))}`;

    return (
        <section
            id="hero"
            data-dock-section={sectionName}
            className="relative w-full flex items-center justify-center overflow-hidden"
            style={{ minHeight: 'var(--hero-height, 90vh)', ...style }}
        >
            {/* Background image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={getImageUrl(imageRes.content)}
                    {...bindProps(imageRes, sectionName, 0, 'image')}
                    alt="Hero Background"
                    className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 z-10 pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(to bottom, var(--hero-overlay-start, rgba(0,0,0,0.55)), var(--hero-overlay-end, rgba(0,0,0,0.35)))'
                }}></div>
            </div>

            {/* Content */}
            <div className="relative z-20 text-center px-6 max-w-5xl mx-auto py-24">
                {titleRes.content && (
                    <h1 
                        className="text-5xl md:text-8xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl"
                        {...bindProps(titleRes, sectionName, 0, 'text')}
                    >
                        {titleRes.content}
                    </h1>
                )}
                <div className="h-1.5 w-32 bg-[var(--color-accent,#bc6c25)] mx-auto mb-8 rounded-full opacity-90"></div>
                {subtitleRes.content && (
                    <p 
                        className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-light italic mb-10"
                        {...bindProps(subtitleRes, sectionName, 0, 'text')}
                    >
                        {subtitleRes.content}
                    </p>
                )}
                <div className="flex flex-wrap justify-center gap-4">
                    <a
                        href={heroCtaUrl}
                        {...bindProps(ctaRes, sectionName, 0, 'link')}
                        className="bg-[var(--color-accent,#bc6c25)] text-white px-10 py-4 rounded-full text-xl font-bold shadow-2xl hover:opacity-90 transition-all transform hover:scale-105"
                        onClick={(e) => {
                            if (heroCtaUrl.startsWith('#')) {
                                e.preventDefault();
                                document.getElementById(heroCtaUrl.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    >
                        {ctaRes.content}
                    </a>
                    {hasSearchLinks && titleRes.content && (
                        <a href={getGoogleSearchUrl(titleRes.content)} target="_blank" rel="noopener noreferrer"
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-full backdrop-blur-md transition-all font-bold flex items-center gap-3 group">
                            <i className="fa-brands fa-google group-hover:text-accent transition-colors"></i>
                            Zoek meer inzichten
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Hero;
