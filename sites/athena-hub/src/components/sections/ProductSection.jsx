import React, { useContext } from 'react';
import { DisplayConfigContext } from '../DisplayConfigContext';

const ProductSection = ({ sectionName, items, sectionStyle, setSelectedPackage, selectedPackage }) => {
  const displayConfig = useContext(DisplayConfigContext);
  const sectionConfig = displayConfig?.sections?.[sectionName] || { visible_fields: [], hidden_fields: [] };
  const sectionSettings = (displayConfig?.section_settings?.[sectionName]) || {};
  
  // High-end titles and subtitles
  const displayTitle = sectionSettings.title || "Diensten";
  const displaySubtitle = sectionSettings.subtitle || "Heldere pakketten voor een eerlijke prijs.";

  const handleSelect = (item) => {
    setSelectedPackage(item.titel);
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id={sectionName} 
      data-dock-section={sectionName} 
      className="px-6 bg-slate-50 transition-all duration-300 relative overflow-hidden"
      style={{ 
        ...sectionStyle,
        paddingTop: `var(--section-padding-y, 8rem)`,
        paddingBottom: `var(--section-padding-y, 8rem)`
      }}
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Centered Modern Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6 capitalize leading-tight">
              {displayTitle}
            </h2>
            <div className="h-1.5 w-32 bg-accent rounded-full mb-8 mx-auto"></div>
            <p className="text-xl text-slate-600 font-light">
              {displaySubtitle}
            </p>
          </div>
        </div>

        {/* Pricing/Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => {
            const isRecommended = item.recommended === true || String(item.recommended).toLowerCase() === 'true';
            const isSelected = selectedPackage === item.titel;
            
            // Features parsing
            const features = item.kenmerken ? item.kenmerken.split(',').map(f => f.trim()) : [];

            return (
              <div 
                key={index} 
                className={`flex flex-col relative bg-white rounded-[2.5rem] p-10 transition-all duration-500 hover:-translate-y-3 group ${
                  isSelected
                  ? 'shadow-[0_20px_60px_-15px_rgba(245,158,11,0.3)] border-4 border-accent ring-8 ring-accent/5 scale-105 z-30'
                  : (isRecommended 
                    ? 'shadow-[0_20px_50px_-15px_rgba(15,23,42,0.15)] border-2 border-primary ring-4 ring-primary/5 scale-105 z-20' 
                    : 'shadow-xl border border-slate-100 hover:shadow-2xl z-10')
                }`}
              >
                {(isSelected || isRecommended) && (
                  <div className={`absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-lg ${isSelected ? 'bg-accent text-white' : 'bg-primary text-white'}`}>
                    {isSelected ? 'Gekozen Pakket' : 'Meest Gekozen'}
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-primary mb-3">
                     <span data-dock-type="text" data-dock-bind={`${sectionName}.${index}.titel`}>{item.titel}</span>
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed min-h-[3rem]">
                     <span data-dock-type="text" data-dock-bind={`${sectionName}.${index}.beschrijving`}>{item.beschrijving}</span>
                  </p>
                </div>

                <div className="mb-10 flex items-baseline gap-1">
                  <span className="text-slate-400 text-xl font-light">€</span>
                  <span className="text-4xl font-serif font-black text-primary" data-dock-type="text" data-dock-bind={`${sectionName}.${index}.prijs`}>
                    {item.prijs}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">/ eenmalig</span>
                </div>

                <div className="flex-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6 border-b border-slate-50 pb-4">
                    Inbegrepen features
                  </h4>
                  <ul className="space-y-4 mb-10">
                    {features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-4">
                        <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-accent/10 text-accent' : (isRecommended ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400')}`}>
                          <i className="fa-solid fa-check text-[10px]"></i>
                        </div>
                        <span className="text-sm text-slate-600 font-medium leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => handleSelect(item)}
                  className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
                    isSelected
                    ? 'bg-accent text-white shadow-xl'
                    : (isRecommended 
                      ? 'bg-primary text-white shadow-xl hover:bg-slate-800' 
                      : 'bg-slate-50 text-primary border-2 border-slate-100 hover:bg-primary hover:text-white hover:border-primary')
                  }`}
                >
                  {isSelected ? 'Onderaan aanvragen' : `Kies ${item.titel}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info/Guarantees */}
        <div className="mt-20 pt-16 border-t border-slate-100 flex flex-wrap justify-center gap-x-12 gap-y-6">
           <div className="flex items-center gap-3 text-slate-400">
              <i className="fa-solid fa-shield-halved text-accent"></i>
              <span className="text-xs font-bold uppercase tracking-widest">Snel Online (24-48u)</span>
           </div>
           <div className="flex items-center gap-3 text-slate-400">
              <i className="fa-solid fa-chart-line text-accent"></i>
              <span className="text-xs font-bold uppercase tracking-widest">Inbegrepen SEO Setup</span>
           </div>
           <div className="flex items-center gap-3 text-slate-400">
              <i className="fa-solid fa-headset text-accent"></i>
              <span className="text-xs font-bold uppercase tracking-widest">NL-talige support</span>
           </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
