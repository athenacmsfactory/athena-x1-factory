import React from 'react';

const Hero = ({ profile }) => {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left z-10">
          <h2 className="text-blue-500 font-black uppercase tracking-[0.3em] mb-4 text-sm">
            <span data-dock-type="text" data-dock-bind="site_settings.0.titel">...</span>
          </h2>
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase">
            <span data-dock-type="text" data-dock-bind="site_settings.0.titel">...</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-xl leading-relaxed">
            <span data-dock-type="text" data-dock-bind="site_settings.0.titel">...</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a href={"#"} data-dock-type="link" data-dock-bind="site_settings.0.titel">{}</a>
            <a href={"#"} data-dock-type="link" data-dock-bind="site_settings.0.titel">{}</a>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/[0.02] whitespace-nowrap pointer-events-none select-none">
        PORTFOLIO
      </div>
    </section>
  );
};

export default Hero;