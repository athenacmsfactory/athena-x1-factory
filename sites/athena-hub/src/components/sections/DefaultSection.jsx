import React, { useContext } from 'react';
import { DisplayConfigContext } from '../DisplayConfigContext';

const DefaultSection = ({ sectionName, items, sectionStyle, currentLayout, iconMap }) => {
  const displayConfig = useContext(DisplayConfigContext);
  
  // Haal configuratie op voor deze specifieke sectie
  const sectionConfig = displayConfig?.sections?.[sectionName] || { visible_fields: [], hidden_fields: [], inline_fields: [] };
  
  return (
    <section 
      id={sectionName} 
      data-dock-section={sectionName} 
      className="px-6 bg-[var(--color-background)] transition-all duration-300" 
      style={{ 
        ...sectionStyle,
        paddingTop: `var(--section-padding-y, 6rem)`,
        paddingBottom: `var(--section-padding-y, 6rem)`
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 capitalize">
            {sectionName.replace(/_/g, ' ')}
          </h2>
          <div className="h-1.5 w-24 bg-accent rounded-full"></div>
        </div>

        <div className={currentLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12' : 'space-y-20'}>
          {items.map((item, index) => {
            // 🔱 v8.5 Smart Field Management
            // Bepaal welke velden we moeten tonen en in welke volgorde
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
                              <a href={`mailto:${displayText}`} className="hover:text-accent transition-colors underline decoration-accent/30 underline-offset-4" data-dock-type="text" data-dock-bind={`${sectionName}.${index}.${fk}`}>
                                {displayText}
                              </a>
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
                              <a href={`mailto:${displayText}`} className="hover:text-accent transition-colors underline decoration-accent/30 underline-offset-8" data-dock-type="text" data-dock-bind={`${sectionName}.${index}.${fk}`}>
                                {displayText}
                              </a>
                            ) : (
                              <span data-dock-type="text" data-dock-bind={`${sectionName}.${index}.${fk}`}>{displayText}</span>
                            )}
                        </div>
                      );
                  })}
                  {(item.link || item.link_url) && (
                    <a href={item.link_url || "#"} className="text-accent font-bold hover:underline">
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
};

export default DefaultSection;
