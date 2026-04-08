import React from 'react';

const Footer = ({ settings }) => {
  const logoText = settings?.logo_text || "Karel Webdesign";

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
             <span className="text-xl font-bold text-white tracking-tight">
              <span data-dock-type="text" data-dock-bind="site_settings.0.site_name">...</span>
            </span>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-base text-slate-400">
              &copy; {new Date().getFullYear()} <span data-dock-type="text" data-dock-bind="site_settings.0.site_name">...</span>. Facturatie & Payroll via Smart. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
