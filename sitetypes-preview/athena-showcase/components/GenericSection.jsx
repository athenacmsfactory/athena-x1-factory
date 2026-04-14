import React from 'react';

export default function GenericSection({ data, items, sectionName }) {
  const finalItems = data || items || [];
  
  if (!Array.isArray(finalItems)) return null;

  return (
    <section className="py-20 px-6 bg-[var(--color-surface)] border-b border-athena-border/10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 uppercase tracking-widest text-[var(--color-primary)]">
          {sectionName || 'Section'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {finalItems.map((item, i) => (
            <div key={i} className="p-6 bg-black/20 rounded-lg border border-white/5 hover:border-white/10 transition-all">
              <h3 className="text-xl font-bold mb-3">{item.titel || item.title || item.name || 'Untitled Section'}</h3>
              <p className="text-slate-400 text-sm whitespace-pre-line">{item.omschrijving || item.description || item.content || item.uitleg || ''}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
