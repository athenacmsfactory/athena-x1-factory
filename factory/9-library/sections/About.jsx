import React from 'react';
import { useLego, bindProps } from '../lib/LegoUtils';

function AboutSection({ data, sectionName = 'about' }) {
  const item = data?.[0] || {};
  
  const title = useLego(item, 'koptekst', 'Over Ons');
  const body = useLego(item, 'inhoud', 'Vertel hier je verhaal.');
  const image = useLego(item, 'afbeelding', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80');

  return (
    <section id={sectionName} className="py-24 px-8 bg-white" data-dock-section={sectionName}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <h2 
            className="text-4xl font-bold text-slate-900" 
            {...bindProps(title, sectionName)}
          >
            {title.content}
          </h2>
          <div 
            className="text-lg text-slate-600 leading-relaxed space-y-4"
            {...bindProps(body, sectionName)}
          >
            {body.content}
          </div>
        </div>
        <div className="aspect-video rounded-3xl bg-slate-100 overflow-hidden shadow-xl group">
           <img 
             src={image.content} 
             alt="About" 
             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
             {...bindProps(image, sectionName, 0, 'media')}
           />
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
