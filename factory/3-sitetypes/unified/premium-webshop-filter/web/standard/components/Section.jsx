import React, { useEffect, useState } from 'react';
import { useCart } from './CartContext';

const Section = ({ data }) => {
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
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const sectionOrder = data.section_order || [];
  const categories = data.categorieen || [];

  useEffect(() => {
    if (window.athenaScan) {
      window.athenaScan(data);
    }
  }, [data, sectionOrder]);

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col">
      {sectionOrder.map((sectionName, idx) => {
        let items = data[sectionName] || [];
        if (items.length === 0) return null;

        // Verberg de losse categorieen-sectie (de tekst-opsomming)
        if (sectionName === 'categorieen') return null;

        if (sectionName === 'basisgegevens') {
          const hero = items[0];
          const heroTitle = hero.titel || hero.hero_header || hero.site_naam;
          return (
            <section key={idx} id="hero" data-dock-section="basisgegevens" className="relative w-full h-auto min-h-[var(--hero-height,85vh)] max-h-[var(--hero-max-height,150vh)] aspect-[var(--hero-aspect-ratio,16/9)] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img src={hero.hero_afbeelding || hero.foto_url} className="w-full h-full object-cover object-top" data-dock-type="media" data-dock-bind="basisgegevens.0.hero.hero_afbeelding" />
                <div className="absolute inset-0 z-20 pointer-events-none" style={{ 
                  backgroundImage: 'linear-gradient(to bottom, var(--hero-overlay-start, rgba(0,0,0,0.6)), var(--hero-overlay-end, rgba(0,0,0,0.6)))' 
                }}></div>
              </div>
              <div className="relative z-10 text-center px-6 max-w-5xl">
                <h1 className="text-5xl md:text-8xl font-serif font-bold text-white mb-8 leading-tight drop-shadow-2xl">
                  <span data-dock-type="text" data-dock-bind="basisgegevens.0.hero.titel">{heroTitle}</span>
                </h1>
                <div className="h-2 w-32 bg-accent mx-auto mb-10 rounded-full shadow-lg shadow-accent/50"></div>
                <div className="flex flex-col items-center gap-12">
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-light italic">
                       <span data-dock-type="text" data-dock-bind="basisgegevens.0.hero.ondertitel">{hero.ondertitel || hero.introductie}</span>
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button onClick={(e) => { 
                if (e.shiftKey) return; 
                const target = document.getElementById("contact");
                if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
            }} data-dock-type="link" data-dock-bind="site_settings.0.header_cta_text">Contact</button>
                        
                    </div>
                </div>
              </div>
            </section>
          );
        }

        if (sectionName.includes('product') || sectionName.includes('shop')) {
          const filteredItems = selectedCategory === 'Alle' 
            ? items 
            : items.filter(item => item.categorie === selectedCategory);

          return (
            <section key={idx} id={sectionName} data-dock-section={sectionName} className="py-24 px-6 bg-background">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-serif font-bold mb-8 text-center text-primary uppercase tracking-widest">{sectionName.replace(/_/g, ' ')}</h2>
                
                {/* Category Filter Bar */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-4 mb-16">
                    <button 
                      onClick={() => setSelectedCategory('Alle')}
                      className={`px-6 py-2 rounded-full font-bold transition-all ${selectedCategory === 'Alle' ? 'bg-accent text-white shadow-lg scale-105' : 'bg-surface text-primary hover:bg-slate-100'}`}
                    >
                      Alle
                    </button>
                    {categories.map((cat, cIdx) => (
                      <button 
                        key={cIdx}
                        onClick={() => setSelectedCategory(cat.naam)}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${selectedCategory === cat.naam ? 'bg-accent text-white shadow-lg scale-105' : 'bg-surface text-primary hover:bg-slate-100'}`}
                      >
                        {cat.naam}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {filteredItems.map((item, index) => {
                    const priceValue = parseFloat(String(item.prijs || 0).replace(/[^0-9.,]/g, '').replace(',', '.'));
                    const titleKey = Object.keys(item).find(k => /naam|titel/i.test(k)) || 'naam';
                    const imgKey = Object.keys(item).find(k => /foto|afbeelding|url/i.test(k)) || 'product_foto_url';
                    return (
                      <article key={index} className="flex flex-col bg-surface rounded-[2.5rem] shadow-xl overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl group border border-slate-100">
                        <div className="aspect-square overflow-hidden flex-shrink-0 relative">
                          <img src={getImageUrl(item[imgKey])} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-dock-type="media" data-dock-bind={`sectionName.0.imgKey`} />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                          {item.categorie && (
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1 rounded-full text-xs font-black uppercase tracking-tighter text-accent shadow-sm">
                              {item.categorie}
                            </div>
                          )}
                        </div>
                        <div className="p-8 flex flex-col flex-grow text-center">
                          <h3 className="text-2xl font-bold mb-4 text-primary min-h-[4rem] flex items-center justify-center">
                            <span data-dock-type="text" data-dock-bind={`sectionName.0.titleKey`}>{item[titleKey]}</span>
                          </h3>
                          <div className="text-accent font-bold mt-auto text-3xl mb-6">€{priceValue.toFixed(2)}</div>
                          <div className="flex flex-col gap-3">
                            <button onClick={() => addToCart({ id: item.id || index, title: item[titleKey], price: priceValue, image: item[imgKey] })} className="w-full py-4 bg-[var(--color-button-bg)] text-white rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg active:scale-95 text-lg uppercase tracking-wider">In winkelwagen</button>
                            
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
                {filteredItems.length === 0 && (
                  <div className="text-center py-20 text-slate-400 italic text-xl">Geen producten gevonden in deze categorie.</div>
                )}
              </div>
            </section>
          );
        }

        return (
          <section key={idx} id={sectionName} data-dock-section={sectionName} className={'py-24 px-6 ' + (idx % 2 === 1 ? 'bg-slate-50' : 'bg-white')}>
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col items-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary text-center mb-4 capitalize">
                  {sectionName.replace(/_/g, ' ')}
                </h2>
                <div className="h-1.5 w-24 bg-accent rounded-full"></div>
              </div>
              
              <div className="space-y-20">
                {items.map((item, index) => {
                   const titleKey = Object.keys(item).find(k => /naam|titel|onderwerp|header/i.test(k));
                   const textKeys = Object.keys(item).filter(k => k !== titleKey && !/foto|afbeelding|url|link|id/i.test(k));
                   const imgKey = Object.keys(item).find(k => /foto|afbeelding|url/i.test(k));
                   const isEven = index % 2 === 0;

                   return (
                     <div key={index} className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-20 items-center`}>
                       {imgKey && item[imgKey] && (
                         <div className="w-full md:w-1/2 aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl rotate-1 group hover:rotate-0 transition-transform duration-500 border-8 border-white">
                           <img src={getImageUrl(item[imgKey])} className="w-full h-full object-cover" data-dock-type="media" data-dock-bind={`sectionName.0.imgKey`} />
                         </div>
                       )}
                       <div className="flex-1 text-center md:text-left">
                         {titleKey && (
                           <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                               <h3 className="text-3xl font-serif font-bold text-primary leading-tight flex-1">
                                 <span data-dock-type="text" data-dock-bind={`sectionName.0.titleKey`}>{item[titleKey]}</span>
                               </h3>
                               
                           </div>
                         )}
                         {textKeys.map(tk => (
                           <div key={tk} className="text-xl leading-relaxed text-slate-600 mb-6 font-light">
                             <span data-dock-type="text" data-dock-bind={`sectionName.0.tk`}>{item[tk]}</span>
                           </div>
                         ))}
                         {(item.link || item.link_url) && (
                            <a href={"#"} data-dock-type="link" data-dock-bind="site_settings.0.site_name">
                                {item.link || "Lees meer"} <i className="fa-solid fa-arrow-right text-sm ml-1"></i>
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
      })}
    </div>
  );
};

export default Section;