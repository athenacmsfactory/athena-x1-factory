import React, { useEffect } from 'react';
import Team from './Team';
import Testimonials from './Testimonials';

const Section = ({ data }) => {
  const sectionOrder = data.section_order || [];
  const layoutSettings = data.layout_settings || {};
  const sectionSettings = data.section_settings || {};

  const iconMap = {
    'table': 'fa-table-columns',
    'zap': 'fa-bolt-lightning',
    'smartphone': 'fa-mobile-screen-button',
    'laptop': 'fa-laptop',
    'gear': 'fa-gear',
    'check': 'fa-circle-check',
    'star': 'fa-star',
    'globe': 'fa-globe',
    'users': 'fa-users',
    'rocket': 'fa-rocket'
  };

  useEffect(() => {
    if (window.athenaScan) {
      window.athenaScan(data);
    }
  }, [data, sectionOrder]);

  return (
    <div className="flex flex-col">
      {sectionOrder.map((sectionName, idx) => {
        const items = data[sectionName] || [];
        if (items.length === 0) return null;

        const currentSettings = sectionSettings[sectionName] || {};
        const sectionBgColor = currentSettings.backgroundColor || null;
        const sectionStyle = sectionBgColor ? { backgroundColor: sectionBgColor } : {};
        const currentLayout = layoutSettings[sectionName] || 'grid';

        // --- 1. HERO SECTION ---
        if (sectionName === 'basis' || sectionName === 'hero') {
          const hero = items[0] || {};
          const heroTitle = hero.titel || hero.title || hero.name || "Pure Relaxation Spa";
          const heroSubtitle = hero.ondertitel || hero.subtitle || hero.tagline || "";
          const imgKey = Object.keys(hero).find(k => /foto|afbeelding|url|image|img/i.test(k)) || 'hero_afbeelding';

          return (
            <section
              key={idx}
              id="hero"
              data-dock-section={sectionName}
              className="relative w-full h-auto min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900 pt-24"
            >
              <div className="absolute inset-0 z-0">
                <img src={hero[imgKey]} className="w-full h-full object-cover object-top" data-dock-type="media" data-dock-bind={`sectionName.0.imgKey`} />
                <div className="absolute inset-0 z-20 pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(to bottom, var(--hero-overlay-start, rgba(0,0,0,0.4)), var(--hero-overlay-end, rgba(0,0,0,0.2)))'
                }}></div>
              </div>
              <div className="relative z-30 text-center px-6 max-w-5xl">
                <h1 className="text-5xl md:text-8xl font-serif font-bold text-white mb-8 leading-tight drop-shadow-2xl">
                  <span data-dock-type="text" data-dock-bind={`sectionName.0.Object.keys(hero).find(k`}>{heroTitle}</span>
                </h1>
                <div className="h-2 w-32 bg-accent mx-auto mb-10 rounded-full shadow-lg shadow-accent/50"></div>
                <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow-lg font-light italic">
                  <span data-dock-type="text" data-dock-bind={`sectionName.0.Object.keys(hero).find(k`}>{heroSubtitle}</span>
                </p>
                <div className="flex justify-center">
                  <button onClick={(e) => { 
                if (e.shiftKey) return; 
                const target = document.getElementById("contact");
                if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
            }} data-dock-type="link" data-dock-bind="site_settings.0.titel">{}</button>
                </div>
              </div>
            </section>
          );
        }

        // --- 2. TEAM SECTION ---
        if (sectionName === 'team') {
          return <Team key={idx} data={items} sectionName={sectionName} />;
        }

        // --- 3. REVIEWS/TESTIMONIALS SECTION ---
        if (sectionName === 'reviews' || sectionName === 'testimonials') {
          return <Testimonials key={idx} data={items} sectionName={sectionName} />;
        }

        // --- 4. GENERIC GRID/LIST LAYOUT ---
        return (
          <section key={idx} id={sectionName} data-dock-section={sectionName} className="py-24 px-6 bg-[var(--color-background,#ffffff)]" style={sectionStyle}>
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col items-center mb-16 text-center">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 capitalize">{sectionName.replace(/_/g, ' ')}</h2>
                <div className="h-1.5 w-24 bg-accent rounded-full"></div>
              </div>
              <div className={currentLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12' : 'space-y-20'}>
                {items.map((item, index) => {
                  const title = item.titel || item.title || item.naam || item.service_name || item.name;
                  const text = item.tekst || item.description || item.summary || item.content;
                  const img = item.afbeelding || item.image_url || item.image || item.foto || item.foto_url;
                  const isEven = index % 2 === 0;

                  if (currentLayout === 'grid') {
                    return (
                      <div key={index} className="flex flex-col items-center text-center bg-[var(--color-card-bg,#ffffff)] p-10 rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300">
                        {img && (
                          <div className="w-full aspect-[4/3] rounded-[2rem] overflow-hidden mb-8 shadow-inner">
                            <img src={img} className="w-full h-full object-cover" data-dock-type="media" data-dock-bind={`sectionName.${index}.${Object.keys(item).find(k}`} />
                          </div>
                        )}
                        {title && (
                          <h3 className="text-2xl font-bold text-primary mb-4 leading-tight">
                            <span data-dock-type="text" data-dock-bind={`sectionName.${index}.${Object.keys(item).find(k}`}>{title}</span>
                          </h3>
                        )}
                        {text && (
                          <div className="text-slate-600 text-lg leading-relaxed">
                            <span data-dock-type="text" data-dock-bind={`sectionName.${index}.${Object.keys(item).find(k}`}>{text}</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={index} className={`flex flex-col items-center text-center ${currentLayout === 'list' ? '' : (isEven ? 'md:flex-row' : 'md:flex-row-reverse')} gap-12 md:gap-20`}>
                      {img && (
                        <div className="w-full md:w-1/2 aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl rotate-1 group hover:rotate-0 transition-transform duration-500 border-8 border-[var(--color-card-bg,#ffffff)]">
                          <img src={img} className="w-full h-full object-cover" data-dock-type="media" data-dock-bind={`sectionName.${index}.${Object.keys(item).find(k}`} />
                        </div>
                      )}
                      <div className="flex-1">
                        {title && (
                          <h3 className="text-3xl font-serif font-bold text-primary mb-8 leading-tight">
                            <span data-dock-type="text" data-dock-bind={`sectionName.${index}.${Object.keys(item).find(k}`}>{title}</span>
                          </h3>
                        )}
                        {text && (
                          <div className="text-xl leading-relaxed text-slate-600 mb-6 font-light">
                            <span data-dock-type="text" data-dock-bind={`sectionName.${index}.${Object.keys(item).find(k}`}>{text}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default Section;
