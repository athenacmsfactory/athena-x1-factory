import React from 'react';

const Hero = ({ data = {} }) => {
  const settings = data; // In de modulaire loader krijgt de Hero de site_settings als data

  return (
    <header className="relative h-[80vh] flex items-center justify-center text-center overflow-hidden">
      {/* Achtergrondafbeelding en overlay */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ background: "radial-gradient(circle, #1a1a1a 0%, #000000 100%)" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Navigatie (Logo & Button) */}
      <nav className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-20">
        <h1 
          className="text-2xl text-gold uppercase tracking-widest font-serif"
          data-dock-type="text" 
          data-dock-bind="site_settings.0.bedrijfsnaam"
        >
          {settings.bedrijfsnaam}
        </h1>
        <a 
          href={settings.boekings_url || "#"} 
          className="px-6 py-2 border border-gold text-gold hover:bg-gold hover:text-black transition duration-300 uppercase text-sm font-sans tracking-wider"
          data-dock-type="link" 
          data-dock-bind="site_settings.0.boekings_url"
        >
          Afspraak Maken
        </a>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 p-4 max-w-4xl">
        <h2 
          className="text-7xl md:text-8xl lg:text-9xl font-serif text-white mb-6 leading-tight"
          data-dock-type="text" 
          data-dock-bind="site_settings.0.titel"
        >
          {settings.titel || settings.bedrijfsnaam}
        </h2>
        <p 
          className="text-xl md:text-2xl text-gold mb-10 tracking-widest uppercase"
          data-dock-type="text" 
          data-dock-bind="site_settings.0.openingstijden"
        >
          {settings.openingstijden}
        </p>
        
        <a 
          href={settings.boekings_url || "#"} 
          className="inline-block px-10 py-4 bg-gold text-black text-lg uppercase font-bold tracking-wider hover:bg-white transition duration-300 shadow-xl"
          data-dock-type="text" 
          data-dock-bind="site_settings.0.boek_knop_tekst"
        >
          {settings.boek_knop_tekst || "Boek Uw Luxe Ervaring"}
        </a>
      </div>
    </header>
  );
};

export default Hero;
