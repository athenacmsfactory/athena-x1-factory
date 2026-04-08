import React from 'react';

/**
 * HeroV9 (v9.0 Clean - Dehydrated)
 * High-impact hero section using standard HTML tags with data-dock-* attributes.
 */
export default function HeroV9({ data, sectionName, style = {} }) {
  const content = data || {};
  
  return (
    <section 
      id={sectionName} 
      data-dock-section={sectionName} 
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white dark:bg-slate-930 pt-32 pb-20 px-6"
      style={style}
    >
      {/* Background Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl pointer-events-none opacity-30 blur-[120px]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full animate-pulse-delayed"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="w-2 h-2 rounded-full bg-accent animate-ping"></span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            <span data-dock-bind={`${sectionName}.0.badge`} data-dock-type="text">{content.badge || "Innovation First"}</span>
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter mb-10 max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <span data-dock-bind={`${sectionName}.0.titel`} data-dock-type="heading">{content.titel || "Crafting the Future"}</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <span data-dock-bind={`${sectionName}.0.tagline`} data-dock-type="paragraph">{content.tagline || "Empowering visionaries with state-of-the-art digital infrastructure and premium design systems."}</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000">
          {content.cta_text && (
            <button 
              data-dock-bind={`${sectionName}.0.cta_text`}
              data-dock-type="link"
              className="bg-primary text-white px-10 py-6 rounded-3xl font-black text-lg uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95 shadow-xl shadow-primary/20"
              onClick={() => {
                const target = document.querySelector(content.cta_link || "#contact");
                target?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {content.cta_text}
            </button>
          )}
          {content.secondary_cta_text && (
            <button 
              data-dock-bind={`${sectionName}.0.secondary_cta_text`}
              data-dock-type="link"
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-10 py-6 rounded-3xl font-black text-lg uppercase tracking-widest border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xl shadow-black/5"
              onClick={() => {
                const target = document.querySelector(content.secondary_cta_link || "#about");
                target?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {content.secondary_cta_text}
            </button>
          )}
        </div>

        {/* Main Visual */}
        {content.afbeelding && (
          <div className="mt-20 w-full max-w-6xl rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-1000 delay-500">
            <img 
              src={content.afbeelding} 
              data-dock-bind={`${sectionName}.0.afbeelding`}
              data-dock-type="media"
              className="w-full aspect-[21/9] object-cover"
              alt="Hero Visual"
            />
          </div>
        )}
      </div>

      {/* Local Styles for blobs */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }
        @keyframes pulse-delayed {
          0%, 100% { transform: scale(1.2); opacity: 0.5; }
          50% { transform: scale(1); opacity: 0.3; }
        }
        .animate-pulse-slow { animation: pulse-slow 10s infinite ease-in-out; }
        .animate-pulse-delayed { animation: pulse-delayed 12s infinite ease-in-out; }
      `}</style>
    </section>
  );
}
