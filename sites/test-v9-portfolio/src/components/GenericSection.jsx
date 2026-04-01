import EditableMedia from './EditableMedia';
import EditableText from './EditableText';
import EditableLink from './EditableLink';

const GenericSection = ({ data, sectionName, layout = 'list', features = {}, style = {} }) => {
    if (!data || data.length === 0) return null;
    const hasSearchLinks = !!features.google_search_links;
    const isGallery = /gallery|foto|galerij|portfolio/i.test(sectionName);

    const iconMap = {
        'table': 'fa-table-columns', 'zap': 'fa-bolt-lightning', 'smartphone': 'fa-mobile-screen-button',
        'laptop': 'fa-laptop', 'gear': 'fa-gear', 'check': 'fa-circle-check', 'star': 'fa-star',
        'globe': 'fa-globe', 'users': 'fa-users', 'rocket': 'fa-rocket',
        'bread-slice': 'fa-bread-slice', 'cookie': 'fa-cookie', 'coffee': 'fa-mug-hot',
        'leaf': 'fa-leaf', 'heart': 'fa-heart', 'shop': 'fa-shop',
    };

    const getGoogleSearchUrl = (query) =>
        `https://www.google.com/search?q=${encodeURIComponent(query + ' ' + (features.search_context || ''))}`;

    const humanTitle = sectionName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    /* === GALLERY LAYOUT === */
    if (isGallery) {
        return (
            <section id={sectionName} data-dock-section={sectionName} className="py-24 px-6 bg-[var(--color-background,#1a1a2e)]" style={style}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center mb-16 text-center">
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-heading,#bc6c25)] mb-4 capitalize">{humanTitle}</h2>
                        <div className="h-1.5 w-24 bg-[var(--color-accent,#606c38)] rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
                        {data.map((item, index) => {
                            const imgKey = Object.keys(item).find(k => /foto|afbeelding|url|image|img/i.test(k));
                            const titleKey = Object.keys(item).find(k => /naam|titel|title|onderwerp|header/i.test(k));
                            if (!imgKey || !item[imgKey]) return null;
                            return (
                                <div key={index} className={`relative overflow-hidden rounded-2xl shadow-lg group ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                                    <EditableMedia
                                        src={item[imgKey]}
                                        cmsBind={{ file: sectionName, index, key: imgKey }}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {titleKey && item[titleKey] && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                            <p className="text-white font-semibold text-sm">
                                                <EditableText value={item[titleKey]} cmsBind={{ file: sectionName, index, key: titleKey }} />
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        );
    }

    /* === GRID LAYOUT (services, features, ...) === */
    if (layout === 'grid') {
        return (
            <section id={sectionName} data-dock-section={sectionName} className="py-24 px-6 bg-[var(--color-background,#1a1a2e)]" style={style}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center mb-16 text-center">
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-heading,#bc6c25)] mb-4 capitalize">{humanTitle}</h2>
                        <div className="h-1.5 w-24 bg-[var(--color-accent,#606c38)] rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {data.map((item, index) => {
                            const titleKey = Object.keys(item).find(k => /naam|titel|title|onderwerp|header/i.test(k));
                            const textKeys = Object.keys(item).filter(k => k !== titleKey && !/foto|afbeelding|url|image|img|link|id|icon/i.test(k));
                            const imgKey = Object.keys(item).find(k => /foto|afbeelding|url|image|img/i.test(k));
                            const iconClass = item.icon ? (iconMap[item.icon.toLowerCase()] || `fa-${item.icon.toLowerCase()}`) : null;

                            return (
                                <div key={index} className="flex flex-col bg-[var(--color-card,#2a2a3e)] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/5">
                                    {imgKey && item[imgKey] && (
                                        <div className="aspect-[4/3] overflow-hidden">
                                            <EditableMedia
                                                src={item[imgKey]}
                                                cmsBind={{ file: sectionName, index, key: imgKey }}
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                            />
                                        </div>
                                    )}
                                    <div className="p-8 flex flex-col flex-1">
                                        {iconClass && !imgKey && (
                                            <div className="w-16 h-16 bg-[var(--color-accent,#bc6c25)]/20 rounded-2xl flex items-center justify-center mb-6 text-[var(--color-accent,#bc6c25)] text-3xl">
                                                <i className={`fa-solid ${iconClass}`}></i>
                                            </div>
                                        )}
                                        {titleKey && (
                                            <h3 className="text-2xl font-serif font-bold text-[var(--color-title,#fefae0)] mb-3">
                                                <EditableText value={item[titleKey]} cmsBind={{ file: sectionName, index, key: titleKey }} />
                                            </h3>
                                        )}
                                        {textKeys.map(tk => (
                                            <div key={tk} className="text-[var(--color-text,#e0e0e0)]/80 leading-relaxed">
                                                <EditableText value={item[tk]} cmsBind={{ file: sectionName, index, key: tk }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        );
    }

    /* === LIST / SPLIT LAYOUT === */
    return (
        <section id={sectionName} data-dock-section={sectionName} className="py-24 px-6 bg-[var(--color-background,#1a1a2e)]" style={style}>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col items-center mb-16 text-center">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-heading,#bc6c25)] mb-4 capitalize">{humanTitle}</h2>
                    <div className="h-1.5 w-24 bg-[var(--color-accent,#606c38)] rounded-full"></div>
                </div>
                <div className="space-y-20">
                    {data.map((item, index) => {
                        const titleKey = Object.keys(item).find(k => /naam|titel|title|onderwerp|header/i.test(k));
                        const textKeys = Object.keys(item).filter(k => k !== titleKey && !/foto|afbeelding|url|image|img|link|id|icon/i.test(k));
                        const imgKey = Object.keys(item).find(k => /foto|afbeelding|url|image|img/i.test(k));
                        const isEven = index % 2 === 0;

                        return (
                            <div key={index} className={`flex flex-col ${imgKey && item[imgKey] ? (isEven ? 'md:flex-row' : 'md:flex-row-reverse') : ''} gap-12 md:gap-20 items-center`}>
                                {imgKey && item[imgKey] && (
                                    <div className="w-full md:w-1/2 aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                                        <EditableMedia src={item[imgKey]} cmsBind={{ file: sectionName, index, key: imgKey }} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    {titleKey && (
                                        <h3 className="text-3xl font-serif font-bold text-[var(--color-title,#fefae0)] mb-4">
                                            <EditableText value={item[titleKey]} cmsBind={{ file: sectionName, index, key: titleKey }} />
                                        </h3>
                                    )}
                                    {textKeys.map(tk => (
                                        <div key={tk} className="text-xl leading-relaxed text-[var(--color-text,#e0e0e0)]/75 mb-4">
                                            <EditableText value={item[tk]} cmsBind={{ file: sectionName, index, key: tk }} />
                                        </div>
                                    ))}
                                    {(item.link || item.link_url) && (
                                        <EditableLink label={item.link || 'Lees meer'} url={item.link_url || item.link} table={sectionName} field="link" id={index}
                                            className="inline-flex items-center gap-2 text-[var(--color-accent,#bc6c25)] font-bold hover:underline text-lg mt-2" />
                                    )}
                                    {hasSearchLinks && titleKey && (
                                        <a href={getGoogleSearchUrl(item[titleKey])} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all text-sm font-bold mt-4 ml-4">
                                            <i className="fa-brands fa-google text-accent"></i> Zoek bronnen
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default GenericSection;
