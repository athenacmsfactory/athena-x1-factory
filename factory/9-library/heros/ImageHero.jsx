import React from 'react';

function ImageHero({ data, sectionName = 'hero' }) {
  const content = data?.[0] || {
    titel: 'Bouw de Toekomst met Lego.',
    tekst: 'De meest modulaire workflow ooit voor professionele website ontwikkeling.',
    image: '/api/assets/lego_factory_hero.png'
  };

  return (
    <section id={sectionName} className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative z-10">
          <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">v9.0 Tabula Rasa</div>
          <h1 
            className="text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8" 
            data-dock-bind={`${sectionName}.0.titel`}
          >
            {content.titel}
          </h1>
          <p 
            className="text-xl text-slate-500 leading-relaxed mb-10 max-w-lg" 
            data-dock-bind={`${sectionName}.0.tekst`}
          >
            {content.tekst}
          </p>
          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">Begin Nu</button>
            <button className="bg-white border-2 border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">Bekijk Video</button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 bg-blue-600/10 blur-[100px] rounded-full"></div>
          <div className="relative bg-slate-100 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] lg:aspect-square">
            <img 
              src={content.image} 
              alt="Hero" 
              className="w-full h-full object-cover" 
              data-dock-bind={`${sectionName}.0.image`}
              data-dock-type="media"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ImageHero;
