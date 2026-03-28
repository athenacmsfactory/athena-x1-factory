import React from 'react';

function GenericSection({ data, sectionName = 'generic' }) {
  const content = data?.[0] || {
    titel: 'Sectie Titel',
    tekst: 'Voeg hier jouw inhoud toe. Dit is een generieke sectie die je volledig kan aanpassen.',
    cta: 'Meer Info'
  };

  return (
    <section id={sectionName} className="py-24 px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-blue-600 font-black text-sm uppercase tracking-widest mb-4 block">Sectie</span>
        <h2 
          className="text-5xl font-black text-slate-900 tracking-tighter mb-8"
          data-dock-bind={`${sectionName}.0.titel`}
        >
          {content.titel}
        </h2>
        <p 
          className="text-xl text-slate-500 leading-relaxed mb-12 max-w-2xl mx-auto"
          data-dock-bind={`${sectionName}.0.tekst`}
        >
          {content.tekst}
        </p>
        {content.cta && (
          <button 
            className="bg-slate-900 text-white font-black px-10 py-4 rounded-2xl hover:bg-black transition-all"
            data-dock-bind={`${sectionName}.0.cta`}
          >
            {content.cta}
          </button>
        )}
      </div>
    </section>
  );
}

export default GenericSection;
