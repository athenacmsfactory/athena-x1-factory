import React from 'react';
import { useLego, bindProps, getImageUrl } from '../lib/LegoUtils';

const AboutSection = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  const info = data[0];
  const missieField = Object.keys(info).find(k => k.toLowerCase().includes('missie') || k.toLowerCase().includes('about') || k.toLowerCase().includes('over')) || 'missie_visie';
  const imageField = Object.keys(info).find(key => key.toLowerCase().includes('afbeelding') || key.toLowerCase().includes('foto') || key.toLowerCase().includes('image'));
  
  const missieRes = useLego(info, missieField, "");
  const imageRes = useLego(info, imageField, "");

  if (!missieRes.content) return null;
  
  const sectionName = "bedrijfsinformatie"; // Based on previous table prop

  return (
    <section className="py-20 px-6" data-dock-section="about">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {imageRes.content && (
            <div className="order-2 md:order-1">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={getImageUrl(imageRes.content)} 
                  alt="Over ons" 
                  className="w-full h-full object-cover"
                  {...bindProps(imageRes, sectionName, 0, 'image')}
                />
              </div>
            </div>
          )}
          <div className={`order-1 ${imageRes.content ? 'md:order-2' : 'md:col-span-2 text-center'}`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Over Ons
            </h2>
            <div className={`h-1 w-20 bg-accent mb-8 ${imageRes.content ? '' : 'mx-auto'}`}></div>
            <p 
              className="text-lg leading-relaxed text-slate-700 dark:text-slate-300"
              {...bindProps(missieRes, sectionName, 0, 'text')}
            >
              {missieRes.content}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
