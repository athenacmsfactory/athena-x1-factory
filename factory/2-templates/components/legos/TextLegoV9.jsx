import React from 'react';

/**
 * Athena V9.2 compliant Text/About Component
 * Style: Modern Midnight Tech
 */
export default function TextLegoV9({ data = {}, bind = {} }) {
  const {
    tekst_sectie_titel = 'Over Ons',
    tekst_inhoud = 'Inhoud komt hier...'
  } = data;

  return (
    <section 
      className="py-20 px-6 bg-midnight"
      data-dock-type="TextLegoV9"
    >
      <div className="max-w-5xl mx-auto text-center">
        <h2 
          className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tighter"
          data-dock-bind="tekst_sectie_titel"
        >
          {tekst_sectie_titel}
        </h2>
        <p 
          className="text-lg md:text-xl text-slate-400 leading-relaxed font-mono"
          data-dock-bind="tekst_inhoud"
        >
          {tekst_inhoud}
        </p>
      </div>
    </section>
  );
}
