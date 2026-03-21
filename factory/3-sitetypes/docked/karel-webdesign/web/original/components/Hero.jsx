import React from 'react';
import { ChevronRight } from 'lucide-react';

const Hero = ({ data }) => {
  const heroData = data || {
    title: 'Professionele websites voor lokale ondernemers',
    subtitle: 'Snel, betaalbaar en zonder gedoe. Ik bouw uw online visitekaartje zodat u zich kunt focussen op uw zaak. 100% transparant en veilig via Smart.',
    cta_text: 'Vraag een gratis voorstel',
    cta_link: '#contact'
  };

  return (
    <div className="relative bg-white pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl">
            <span data-dock-type="text" data-dock-bind="site_settings.0.titel">...</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-slate-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            <span data-dock-type="text" data-dock-bind="site_settings.0.titel">...</span>
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <a
                href={heroData.cta_link}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg transition-colors"
              >
                <span data-dock-type="text" data-dock-bind="site_settings.0.titel">...</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </a>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <a
                href="#portfolio"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-slate-50 border-slate-200 md:py-4 md:text-lg transition-colors"
              >
                Bekijk mijn werk
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
