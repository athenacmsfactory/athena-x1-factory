import React from 'react';
import { Link } from 'react-router-dom';
import EditableText from './EditableText';

export default function Footer({ data, siteSettings = {} }) {
  const footerContent = data?.footer?.[0] || {};
  const settings = siteSettings;
  const { bedrijfsnaam, adres, telefoon, contact_email, kvk } = settings;

  return (
    <footer className="bg-[var(--color-primary)] text-slate-300 pt-24 pb-12 overflow-hidden relative">
      {/* Decoratieve achtergrond elementen */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Sectie 1: Over ons */}
          <div className="flex flex-col">
            <h3 className="text-2xl font-serif font-bold text-white mb-6 tracking-tight">
              {bedrijfsnaam || 'Chocolaterie'}
            </h3>
            <p className="text-sm leading-relaxed mb-8 opacity-70 italic">
               <EditableText value={footerContent.missie_tekst} cmsBind={{ file: 'footer', index: 0, key: 'missie_tekst' }} />
            </p>
            <div className="flex gap-4">
              <a href={footerContent.facebook_url || "#"} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-white transition-all border border-white/10">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href={footerContent.instagram_url || "#"} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-white transition-all border border-white/10">
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Sectie 2: Contactgegevens */}
          <div>
            <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs opacity-50">Onze Winkel</h4>
            <ul className="space-y-6 text-sm">
              <li className="flex items-start gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20 group-hover:bg-accent group-hover:text-white transition-colors">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div>
                   <span className="block font-semibold text-white mb-1">Adres</span>
                   <EditableText value={adres} cmsBind={{ file: '_site_settings', index: 0, key: 'adres' }} />
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20 group-hover:bg-accent group-hover:text-white transition-colors">
                  <i className="fa-solid fa-phone"></i>
                </div>
                <div>
                   <span className="block font-semibold text-white mb-1">Telefoon</span>
                   <EditableText value={telefoon} cmsBind={{ file: '_site_settings', index: 0, key: 'telefoon' }} />
                </div>
              </li>
            </ul>
          </div>

          {/* Sectie 3: Klantenservice */}
          <div>
            <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs opacity-50">Klantenservice</h4>
            <ul className="space-y-6 text-sm">
              <li className="flex items-start gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20 group-hover:bg-accent group-hover:text-white transition-colors">
                  <i className="fa-solid fa-envelope"></i>
                </div>
                <div>
                   <span className="block font-semibold text-white mb-1">E-mail</span>
                   <EditableText value={contact_email} cmsBind={{ file: '_site_settings', index: 0, key: 'contact_email' }} />
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20 group-hover:bg-accent group-hover:text-white transition-colors">
                   <i className="fa-solid fa-id-card"></i>
                </div>
                <div>
                  <span className="block font-semibold text-white mb-1">KVK Nummer</span>
                  <EditableText value={kvk} cmsBind={{ file: '_site_settings', index: 0, key: 'kvk' }} />
                </div>
              </li>
            </ul>
          </div>

          {/* Sectie 4: Juridisch */}
          <div>
            <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs opacity-50">Juridisch</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/privacy" className="hover:text-accent transition-colors flex items-center gap-2 italic opacity-70 hover:opacity-100 underline decoration-accent/30 underline-offset-4">Privacybeleid</Link></li>
              <li><Link to="/voorwaarden" className="hover:text-accent transition-colors flex items-center gap-2 italic opacity-70 hover:opacity-100 underline decoration-accent/30 underline-offset-4">Algemene Voorwaarden</Link></li>
              <li><Link to="/cookies" className="hover:text-accent transition-colors flex items-center gap-2 italic opacity-70 hover:opacity-100 underline decoration-accent/30 underline-offset-4">Cookiebeleid</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs opacity-40 uppercase tracking-[0.2em]">
             <EditableText value={footerContent.copyright_tekst} cmsBind={{ file: 'footer', index: 0, key: 'copyright_tekst' }} />
          </p>
          <div className="flex items-center gap-8 text-[10px] uppercase tracking-widest opacity-30">
             <span>Gent, België</span>
             <span>Sinds 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
