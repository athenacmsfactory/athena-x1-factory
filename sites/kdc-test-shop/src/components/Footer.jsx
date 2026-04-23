import React from 'react';

export default function Footer({ data }) {
  const footerData = data?.footer || {};
  const settings = data?.header || data?.site_settings || {};
  
  const naam = settings.site_name || '{{PROJECT_NAME}}';
  const email = footerData.contact_email || '';
  const locatie = footerData.contact_locatie || '';
  const info = footerData.footer_info || '';
  const customerLinks = footerData.customer_service_links || [];
  const socialLinks = footerData.social_links || [];

  return (
    <footer id="footer" className="py-24 bg-slate-900 text-slate-400 border-t border-slate-800 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 mb-20">
          
          {/* Brand Identity */}
          <div className="space-y-8">
            <h3 className="text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 tracking-tighter">
              <span data-dock-type="text" data-dock-bind="header.site_name">{naam}</span>
            </h3>
            {info && (
              <p className="text-lg leading-relaxed font-light text-slate-400">
                <span data-dock-type="text" data-dock-bind="footer.footer_info">{info}</span>
              </p>
            )}
            <div className="flex gap-4">
              {socialLinks.map((link, idx) => (
                <a key={idx} href={link.url} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent hover:text-white transition-colors cursor-pointer" data-dock-type="link" data-dock-bind={`footer.social_links.${idx}`}>
                  <i className={`fa-brands fa-${link.platform}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links / Customer Service */}
          <div className="space-y-8">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Klantenservice</h4>
            <ul className="space-y-4 text-slate-400 font-medium">
              {customerLinks.map((link, idx) => (
                <li key={idx}>
                  <a href={link.url} className="hover:text-white transition-colors" data-dock-type="link" data-dock-bind={`footer.customer_service_links.${idx}`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-8">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Contact & Support</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <i className="fa-solid fa-envelope text-accent mt-1"></i>
                <div className="flex flex-col">
                   <span className="text-xs font-bold uppercase opacity-40">E-mail ons</span>
                   <span className="text-white" data-dock-type="text" data-dock-bind="footer.contact_email">{email || 'support@kdc.be'}</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <i className="fa-solid fa-location-dot text-accent mt-1"></i>
                <div className="flex flex-col">
                   <span className="text-xs font-bold uppercase opacity-40">Bezoek ons</span>
                   <span className="text-white" data-dock-type="text" data-dock-bind="footer.contact_locatie">{locatie || 'Veldstraat 12, Gent'}</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <p>&copy; {new Date().getFullYear()} {naam}. Alle rechten voorbehouden.</p>
          <div className="flex items-center gap-2 opacity-50">
            <img src="./athena-icon.svg" alt="Athena Logo" className="w-5 h-5" />
            <span>Gemaakt met Athena CMS Factory</span>
          </div>
        </div>
      </div>
    </footer>
  );
}