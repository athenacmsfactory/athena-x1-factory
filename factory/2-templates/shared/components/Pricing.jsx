import React from 'react';
import EditableText from './EditableText';
import EditableLink from './EditableLink';

/**
 * 🏷️ Pricing Component
 * @description Modern tiered pricing table.
 */
const Pricing = ({ data, sectionName, layout = 'grid' }) => {
  return (
    <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.map((plan, idx) => (
            <div 
              key={idx} 
              className={`p-8 rounded-3xl border-2 transition-all hover:scale-105 ${plan.is_featured ? 'border-primary bg-slate-50 dark:bg-slate-800 shadow-2xl scale-105 z-10' : 'border-slate-100 dark:border-slate-800'}`}
            >
              {plan.is_featured && (
                <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6 inline-block">Populairst</span>
              )}
              <h3 className="text-xl font-black uppercase tracking-tight mb-2 dark:text-white">
                <EditableText value={plan.naam} cmsBind={{ file: sectionName, index: idx, key: 'naam' }} />
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black dark:text-white">€{plan.prijs}</span>
                <span className="text-slate-400 text-sm">/maand</span>
              </div>
              
              <ul className="space-y-4 mb-10">
                {(plan.features || "").split(',').map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <i className="fa-solid fa-check text-emerald-500"></i>
                    {f.trim()}
                  </li>
                ))}
              </ul>

              <EditableLink 
                label={plan.button_label || "Kies Plan"} 
                url={plan.button_url || "#"} 
                cmsBind={{ file: sectionName, index: idx, key: 'button_label' }}
                className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all text-center block ${plan.is_featured ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200'}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
