import React from 'react';
import EditableMedia from './EditableMedia';
import EditableText from './EditableText';
import EditableLink from './EditableLink';

const Hero = ({ data }) => {
    const hero = Array.isArray(data) ? data[0] : data;
    if (!hero) return null;

    const heroTitle = hero.titel || hero.hero_header || 'De Schaar';
    const overlayOpacity = hero.hero_overlay_transparantie ?? hero.hero_overlay_opacity ?? "0.4";

    const handleScroll = (e, url) => {
        const targetUrl = typeof url === 'object' ? url?.url : url;
        if (targetUrl && targetUrl.startsWith('#')) {
            e.preventDefault();
            const targetId = targetUrl.substring(1);
            const element = document.getElementById(targetId);
            if (element) {
                const offset = 80;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            } else if (targetId === 'footer') {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        }
    };

    return (
        <section
            id="hero"
            data-dock-section="hero"
            className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-black"
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <EditableMedia
                    src={hero.hero_afbeelding || "hero-placeholder.jpg"}
                    cmsBind={{ file: 'hero', index: 0, key: 'hero_afbeelding' }}
                    className="w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0 z-10 bg-black" 
                  style={{ opacity: overlayOpacity }}
                ></div>
            </div>

            {/* Content */}
            <div className="relative z-20 text-center px-6 max-w-5xl">
                <h1 className="text-5xl md:text-8xl font-serif font-bold mb-8 leading-tight drop-shadow-2xl" style={{ color: (typeof hero.titel === 'object' ? hero.titel?.color : null) || 'var(--color-title, var(--color-primary, white))' }}>
                    <EditableText 
                      value={heroTitle} 
                      cmsBind={{ file: 'hero', index: 0, key: 'titel' }} 
                    />
                </h1>
                
                <div className="h-2 w-32 bg-accent mx-auto mb-10 rounded-full shadow-lg shadow-accent/50"></div>
                
                {hero.ondertitel && (
                  <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-light italic mb-12">
                      <EditableText 
                        value={hero.ondertitel} 
                        cmsBind={{ file: 'hero', index: 0, key: 'ondertitel' }} 
                      />
                  </p>
                )}

                <div className="flex justify-center">
                    <EditableLink
                        as="button"
                        url={hero.knop}
                        cmsBind={{ file: 'hero', index: 0, key: 'knop' }}
                        className="bg-accent text-white px-10 py-4 rounded-full text-xl font-bold shadow-2xl hover:bg-accent/90 transition-all transform hover:scale-105"
                        onClick={(e) => handleScroll(e, hero.knop)}
                    />
                </div>
            </div>
        </section>
    );
};

export default Hero;
