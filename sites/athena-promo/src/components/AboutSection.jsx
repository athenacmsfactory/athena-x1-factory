import React from 'react';
import EditableMedia from './EditableMedia';

const AboutSection = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  const info = data[0];
  const missie = info.missie_visie || info.missie || info.about || info.over_ons || '';
  const imageField = Object.keys(info).find(key => key.toLowerCase().includes('afbeelding') || key.toLowerCase().includes('foto') || key.toLowerCase().includes('image'));
  
  if (!missie) return null;
  
  return (
    <section className="py-20 px-6" data-dock-section="about">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {imageField && info[imageField] && (
            <div className="order-2 md:order-1">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <EditableMedia 
                  src={info[imageField]} 
                  alt="Over ons" 
                  className="w-full h-full object-cover"
                  cmsBind={{ file: 'bedrijfsinformatie', index: 0, key: imageField }}
                />
              </div>
            </div>
          )}
          <div className={`${(imageField && info[imageField]) ? 'order-1 md:order-2' : 'order-1 md:col-span-2 text-center'}`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Over Ons
            </h2>
            <div className={`h-1 w-20 bg-accent mb-8 ${(imageField && info[imageField]) ? '' : 'mx-auto'}`}></div>
            <span data-dock-type="text" data-dock-bind="site_settings.0.titel">
              {missie}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
