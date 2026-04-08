import React from 'react';

export default function Footer({ primaryTable }) {
  const info = primaryTable?.[0] || {};
  
  // Zoek velden met verschillende mogelijke aliassen
  const naam = info.site_naam || info.bedrijfsnaam || info.naam_bedrijf || info.naam || info.titel || 'Athena Shop';
  const adres = info.adres || info.address || info.locatie || '';
  const telefoon = info.telefoonnummer || info.telefoon || info.phone || '';
  const email = info.email_algemeen || info.email_publiek || info.email || info.order_email || '';
  const kvk = info.kvk_nummer || info.kvk || info.chamber_of_commerce || '';

  // Zoek de juiste keys voor de editor
  const findKey = (search) => Object.keys(info).find(k => k.toLowerCase() === search.toLowerCase()) || Object.keys(info).find(k => k.toLowerCase().includes(search.toLowerCase()));
  
  const naamKey = findKey('site_naam') || findKey('naam') || findKey('titel') || 'site_naam';
  const adresKey = findKey('adres') || findKey('address') || 'adres';
  const telKey = findKey('telefoon') || findKey('phone') || 'telefoonnummer';
  const emailKey = findKey('email_algemeen') || findKey('email') || findKey('order_email') || 'email_algemeen';
  const kvkKey = findKey('kvk') || 'kvk_nummer';

  return (
    <footer className="py-16 bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="container mx-auto px-6">
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
                <span data-dock-type="text" data-dock-bind="site_settings.0.site_name">...</span>
                </svg>
                <div className="text-sm">
                    <span data-dock-type="text" data-dock-bind="site_settings.0.site_name">...</span>
                </svg>
                <div className="text-sm">
                    <span data-dock-type="text" data-dock-bind="site_settings.0.site_name">
                        {email}
                    </span>
                </div>
              </div>
            )}
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Bedrijfsgegevens</h4>
            {kvk && (
              <p className="text-sm mb-2">
                <span className="text-slate-400">KVK:</span>{' '}
                <span data-dock-type="text" data-dock-bind="site_settings.0.site_name">
                  {kvk}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} {naam}. Alle rechten voorbehouden.</p>
          <p className="mt-2 text-xs">Gemaakt met Athena CMS Factory</p>
        </div>
      </div>
    </footer>
  );
}
