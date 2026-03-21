import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline'; 

const Hero = ({ id, data, settings }) => {
  const handleScroll = (e) => {
    e.preventDefault();
    const targetElement = document.getElementById('cursussen');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getPlaceholderImage = (prompt) => {
    const keywords = (prompt || 'academy education').split(', ')[0].replace(/ /g, '-').toLowerCase();
    return `https://picsum.photos/seed/${keywords}/1920/1080`; 
  };

  const backgroundStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${getPlaceholderImage('high tech academy learning')})`,
  };

  return (
    <header 
      id={id}
      className="relative h-[400px] lg:h-[500px] flex items-center justify-center text-white bg-cover bg-center transition-all duration-500 overflow-hidden"
      style={backgroundStyle}
    >
      <div className="text-center p-6 max-w-3xl z-10">
        <h1 
          className="text-3xl font-extrabold tracking-tight mb-4 sm:text-4xl lg:text-5xl uppercase drop-shadow-lg"
          data-dock-type="text"
          data-dock-bind="site_settings.0.titel"
        >
          {data?.titel || "Verrijk je kennis"}
        </h1>
        <p 
          className="text-base font-medium italic mb-8 opacity-95 sm:text-lg max-w-xl mx-auto drop-shadow-md"
          data-dock-type="text"
          data-dock-bind="site_settings.0.subtitel"
        >
          {data?.subtitel || "Cutting-edge technologie en onderwijs"}
        </p>
        
        <button
          onClick={handleScroll}
          className="group px-8 py-3 mt-4 text-lg font-semibold rounded-full bg-primary hover:bg-primary-dark transition-all duration-300 shadow-xl flex items-center justify-center mx-auto"
        >
          Ontdek onze Cursussen
          <ChevronDownIcon className="w-5 h-5 ml-2 transition-transform group-hover:translate-y-1" />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/100 to-white/0"></div>
    </header>
  );
};

export default Hero;
