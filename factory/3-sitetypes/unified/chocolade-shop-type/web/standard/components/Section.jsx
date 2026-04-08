import React, { useState, useEffect } from 'react';
/* {{IMPORTS}} */

const Section = ({ data }) => {
  const getImageUrl = (url) => {
    if (!url) return '';
    if (typeof url === 'object') url = url.text || url.url || '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = import.meta.env.BASE_URL || '/';
    if (url.startsWith(base) && base !== '/') return url;
    const isRootPublic = url.startsWith('./') || url.endsWith('.svg') || url.endsWith('.ico') || url === 'site-logo.svg' || url === 'athena-icon.svg';
    const hasImagesPrefix = url.includes('/images/') || url.startsWith('images/');
    const pathPrefix = (isRootPublic || hasImagesPrefix) ? '' : 'images/';
    return (base + pathPrefix + url.replace('./', '')).replace(new RegExp('/+', 'g'), '/');
  };

  const sectionOrder = data.section_order || [];
  const layoutSettings = data.layout_settings || {};
  const sectionSettings = data.section_settings || {};

  useEffect(() => {
    if (window.athenaScan) {
      window.athenaScan(data);
    }
  }, [data, sectionOrder]);

  const getComponent = (sectionName) => {
      const lower = sectionName.toLowerCase();
      /* {{MAPPING_LOGIC}} */
      return GenericSection;
  };

  const headerData = data.header || {};
  const heroData = data.hero || {};
  const footerData = data.footer || {};

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section (Explicitly rendered if exists) */}
      {heroData && Object.keys(heroData).length > 0 && (
        <section
          id="hero"
          data-dock-section="hero"
          className="relative w-full h-auto min-h-[80vh] flex items-center justify-center overflow-hidden bg-slate-900 pt-24"
        >
          <div className="absolute inset-0 z-0">
             <img src={getImageUrl(heroData.hero_image)} className="w-full h-full object-cover" data-dock-type="media" data-dock-bind="hero.hero_image" />
             <div className="absolute inset-0 bg-black/50 z-10"></div>
          </div>
          <div className="relative z-20 text-center px-6 max-w-5xl text-white">
            <h1 className="text-4xl md:text-7xl font-bold mb-6">
              <span data-dock-type="text" data-dock-bind="hero.hero_header">{heroData.hero_header}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-90">
              <span data-dock-type="text" data-dock-bind="hero.hero_tagline">{heroData.hero_tagline}</span>
            </p>
            {heroData.cta_text && (
              <a href={heroData.cta_url || "#"} className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-slate-200 transition-all" data-dock-type="link" data-dock-bind="hero.cta_text">
                {heroData.cta_text}
              </a>
            )}
          </div>
        </section>
      )}

      {/* 2. Dynamic Sections Loop */}
      {sectionOrder.filter(name => !['site_settings', 'basis', 'header', 'footer', 'hero'].includes(name.toLowerCase())).map((sectionName, idx) => {
        const items = data[sectionName] || [];
        if (items.length === 0) return null;
        /* {{COMPONENT_RETURN}} */
      })}
    </div>
  );
};

export default Section;
