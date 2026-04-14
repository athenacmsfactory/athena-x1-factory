import React, { useState, useEffect } from 'react';
import GenericSection from './GenericSection';
/* {{IMPORTS_START}} */
/* {{IMPORTS_END}} */

const Section = ({ data }) => {
  const getImageUrl = (url) => {
    if (!url) return undefined;
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
      /* {{MAPPING_START}} */
/* {{MAPPING_END}} */
      return GenericSection;
  };

  const headerData = data.header || {};
  let heroData = data.hero || {};
  if (Array.isArray(heroData)) heroData = heroData[0] || {};

  const heroHeader = heroData.hero_header || heroData.title || heroData.hero_title || 'Athena v9';
  const heroTagline = heroData.hero_tagline || heroData.subtitle || heroData.tagline || 'Modern site production engine.';
  const heroImage = heroData.hero_image || heroData.image || 'preview-hero.jpg';

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      {(heroHeader || heroData.cta_text) && (
        <section
          id="hero"
          data-dock-section="hero"
          className="relative w-full h-auto min-h-[80vh] flex items-center justify-center overflow-hidden bg-slate-900 pt-24"
        >
          <div className="absolute inset-0 z-0">
             <img src={getImageUrl(heroImage)} className="w-full h-full object-cover" data-dock-type="media" data-dock-bind="hero.hero_image" />
             <div className="absolute inset-0 bg-black/60 z-10"></div>
          </div>
          <div className="relative z-20 text-center px-6 max-w-5xl text-white">
            <h1 className="text-4xl md:text-7xl font-bold mb-6">
              <span data-dock-type="text" data-dock-bind="hero.hero_header">{heroHeader}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-90">
              <span data-dock-type="text" data-dock-bind="hero.hero_tagline">{heroTagline}</span>
            </p>
            {heroData.cta_text && (
              <a href={heroData.cta_url || "#"} className="bg-athena-accent text-white px-8 py-4 rounded-full font-bold hover:brightness-110 transition-all shadow-xl shadow-blue-500/20" data-dock-type="link" data-dock-bind="hero.cta_text">
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
        /* {{RETURN_START}} */
const Comp = getComponent(sectionName);
        return (
          <section key={idx} id={sectionName} data-dock-section={sectionName} className="py-20 border-b border-athena-border/5">
              <Comp data={items} sectionName={sectionName} sectionSettings={sectionSettings[sectionName]} />
          </section>
        );
/* {{RETURN_END}} */
      })}
    </div>
  );
};

export default Section;
