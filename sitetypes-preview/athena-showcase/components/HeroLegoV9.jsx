import React from 'react';

/**
 * Athena V9.2 compliant Hero Component
 * Style: Modern Midnight Tech
 */
export default function HeroLegoV9({ data = {}, sectionName = 'hero' }) {
  const { 
    tekst_titel = 'Athena V9.2 Hero',
    tekst_subtitel = 'De nieuwe standaard voor modulaire websites.',
    tekst_knop = 'Ontdek meer',
    link_knop = '#',
    afbeelding_bg = '/hero-bg.webp'
  } = data;

  return (
    <section 
      className="relative min-h-[85vh] flex items-center px-6 overflow-hidden bg-midnight"
      data-dock-section={sectionName}
    >
      {/* Background Image with binding */}
      <img 
        src={afbeelding_bg} 
        alt="Hero Background" 
        className="absolute inset-0 w-full h-full object-cover -z-20 opacity-60"
        data-dock-type="media"
        data-dock-bind={JSON.stringify({ file: sectionName, index: 0, key: 'afbeelding_bg' })}
      />
      
      {/* Transparante Midnight Overlays */}
      <div className="absolute inset-0 bg-[#020024]/40 -z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020024]/60 via-transparent to-transparent -z-10" />
      
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="max-w-4xl">
          <h1 
            className="text-4xl md:text-7xl font-extrabold text-white mb-8 leading-[1.1] uppercase tracking-tighter"
            data-dock-bind={JSON.stringify({ file: sectionName, index: 0, key: 'tekst_titel' })}
          >
            {tekst_titel}
          </h1>
          <p 
            className="text-lg md:text-xl text-slate-100 mb-12 leading-relaxed font-bold max-w-2xl bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/5"
            data-dock-bind={JSON.stringify({ file: sectionName, index: 0, key: 'tekst_subtitel' })}
          >
            {tekst_subtitel}
          </p>
          <div className="flex">
            <a
              href={link_knop}
              className="btn-sans inline-flex items-center justify-center px-10 py-4 text-xl font-extrabold text-white bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-md shadow-xl transition-all hover:scale-105 active:scale-95"
              data-dock-type="link"
              data-dock-bind={JSON.stringify({ file: sectionName, index: 0, key: 'tekst_knop' })}
            >
              {tekst_knop}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
