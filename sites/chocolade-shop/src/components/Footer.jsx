import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer({ data, siteSettings }) {
  const footerContent = data?.footer?.[0] || {};
  const settings = siteSettings || {};
  const { naam, adres, telefoon, email } = settings;

  return (
    <footer className="bg-primary text-slate-300 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">{naam}</h3>
            {adres && (
              <div className="mb-3 flex items-start gap-2">
                <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-sm">
                    <span data-dock-type="text" data-dock-bind="_site_settings.0.adres">{adres}</span>
                </div>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span data-dock-type="text" data-dock-bind="_site_settings.0.contact_email">{email}</span>
              </div>
            )}
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Juridisch</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacybeleid</Link></li>
              <li><Link to="/voorwaarden" className="hover:text-accent transition-colors">Algemene Voorwaarden</Link></li>
              <li><Link to="/cookies" className="hover:text-accent transition-colors">Cookiebeleid</Link></li>
            </ul>
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:items-end justify-end">
             <p className="text-sm opacity-50">
                <span data-dock-type="text" data-dock-bind="footer.0.copy_tekst">{footerContent.copy_tekst || `© ${new Date().getFullYear()} ${naam}. Alle rechten voorbehouden.`}</span>
             </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
