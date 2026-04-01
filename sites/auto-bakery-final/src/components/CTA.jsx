import React from 'react';
import { useLego, bindProps } from '../lib/LegoUtils';

const CTA = ({ data, sectionName }) => {
    if (!data || data.length === 0) return null;
    const item = data[0];
    const titelKey = Object.keys(item).find(k => /titel|header/i.test(k)) || 'titel';
    const tekstKey = Object.keys(item).find(k => /tekst|beschrijving/i.test(k)) || 'tekst';
    const btnKey = Object.keys(item).find(k => /knop|label|button/i.test(k)) || 'knop_label';
    const urlKey = Object.keys(item).find(k => /url|link/i.test(k)) || 'knop_url';
    const bgKey = Object.keys(item).find(k => /achtergrond|foto|image/i.test(k));

    const titelRes = useLego(item, titelKey, "");
    const tekstRes = useLego(item, tekstKey, "");
    const btnRes   = useLego(item, btnKey, "Start Nu");
    const bgRes    = bgKey ? useLego(item, bgKey, "") : null;

    const urlValue = item[urlKey] || "#contact";

    return (
        <section id={sectionName} data-dock-section={sectionName} className="py-32 px-6 relative overflow-hidden flex items-center justify-center text-center">
            {bgRes && bgRes.content ? (
                <div className="absolute inset-0 z-0">
                    <img 
                        src={bgRes.content} 
                        className="w-full h-full object-cover" 
                        {...bindProps(bgRes, sectionName, 0, 'image')}
                    />
                    <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
                </div>
            ) : (
                <div className="absolute inset-0 bg-[var(--color-primary)] z-0"></div>
            )}

            <div className="relative z-10 max-w-4xl mx-auto text-white">
                <h2 
                    className="text-4xl md:text-6xl font-serif font-bold mb-8 leading-tight"
                    {...bindProps(titelRes, sectionName, 0, 'text')}
                >
                    {titelRes.content}
                </h2>
                {tekstRes.content && (
                    <p 
                        className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed"
                        {...bindProps(tekstRes, sectionName, 0, 'text')}
                    >
                        {tekstRes.content}
                    </p>
                )}
                <a
                    href={urlValue}
                    className="bg-white text-primary px-12 py-5 rounded-full text-xl font-bold shadow-2xl hover:bg-accent hover:text-white transition-all transform hover:scale-105 inline-block"
                    {...bindProps(btnRes, sectionName, 0, 'link')}
                >
                    {btnRes.content}
                </a>
            </div>
        </section>
    );
};

export default CTA;
