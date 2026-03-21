import React, { useState } from 'react';

const JetCard = ({ jet, index }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <article className={`jet-card ${jet.origin?.toLowerCase() || ''} flex flex-col bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}>
      <div className="relative aspect-video overflow-hidden">
        {!imageError ? (
          <img src={jet.image_url} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" data-dock-type="media" data-dock-bind="jets.0.image_url" />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-2xl">
            {jet.name?.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div className="absolute top-4 right-4 bg-sky-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
          <span data-dock-type="text" data-dock-bind="jets.0.introduction_year">{jet.introduction_year}</span>
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${jet.origin === 'US' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
             {jet.origin === 'US' ? '🇺🇸 USA' : '🇪🇺 Europe'}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            <span data-dock-type="text" data-dock-bind="jets.0.manufacturer">{jet.manufacturer}</span>
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-1">
          <span data-dock-type="text" data-dock-bind="jets.0.name">{jet.name}</span>
        </h3>
        
        <p className="text-sm text-slate-500 italic mb-4">
          <span data-dock-type="text" data-dock-bind="jets.0.full_name">{jet.full_name}</span>
        </p>
        
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
          <span data-dock-type="text" data-dock-bind="jets.0.description">{jet.description}</span>
        </p>
      </div>
    </article>
  );
};

export default JetCard;
