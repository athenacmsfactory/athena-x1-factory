import React from 'react';
import EditableImage from '../EditableImage';

export default function ContentBlock({ data = {}, index = 0 }) {
  const block = data;
  const isReversed = index % 2 !== 0;

  return (
    <section id="content" className="py-20 bg-white">
      <div className={`container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center`}>
        <div className={isReversed ? 'lg:order-2' : ''}>
          <h2 
            className="text-3xl font-bold text-gray-900 mb-6"
            data-dock-type="text"
            data-dock-bind="site_settings.0.titel"
          >
            {block.titel}
          </h2>
          <p 
            className="text-gray-600 leading-relaxed whitespace-pre-line"
            data-dock-type="text"
            data-dock-bind="site_settings.0.subtitel"
          >
            {block.subtitel || block.tekst}
          </p>
        </div>
        <div className={`aspect-video bg-gray-50 rounded-2xl overflow-hidden ${isReversed ? 'lg:order-1' : ''}`}>
          <EditableImage 
            src={`${import.meta.env.BASE_URL}images/${block['afbeelding-url'] || '1.jpeg'}`} 
            alt={block.titel}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
