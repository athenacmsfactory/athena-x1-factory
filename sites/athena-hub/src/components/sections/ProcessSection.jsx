import React, { useContext } from 'react';
import { DisplayConfigContext } from '../DisplayConfigContext';

const ProcessSection = ({ sectionName, items, sectionStyle }) => {
  const displayConfig = useContext(DisplayConfigContext);
  const sectionConfig = displayConfig?.sections?.[sectionName] || { visible_fields: [], hidden_fields: [] };

  return (
    <section 
      id={sectionName} 
      data-dock-section={sectionName} 
      className="px-6 bg-white transition-all duration-300"
      style={{ 
        ...sectionStyle,
        paddingTop: `var(--section-padding-y, 6rem)`,
        paddingBottom: `var(--section-padding-y, 6rem)`
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 capitalize">
            {sectionName.replace(/_/g, ' ')}
          </h2>
          <div className="h-1.5 w-24 bg-accent rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
          
          {items.map((item, index) => {
            const allKeys = Object.keys(item).filter(k => 
                !['absoluteIndex', '_hidden', 'id', 'pk', 'uuid'].some(tf => k.toLowerCase().includes(tf))
            );
            const visibleFields = sectionConfig.visible_fields?.length > 0 
                ? sectionConfig.visible_fields.filter(k => allKeys.includes(k))
                : allKeys;
            const hiddenFields = sectionConfig.hidden_fields || [];
            const fieldsToRender = visibleFields.filter(f => !hiddenFields.includes(f));

            return (
              <div key={index} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-black mb-8 shadow-2xl transition-transform group-hover:scale-110 group-hover:bg-accent duration-300 border-8 border-white">
                  {index + 1}
                </div>
                
                {fieldsToRender.map((fk, fIdx) => {
                    const isTitle = fIdx === 0;
                    const val = item[fk];
                    const displayText = typeof val === 'object' ? (val.text || val.label || val.title || JSON.stringify(val)) : val;

                    return (
                        <div key={fk} className={isTitle ? "text-2xl font-bold text-primary mb-4" : "text-slate-500 leading-relaxed"}>
                            <span data-dock-type="text" data-dock-bind={`${sectionName}.${index}.${fk}`}>{displayText}</span>
                        </div>
                    );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
