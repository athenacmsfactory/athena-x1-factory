import React from 'react';
import EditableImage from '../EditableImage';

export default function Hero({ data = {}, settings = {} }) {
  const block = data;

  return (
    <section className="relative py-20 lg:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 
            className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6"
            data-dock-type="text"
            data-dock-bind="site_settings.0.titel"
          >
            {settings.titel || block.titel}
          </h1>
          <p 
            className="text-xl text-gray-600 mb-10 leading-relaxed"
            data-dock-type="text"
            data-dock-bind="site_settings.0.subtitel"
          >
            {settings.subtitel || block.tekst}
          </p>
          <a 
            href="#" 
            className="inline-block bg-amber-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all hover:-translate-y-1"
          >
            Bestel Nu
          </a>
        </div>
        <div className="relative">
          <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-2xl">
            <EditableImage 
              src={`${import.meta.env.BASE_URL}images/1.jpeg`} 
              alt="Bakkerij de Graankorrel" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-amber-400 rounded-2xl -z-10 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
