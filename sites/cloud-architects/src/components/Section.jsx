import React, { useEffect } from 'react';

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
        if (items.length === 0 && sectionName !== 'contact') return null;

        const currentSettings = sectionSettings[sectionName] || {};
        const sectionBgColor = currentSettings.backgroundColor || null;
        const sectionStyle = sectionBgColor ? { backgroundColor: sectionBgColor } : {};
        const currentLayout = layoutSettings[sectionName] || 'grid';

        // --- 1. HERO SECTION ---
        if (sectionName === 'hero') {
          const hero = items[0] || {};
          const heroTitle = hero.titel || "Future-Proof Cloud Architecture";
          const heroSubtitle = hero.subtitel || "";
          const imgKey = Object.keys(hero).find(k => /foto|afbeelding|url|image|img/i.test(k)) || 'afbeelding';

          return (
            <section
              key={idx}
              id="hero"
              data-dock-section={sectionName}
              className="relative w-full h-auto min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900 pt-24"
            >
              <div className="absolute inset-0 z-0">
                <img src={hero[imgKey] || "site-logo.svg"} className="w-full h-full object-cover" data-dock-type="media" data-dock-bind={`sectionName.0.imgKey`} />
                <div className="absolute inset-0 z-20 pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.15))'
                }}></div>
              </div>
              <div className="relative z-30 text-center px-6 max-w-5xl">
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight drop-shadow-2xl">
                  <span data-dock-type="text" data-dock-bind={`sectionName.0.titel`}>{heroTitle}</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow-lg font-light italic">
                  <span data-dock-type="text" data-dock-bind={`sectionName.0.subtitel`}>{heroSubtitle}</span>
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

        // --- 2. CONTACT SECTION (SPLIT LAYOUT) ---
        if (sectionName === 'contact') {
          const contact = items[0] || {};
          const title = contact.titel || "Laten we praten";
          const text = contact.tekst || "Klaar voor de volgende stap?";
          const img = contact.afbeelding || contact.image || contact.foto;

          return (
            <section key={idx} id="contact" data-dock-section={sectionName} className="py-24 px-6 bg-white overflow-hidden" style={sectionStyle}>
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
                  <div className="w-full md:w-1/2 aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                    <img src={img} className="w-full h-full object-cover" data-dock-type="media" data-dock-bind="contact.0.afbeelding" />
                  </div>
                  <div className="flex-1 space-y-8">
                    <div className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-black uppercase tracking-widest">Contact</div>
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-primary leading-tight">
                      <span data-dock-type="text" data-dock-bind="contact.0.titel">{title}</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-slate-600 font-light leading-relaxed">
                      <span data-dock-type="text" data-dock-bind="contact.0.tekst">{text}</span>
                    </p>
                    <div className="pt-4">
                      <button onClick={(e) => { 
                if (e.shiftKey) return; 
                const target = document.getElementById("contact");
                if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
            }} data-dock-type="link" data-dock-bind="site_settings.0.titel">{}</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // --- 3. PACKAGES LAYOUT ---
        if (sectionName === 'packages' || currentLayout === 'packages') {
          return (
            <section key={idx} id={sectionName} data-dock-section={sectionName} className="py-24 px-6 bg-slate-50" style={sectionStyle}>
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 capitalize">{sectionName}</h2>
                  <div className="h-1.5 w-24 bg-accent rounded-full mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                  {items.map((item, index) => {
                    const isPopular = item.popular === true || item.popular === 'true';
                    const vinkjes = item.vinkjes ? (typeof item.vinkjes === 'string' ? item.vinkjes.split(';') : item.vinkjes) : [];
                    return (
                      <div key={index} className={`relative flex flex-col h-full bg-white p-10 rounded-[2.5rem] shadow-xl border transition-all duration-300 hover:shadow-2xl ${isPopular ? 'border-accent border-4 scale-105 z-10' : 'border-slate-100'}`}>
                        {isPopular && <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-accent text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">Meest Gekozen</div>}
                        <div className="mb-8">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl ${isPopular ? 'bg-accent text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <i className={`fa-solid ${item.icon ? (iconMap[item.icon.toLowerCase()] || `fa-${item.icon.toLowerCase()}`) : 'fa-box'}`}></i>
                          </div>
                          <h3 className="text-2xl font-bold text-primary mb-2">
                            <span data-dock-type="text" data-dock-bind={`sectionName.${index}.${item.titel}`}>{item.titel || item.package_name}</span>
                          </h3>
                          <p className="text-slate-500 text-sm italic font-light">
                            <span data-dock-type="text" data-dock-bind={`sectionName.${index}.${item.subtitel}`}>{item.subtitel || item.subtitle}</span>
                          </p>
                        </div>
                        <div className="mb-8 pb-8 border-b border-slate-100 flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-primary">{item.valuta || '€'}</span>
                          <span className="text-5xl font-black text-primary tracking-tight">
                            <span data-dock-type="text" data-dock-bind={`sectionName.${index}.${item.prijs}`}>{item.prijs || item.price}</span>
                          </span>
                          <span className="text-slate-400 text-sm font-medium">{item.periode}</span>
                        </div>
                        <ul className="space-y-4 mb-10 flex-1">
                          {vinkjes.map((vink, vIdx) => (
                            <li key={vIdx} className="flex items-start gap-3 text-slate-600 text-sm leading-tight">
                              <i className="fa-solid fa-circle-check text-accent mt-0.5"></i>
                              <span>{vink}</span>
                            </li>
                          ))}
                        </ul>
                        <button className={`w-full py-4 rounded-2xl font-bold text-center transition-all ${isPopular ? 'bg-accent text-white shadow-xl shadow-accent/30 hover:bg-accent/90' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                          Aan de slag
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        // --- 4. GENERIC GRID/LIST LAYOUT (Used for Expertise & Projects) ---
        return (
          <section key={idx} id={sectionName} data-dock-section={sectionName} className="py-24 px-6 bg-white" style={sectionStyle}>
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col items-center mb-16 text-center">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 capitalize">{sectionName.replace(/_/g, ' ')}</h2>
                <div className="h-1.5 w-24 bg-accent rounded-full"></div>
              </div>
              <div className={currentLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12' : 'space-y-20'}>
                {items.map((item, index) => {
                  const title = item.titel || item.title || item.naam || item.client_name;
                  const subtitle = item.subtitel || item.project_title;
                  const text = item.tekst || item.description || item.summary || item.result;
                  const img = item.afbeelding || item.image_url || item.image || item.foto;

                  return (
                    <div key={index} className="flex flex-col items-center text-center bg-slate-50 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                      {img && (
                        <div className="w-full aspect-[4/3] rounded-[2rem] overflow-hidden mb-8 shadow-inner">
                          <img src={img} className="w-full h-full object-cover" data-dock-type="media" data-dock-bind={`sectionName.${index}.${item.afbeelding}`} />
                        </div>
                      )}
                      {title && (
                        <h3 className="text-2xl font-bold text-primary mb-2">
                          <span data-dock-type="text" data-dock-bind={`sectionName.${index}.${item.titel}`}>{title}</span>
                        </h3>
                      )}
                      {subtitle && (
                        <p className="text-accent text-sm font-bold uppercase tracking-widest mb-4">
                          <span data-dock-type="text" data-dock-bind={`sectionName.${index}.${item.subtitel}`}>{subtitle}</span>
                        </p>
                      )}
                      {text && (
                        <div className="text-slate-600 text-lg leading-relaxed">
                          <span data-dock-type="text" data-dock-bind={`sectionName.${index}.${item.tekst}`}>{text}</span>
                        </div>
                      )}
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