import React from 'react';

const ServiceCard = ({ item, index }) => {
  const isPopular = item.populair === 'Ja';
  
  return (
    <div className={`p-8 bg-[#111] border border-white/5 backdrop-blur-sm transition duration-500 hover:bg-[#1a1a1a] relative
        ${isPopular ? 'shadow-2xl shadow-[#d4af37]/30 border-[#d4af37]/30' : ''}
    `}>
      {isPopular && (
        <span className="absolute top-0 right-0 bg-[#d4af37] text-black px-3 py-1 text-[10px] uppercase font-bold tracking-wider -mt-3 mr-4">
          Populair
        </span>
      )}
      
      <h3 
        className="text-2xl font-serif text-[#d4af37] mb-3"
        data-dock-type="text"
        data-dock-bind={`diensten.${index}.naam`}
      >
        {item.naam}
      </h3>
      <p 
        className="text-sm text-gray-400 mb-6 min-h-[3rem]"
        data-dock-type="text"
        data-dock-bind={`diensten.${index}.beschrijving`}
      >
        {item.beschrijving}
      </p>
      
      <div className="flex justify-between items-end border-t border-white/10 pt-4">
        <div>
          <span className="block text-3xl font-serif text-white leading-none">
            €{parseFloat(item.prijs || 0).toFixed(2).replace('.', ',')}
          </span>
          <span className="text-[10px] text-gray-500 mt-1 uppercase">Vanaf Prijs</span>
        </div>
        
        <div className="text-right">
          <span className="block text-sm text-[#d4af37] tracking-wider font-bold">
            {item.duur_minuten} min
          </span>
          <a href="#" className="text-[10px] text-gray-400 hover:text-[#d4af37] transition duration-200 mt-1 underline uppercase font-bold">
            Boek Nu
          </a>
        </div>
      </div>
    </div>
  );
};


const Diensten = ({ data = [] }) => {
  const diensten = Array.isArray(data) ? data : [];

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <h2 className="text-center text-5xl md:text-6xl font-serif text-white mb-4">
          Onze Luxe Diensten
        </h2>
        <p className="text-center text-lg text-[#d4af37] mb-16 uppercase tracking-[0.3em] font-light">
          Vakmanschap en Precisie
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {diensten.map((dienst, idx) => (
            <ServiceCard 
              key={idx} 
              item={dienst} 
              index={idx}
            />
          ))}
        </div>
        
        <div className="text-center mt-16">
            <a 
              href="#" 
              className="inline-block px-8 py-3 border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition duration-300 uppercase text-xs font-bold tracking-widest"
            >
              Bekijk Alle Diensten
            </a>
        </div>
      </div>
    </section>
  );
};

export default Diensten;
