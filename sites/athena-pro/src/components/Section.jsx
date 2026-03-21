import React, { useEffect } from 'react';

const Section = ({ data }) => {
  const sectionOrder = data.section_order || [];

  const getImgSrc = (img) => {
    if (!img) return `${import.meta.env.BASE_URL}images/placeholder.jpg`;
    if (img.startsWith('http')) return img;
    return `${import.meta.env.BASE_URL}images/${img}`;
  };

  const handleScroll = (e, targetId) => {
    if (e.shiftKey) return;
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (window.athenaScan) {
      window.athenaScan(data);
    }
  }, [data, sectionOrder]);

  return (
    <div className="flex flex-col bg-[var(--color-background)]">
      {sectionOrder.map((sectionName, idx) => {
        if (sectionName === 'contact') return null;
        const items = data[sectionName] || [];
        if (items.length === 0) return null;

        // 1. HERO SECTION
        if (sectionName === 'hero') {
          const item = items[0];
          return (
            <section key={idx} data-dock-section="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img src={getImgSrc(item.image)} className="w-full h-full object-cover" data-dock-type="media" data-dock-bind="hero.0.image" />
                <div className="absolute inset-0 z-20 pointer-events-none" style={{ 
                  backgroundImage: 'linear-gradient(to right, var(--hero-overlay-start, rgba(0,0,0,0.8)), var(--hero-overlay-end, rgba(0,0,0,0.32)))' 
                }}></div>
              </div>
              <div className="relative z-10 text-left px-6 max-w-7xl w-full">
                <div className="max-w-3xl mt-[4.25rem]">
                  <h1 className="text-5xl md:text-8xl font-serif font-extrabold mb-8 leading-tight text-white drop-shadow-2xl">
                    <span data-dock-type="text" data-dock-bind="hero.0.title">{item.title}</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 mb-16 leading-relaxed font-light">
                    <span data-dock-type="text" data-dock-bind="hero.0.subtitle">{item.subtitle}</span>
                  </p>
                  <button 
                    onClick={(e) => handleScroll(e, 'contact')}
                    className="bg-[var(--color-button-bg)] text-[var(--color-button-text)] px-10 py-5 rounded-full text-xl font-bold shadow-2xl hover:scale-105 transition-all"
                    data-dock-type="link"
                    data-dock-bind="hero.0.cta_label"
                  >
                    {item.cta_text || 'Start Nu'}
                  </button>
                </div>
              </div>
            </section>
          );
        }

        // 2. INTRO SECTION
        if (sectionName === 'intro') {
          const item = items[0];
          return (
            <section key={idx} id="intro" data-dock-section="intro" className="py-32 px-6 overflow-hidden">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
                <div className="w-full md:w-1/2 relative">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
                  <div className="relative rounded-[4rem] overflow-hidden shadow-2xl border-8 border-[var(--color-border)]">
                    <img src={getImgSrc(item.image)} className="w-full h-full object-cover" data-dock-type="media" data-dock-bind="intro.0.image" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl md:text-6xl font-serif font-bold text-[var(--color-heading)] mb-10 leading-tight">
                    <span data-dock-type="text" data-dock-bind="intro.0.title">{item.title}</span>
                  </h2>
                  <div className="space-y-8">
                    <p className="text-xl leading-relaxed text-[var(--color-text)] font-light opacity-80">
                      <span data-dock-type="text" data-dock-bind="intro.0.content">{item.content}</span>
                    </p>
                    <p className="text-xl leading-relaxed text-[var(--color-text)] font-light italic border-l-4 border-[var(--color-accent)] pl-8">
                      <span data-dock-type="text" data-dock-bind="intro.0.subcontent">{item.subcontent}</span>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 3. VOORDELEN
        if (sectionName === 'voordelen') {
          return (
            <section key={idx} id="voordelen" data-dock-section="voordelen" className="py-32 px-6 bg-[var(--color-surface, #f8fafc)]">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                  <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-accent)] mb-4">Voordelen</h2>
                  <h3 className="text-4xl md:text-6xl font-serif font-bold text-[var(--color-heading)]">Waarom kiezen voor Athena?</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                  {items.map((item, index) => (
                    <div key={index} className="bg-[var(--color-card)] p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-[var(--color-border)] group">
                      <div className="w-16 h-16 bg-[var(--color-accent-dim)] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <i className={`fa-solid fa-${item.icon || 'star'} text-2xl text-[var(--color-accent)]`}></i>
                      </div>
                      <h4 className="text-2xl font-bold mb-4 text-[var(--color-heading)]">
                        <span data-dock-type="text" data-dock-bind={`voordelen.${index}.title`}>{item.title}</span>
                      </h4>
                      <p className="text-[var(--color-text)] leading-relaxed font-light opacity-70">
                        <span data-dock-type="text" data-dock-bind={`voordelen.${index}.description`}>{item.description}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // 4. INNOVATIE
        if (sectionName === 'innovatie') {
          return (
            <section key={idx} id="innovatie" data-dock-section="innovatie" className="py-32 bg-[var(--color-primary)] text-[var(--color-primary-text, white)] overflow-hidden">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col gap-32">
                  {items.map((item, index) => (
                    <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-20`}>
                      <div className="w-full md:w-1/2">
                        <h3 className="text-4xl md:text-6xl font-serif font-bold mb-10 text-[var(--color-accent)]">
                          <span data-dock-type="text" data-dock-bind={`innovatie.${index}.name`}>{item.name}</span>
                        </h3>
                        <p className="text-2xl leading-relaxed opacity-80 font-light">
                          <span data-dock-type="text" data-dock-bind={`innovatie.${index}.skills`}>{item.skills}</span>
                        </p>
                      </div>
                      <div className="w-full md:w-1/2 relative">
                        <div className="aspect-square rounded-[5rem] overflow-hidden shadow-2xl border-4 border-white/10">
                           <img src={getImgSrc(item.image)} className="w-full h-full object-cover" data-dock-type="media" data-dock-bind={`innovatie.${index}.image`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // 5. SHOWCASE
        if (sectionName === 'showcase') {
          return (
            <section key={idx} id="showcase" data-dock-section="showcase" className="py-32 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24">
                  <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-accent)] mb-4">Portfolio</h2>
                  <h3 className="text-4xl md:text-6xl font-serif font-bold text-[var(--color-heading)]">High-End Realisaties</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  {items.map((item, index) => (
                    <div key={index} className="group relative rounded-[4rem] overflow-hidden shadow-2xl aspect-[4/3]">
                      <img src={getImgSrc(item.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" data-dock-type="media" data-dock-bind={`showcase.${index}.image`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-12">
                        <h4 className="text-3xl font-bold text-white mb-2">
                          <span data-dock-type="text" data-dock-bind={`showcase.${index}.name`}>{item.name}</span>
                        </h4>
                        <p className="text-[var(--color-accent)] font-medium">Bekijk Project</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // 6. PROCES
        if (sectionName === 'proces') {
          return (
            <section key={idx} id="proces" data-dock-section="proces" className="py-32 bg-[var(--color-surface, #f8fafc)]">
              <div className="max-w-5xl mx-auto px-6">
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-center text-[var(--color-heading)] mb-24">Ons Proces</h2>
                <div className="space-y-20">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-12 items-start">
                      <div className="text-7xl font-serif font-black text-[var(--color-accent-dim, rgba(0,0,0,0.1))] shrink-0">
                        {String(item.stap).padStart(2, '0')}
                      </div>
                      <div>
                        <h4 className="text-3xl font-bold text-[var(--color-heading)] mb-4">
                          <span data-dock-type="text" data-dock-bind={`proces.${index}.titel`}>{item.titel}</span>
                        </h4>
                        <p className="text-xl text-[var(--color-text)] opacity-70 font-light leading-relaxed">
                          <span data-dock-type="text" data-dock-bind={`proces.${index}.beschrijving`}>{item.beschrijving}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
};

export default Section;
