import EditableMedia from './EditableMedia';
import EditableText from './EditableText';
import EditableLink from './EditableLink';

const Hero = ({ data, sectionName, features = {}, style = {} }) => {
    const hero = data[0];
    if (!hero) return null;

    // Support both Dutch and English field names
    const heroTitle    = hero.titel       || hero.title       || hero.hero_header || hero.site_naam || '';
    const heroSubtitle = hero.ondertitel  || hero.subtitle    || hero.introductie || hero.tagline   || '';
    const heroImage    = hero.hero_afbeelding || hero.image   || hero.foto_url    || hero.img       || '';
    const heroCtaLabel = hero.cta_label   || hero.button_text || hero.knop        || 'Meer info';
    const heroCtaUrl   = hero.cta_url     || hero.link        || '#contact';
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
                <EditableMedia
                    src={heroImage}
                    cmsBind={{ file: sectionName, index: 0, key: 'image' }}
                    className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 z-10 pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(to bottom, var(--hero-overlay-start, rgba(0,0,0,0.55)), var(--hero-overlay-end, rgba(0,0,0,0.35)))'
                }}></div>
            </div>

            {/* Content */}
            <div className="relative z-20 text-center px-6 max-w-5xl mx-auto py-24">
                {heroTitle && (
                    <h1 className="text-5xl md:text-8xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                        <EditableText value={heroTitle} cmsBind={{ file: sectionName, index: 0, key: 'title' }} />
                    </h1>
                )}
                <div className="h-1.5 w-32 bg-[var(--color-accent,#bc6c25)] mx-auto mb-8 rounded-full opacity-90"></div>
                {heroSubtitle && (
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-light italic mb-10">
                        <EditableText value={heroSubtitle} cmsBind={{ file: sectionName, index: 0, key: 'subtitle' }} />
                    </p>
                )}
                <div className="flex flex-wrap justify-center gap-4">
                    <EditableLink
                        as="button"
                        label={heroCtaLabel}
                        url={heroCtaUrl}
                        cmsBind={{ file: sectionName, index: 0, key: 'cta' }}
                        className="bg-[var(--color-accent,#bc6c25)] text-white px-10 py-4 rounded-full text-xl font-bold shadow-2xl hover:opacity-90 transition-all transform hover:scale-105"
                        onClick={(e) => {
                            if (heroCtaUrl.startsWith('#')) {
                                e.preventDefault();
                                document.getElementById(heroCtaUrl.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    />
                    {hasSearchLinks && heroTitle && (
                        <a href={getGoogleSearchUrl(heroTitle)} target="_blank" rel="noopener noreferrer"
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
