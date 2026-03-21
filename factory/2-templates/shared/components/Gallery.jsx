import React from 'react';
import EditableMedia from './EditableMedia';
import EditableText from './EditableText';

/**
 * 📸 Gallery Component
 * @description Sleek image gallery for portfolios or products.
 */
const Gallery = ({ data, sectionName }) => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {data.map((item, idx) => (
            <div key={idx} className="break-inside-avoid group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-slate-100 dark:border-slate-800">
              <EditableMedia 
                src={item.foto || item.image} 
                cmsBind={{ file: sectionName, index: idx, key: item.foto ? 'foto' : 'image' }}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                <h4 className="text-white font-black uppercase tracking-tight text-lg">
                  <EditableText value={item.titel || item.title} cmsBind={{ file: sectionName, index: idx, key: item.titel ? 'titel' : 'title' }} />
                </h4>
                <p className="text-white/70 text-xs mt-2 line-clamp-2">
                  <EditableText value={item.beschrijving || item.description} cmsBind={{ file: sectionName, index: idx, key: item.beschrijving ? 'beschrijving' : 'description' }} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
