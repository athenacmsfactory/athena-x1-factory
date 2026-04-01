import React, { useContext, useState, useEffect } from 'react';
import { DisplayConfigContext } from '../DisplayConfigContext';

const DefaultSection = ({ sectionName, items, sectionStyle, currentLayout, iconMap, selectedPackage }) => {
  const displayConfig = useContext(DisplayConfigContext);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  // Update message when selectedPackage changes
  useEffect(() => {
    if (selectedPackage) {
      setFormData(prev => ({
        ...prev,
        message: `Beste,\n\nIk heb interesse in het ${selectedPackage} pakket. Graag ontvang ik meer informatie over de volgende stappen.\n\nMet vriendelijke groet,`
      }));
    }
  }, [selectedPackage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Intake Aanvraag: ${selectedPackage}`);
    const body = encodeURIComponent(formData.message + `\n\nAfzender: ${formData.name} (${formData.email})`);
    window.location.href = `mailto:athena.cms.factory@gmail.be?subject=${subject}&body=${body}`;
  };
  
  const sectionConfig = displayConfig?.sections?.[sectionName] || { visible_fields: [], hidden_fields: [], inline_fields: [] };
  const isLeadMode = sectionName === 'contact' && selectedPackage;

  return (
    <section 
      id={sectionName} 
      data-dock-section={sectionName} 
      className="px-6 bg-[var(--color-background)] transition-all duration-300 relative overflow-hidden" 
      style={{ 
        ...sectionStyle,
        paddingTop: `var(--section-padding-y, 6rem)`,
        paddingBottom: `var(--section-padding-y, 6rem)`
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* SECTION HEADER */}
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 capitalize">
            {sectionName.replace(/_/g, ' ')}
          </h2>
          <div className="h-1.5 w-24 bg-accent rounded-full"></div>
        </div>

        {isLeadMode ? (
          /* ==========================================================================
             LEAD MODE LAYOUT (VERTICAL: BANNER THEN SLIM FORM)
             ========================================================================== */
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-10 animate-fade-in-up">
            
            {/* SLIM BANNER (v1 REBORN) */}
            <div className="w-full bg-slate-50 border-2 border-accent/20 rounded-[2rem] p-8 text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <span className="inline-block px-4 py-1.5 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-lg shadow-accent/20">
                  Geselecteerde Keuze
                </span>
                <h3 className="text-2xl md:text-3xl font-serif font-black text-primary mb-4 leading-tight">
                  Interesse in het <span className="text-accent underline decoration-accent/30 underline-offset-8 italic">{selectedPackage}</span> pakket?
                </h3>
                <p className="text-base text-slate-500 font-light max-w-2xl mx-auto">
                  Laat hieronder uw gegevens achter en ik bereid de intake direct voor.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-slate-400 opacity-60">
                   <div className="flex items-center gap-2">
                      <i className="fa-solid fa-bolt text-accent"></i>
                      <span className="text-[10px] font-black uppercase tracking-widest">Snelle Reactie</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <i className="fa-solid fa-lock text-accent text-[8px]"></i>
                      <span className="text-[10px] font-black uppercase tracking-widest">Privacy Gegarandeerd</span>
                   </div>
                </div>
              </div>
            </div>

            {/* SLIM INTAKE FORM */}
            <div className="w-full">
              <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Naam</label>
                    <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-slate-50 border border-slate-100 focus:border-accent/30 focus:bg-white rounded-xl px-5 py-4 outline-none transition-all text-primary font-medium text-base"
                        placeholder="Naam"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email</label>
                    <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="bg-slate-50 border border-slate-100 focus:border-accent/30 focus:bg-white rounded-xl px-5 py-4 outline-none transition-all text-primary font-medium text-base"
                        placeholder="Email"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Bericht</label>
                  <textarea 
                      rows="12"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="bg-slate-50 border border-slate-100 focus:border-accent/30 focus:bg-white rounded-xl px-5 py-4 outline-none transition-all text-primary font-medium text-base resize-none"
                  ></textarea>
                </div>
                <button 
                    type="submit"
                    className="w-full bg-primary text-white py-5 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] shadow-lg hover:bg-slate-800 hover:scale-[1.01] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
                >
                    Verstuur Aanvraag <i className="fa-solid fa-paper-plane text-[10px]"></i>
                </button>
              </form>
            </div>

            {/* LEADS FOOTER (Keep Email Visible) */}
            <div className="pt-8 border-t border-slate-100 w-full flex justify-center">
              {items[0]?.email && (
                <a href={`mailto:${items[0].email}`} className="text-xl font-medium text-slate-400 hover:text-accent transition-colors underline decoration-accent/30 underline-offset-8">
                  {items[0].email}
                </a>
              )}
            </div>
          </div>
        ) : (
          /* ==========================================================================
             STANDARD MODE LAYOUT (IMAGE + TEXT)
             ========================================================================== */
          <div className={currentLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12' : 'space-y-20'}>
            {items.map((item, index) => {
              const allKeys = Object.keys(item).filter(k => 
                  !['absoluteIndex', '_hidden', 'id', 'pk', 'uuid'].some(tf => k.toLowerCase().includes(tf))
              );
              const visibleFields = sectionConfig.visible_fields?.length > 0 
                  ? sectionConfig.visible_fields.filter(k => allKeys.includes(k))
                  : allKeys.filter(k => !/foto|afbeelding|url|image|img|icon/i.test(k));
              const hiddenFields = sectionConfig.hidden_fields || [];
              const fieldsToRender = visibleFields.filter(f => !hiddenFields.includes(f));
              const imgKey = Object.keys(item).find(k => /foto|afbeelding|url|image|img/i.test(k));
              const isEven = index % 2 === 0;

              if (currentLayout === 'grid') {
                const iconClass = item.icon ? (iconMap[item.icon.toLowerCase()] || `fa-${item.icon.toLowerCase()}`) : null;
                return (
                  <div key={index} className="flex flex-col items-center text-center bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300">
                    {iconClass && (
                      <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8 text-accent text-4xl shadow-inner">
                        <i className={`fa-solid ${iconClass}`}></i>
                      </div>
                    )}
                    {fieldsToRender.map((fk, fIdx) => {
                        const isFirst = fIdx === 0;
                        const val = item[fk];
                        const displayText = typeof val === 'object' ? (val.text || val.label || val.title || JSON.stringify(val)) : val;
                        const isEmail = typeof displayText === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(displayText);
                        return (
                          <div key={fk} className={`${isFirst ? 'text-2xl font-bold text-primary mb-4 leading-tight' : 'text-slate-600 text-lg leading-relaxed mb-2'}`}>
                              {isEmail ? (
                                <a href={`mailto:${displayText}`} className="hover:text-accent transition-colors underline decoration-accent/30 underline-offset-4" data-dock-type="text" data-dock-bind={`${sectionName}.${index}.${fk}`}>{displayText}</a>
                              ) : (
                                <span data-dock-type="text" data-dock-bind={`${sectionName}.${index}.${fk}`}>{displayText}</span>
                              )}
                          </div>
                        );
                    })}
                  </div>
                );
              }

              return (
                <div key={index} className={`flex flex-col items-center text-center ${currentLayout === 'list' ? '' : (isEven ? 'md:flex-row' : 'md:flex-row-reverse')} gap-12 md:gap-20`}>
                  {imgKey && item[imgKey] && (
                    <div className="w-full md:w-1/2 aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl rotate-1 group hover:rotate-0 transition-transform duration-500 border-8 border-white bg-slate-50">
                      <img src={item[imgKey].startsWith('http') ? item[imgKey] : `${import.meta.env.BASE_URL}images/${item[imgKey]}`} className="w-full h-full object-cover" data-dock-type="media" data-dock-bind={`${sectionName}.${index}.${imgKey}`} />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col items-center">
                    {fieldsToRender.map((fk, fIdx) => {
                        const isFirst = fIdx === 0;
                        const val = item[fk];
                        const displayText = typeof val === 'object' ? (val.text || val.label || val.title || JSON.stringify(val)) : val;
                        const isEmail = typeof displayText === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(displayText);
                        return (
                          <div key={fk} className={`${isFirst ? 'text-3xl font-serif font-bold text-primary leading-tight mb-8' : 'text-xl leading-relaxed text-slate-600 mb-6 font-light'}`}>
                              {isEmail ? (
                                <a href={`mailto:${displayText}`} className="hover:text-accent transition-colors underline decoration-accent/30 underline-offset-8" data-dock-type="text" data-dock-bind={`${sectionName}.${index}.${fk}`}>{displayText}</a>
                              ) : (
                                  <span data-dock-type="text" data-dock-bind={`${sectionName}.${index}.${fk}`}>{displayText}</span>
                              )}
                          </div>
                        );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default DefaultSection;
