import React, { useContext } from 'react';
import { DisplayConfigContext } from '../DisplayConfigContext';

const ProductSection = ({ sectionName, items, sectionStyle }) => {
  const displayConfig = useContext(DisplayConfigContext);
  const sectionConfig = displayConfig?.sections?.[sectionName] || { visible_fields: [], hidden_fields: [] };

  return (
    <section 
      id={sectionName} 
      data-dock-section={sectionName} 
      className="px-6 bg-slate-50 transition-all duration-300"
      style={{ 
        ...sectionStyle,
        paddingTop: `var(--section-padding-y, 6rem)`,
        paddingBottom: `var(--section-padding-y, 6rem)`
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-4xl font-serif font-bold text-primary capitalize">
            {sectionName.replace(/_/g, ' ')}
          </h2>
          <div className="flex-1 h-px bg-slate-200 ml-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, index) => {
            const allKeys = Object.keys(item).filter(k => 
                !['absoluteIndex', '_hidden', 'id', 'pk', 'uuid'].some(tf => k.toLowerCase().includes(tf))
            );
            const visibleFields = sectionConfig.visible_fields?.length > 0 
                ? sectionConfig.visible_fields.filter(k => allKeys.includes(k))
                : allKeys.filter(k => !/foto|afbeelding|url|image|img/i.test(k));
            const hiddenFields = sectionConfig.hidden_fields || [];
            const fieldsToRender = visibleFields.filter(f => !hiddenFields.includes(f));
            
            const imgKey = Object.keys(item).find(k => /foto|afbeelding|url|image|img/i.test(k));

            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-xl transition-all duration-300">
                {imgKey && item[imgKey] && (
                  <div className="aspect-square rounded-xl overflow-hidden mb-6 bg-slate-50">
                    <img 
                        src={item[imgKey].startsWith('http') ? item[imgKey] : `${import.meta.env.BASE_URL}images/${item[imgKey]}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        data-dock-type="media" 
                        data-dock-bind={`${sectionName}.${index}.${imgKey}`} 
                    />
                  </div>
                )}
                
                {fieldsToRender.map((fk, fIdx) => {
                    const isTitle = fIdx === 0;
                    const isPrice = fk.toLowerCase().includes('prijs') || fk.toLowerCase().includes('price');
                    const val = item[fk];
                    const displayText = typeof val === 'object' ? (val.text || val.label || val.title || JSON.stringify(val)) : val;
                    
                    return (
                        <div key={fk} className={`${isTitle ? 'text-lg font-bold text-primary mb-2' : isPrice ? 'text-accent font-black text-xl mt-auto' : 'text-slate-500 text-sm mb-4'}`}>
                            <span data-dock-type="text" data-dock-bind={`${sectionName}.${index}.${fk}`}>{displayText}</span>
                        </div>
                    );
                })}

                <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest mt-6 hover:bg-accent transition-colors">
                    Bestel Nu
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
