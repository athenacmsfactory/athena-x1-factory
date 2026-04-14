import React, { useState } from 'react';

/**
 * Athena V9.2 compliant Contact Form Component
 * Style: Modern Midnight Tech (Transparent fields)
 */
export default function ContactLegoV9({ data = {}, bind = {} }) {
  const [status, setStatus] = useState('idle');
  
  const {
    tekst_sectie_titel = 'Neem Contact Op',
    tekst_subtitel = 'Heeft u een vraag of wilt u een offerte? Laat uw gegevens achter.'
  } = data;

  return (
    <section 
      className="py-32 px-6 bg-midnight border-t border-slate-900/50 relative overflow-hidden"
      data-dock-type="ContactLegoV9"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tighter"
            data-dock-bind="tekst_sectie_titel"
          >
            {tekst_sectie_titel}
          </h2>
          <p 
            className="text-slate-400 font-mono text-sm"
            data-dock-bind="tekst_subtitel"
          >
            {tekst_subtitel}
          </p>
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); setStatus('success'); }} 
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Uw Naam"
              className="w-full bg-transparent border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
            <input 
              type="email" 
              placeholder="Uw E-mailadres"
              className="w-full bg-transparent border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
          </div>
          <textarea 
            placeholder="Uw Bericht"
            rows={5}
            className="w-full bg-transparent border border-slate-800 rounded-lg px-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none font-mono"
          />
          <button 
            type="submit"
            className="btn-sans w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-lg transition-colors uppercase tracking-widest text-base shadow-lg"
          >
            {status === 'success' ? 'Bericht Verzonden!' : 'Verzenden'}
          </button>
        </form>
      </div>
    </section>
  );
}
