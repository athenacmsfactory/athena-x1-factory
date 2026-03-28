import React from 'react';

/**
 * BentoGrid (v9.0 Clean - Dehydrated)
 * High-aesthetic grid for features or gallery items using CSS Grid spans and standard HTML tags.
 */
export default function BentoGrid({ data, sectionName, style = {} }) {
  const content = data || {};
  const items = Array.isArray(content.items) ? content.items : [];

  const getBentoSpan = (index) => {
    if (index === 0) return 'md:col-span-2 md:row-span-2 h-full min-h-[400px]';
    if (index === 1) return 'md:col-span-2 h-full min-h-[250px]';
    if (index === 2) return 'md:col-span-1 h-full min-h-[250px]';
    if (index === 3) return 'md:col-span-1 h-full min-h-[250px]';
    return 'md:col-span-1 h-full min-h-[250px]';
  };

  return (
    <section 
      id={sectionName} 
      data-dock-section={sectionName} 
      className="py-24 px-6 bg-slate-50 dark:bg-slate-900 overflow-hidden"
      style={style}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="h-1.5 w-24 bg-accent rounded-full mb-6"></div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white capitalize tracking-tighter mb-4">
            <span data-dock-bind={`${sectionName}.0.titel`} data-dock-type="heading">{content.titel || sectionName.replace(/_/g, ' ')}</span>
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl font-medium">
            <span data-dock-bind={`${sectionName}.0.tagline`} data-dock-type="paragraph">{content.tagline || "Discover our range of premium solutions designed to elevate your business."}</span>
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-min">
          {items.map((item, index) => {
            const spanClass = getBentoSpan(index);
            const isLarge = index === 0;
            const itemImg = item.afbeelding || item.image;
            const itemTitle = item.titel || item.title || item.name;
            const itemText = item.beschrijving || item.tekst || item.description || item.tagline;

            return (
              <div 
                key={index} 
                className={`${spanClass} group relative rounded-[2.5rem] overflow-hidden border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-930 shadow-2xl shadow-blue-500/5 transition-all duration-500 hover:scale-[1.01] hover:shadow-accent/5`}
              >
                {/* Media Layer */}
                <div className="absolute inset-0 z-0">
                  {itemImg ? (
                    <img 
                      src={itemImg} 
                      data-dock-bind={`${sectionName}.${index}.afbeelding`}
                      data-dock-type="media"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-40 dark:opacity-30"
                      alt={itemTitle}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-900 opacity-20"></div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-white/80 dark:via-slate-900/80 to-transparent"></div>
                </div>

                {/* Content Layer */}
                <div className={`relative z-10 p-8 md:p-10 flex flex-col justify-end h-full`}>
                  {item.icon && (
                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent text-2xl mb-6 shadow-inner border border-accent/20">
                      <i className={`fa-solid fa-${item.icon}`}></i>
                    </div>
                  )}
                  
                  <h3 className={`${isLarge ? 'text-3xl md:text-5xl' : 'text-2xl md:text-3xl'} font-black text-slate-900 dark:text-white mb-4 tracking-tighter leading-none`}>
                    <span data-dock-bind={`${sectionName}.${index}.titel`} data-dock-type="text">{itemTitle}</span>
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-md">
                   <span data-dock-bind={`${sectionName}.${index}.beschrijving`} data-dock-type="text">{itemText}</span>
                  </p>

                  {(item.link || item.link_url) && (
                    <div className="mt-8 flex items-center gap-3">
                      <button 
                        data-dock-bind={`${sectionName}.${index}.link_url`}
                        data-dock-type="link"
                        className="text-primary dark:text-accent font-black uppercase tracking-widest text-xs py-3 px-6 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-primary hover:text-white dark:hover:bg-accent dark:hover:text-slate-900 transition-all border border-black/5"
                        onClick={() => {
                          window.open(item.link_url || "#", '_blank');
                        }}
                      >
                        {item.link || "Explore"}
                      </button>
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
}
