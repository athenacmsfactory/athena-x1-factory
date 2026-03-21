import React from 'react';

export default function Footer({ primaryTable, socialData = [], openingData = [], locationData = [] }) {
  const info = primaryTable?.[0] || {};
  const loc = locationData?.[0] || {};

  const iconMap = {
    'fa': 'fa-brands fa-facebook',
    'in': 'fa-brands fa-instagram',
    'tw': 'fa-brands fa-twitter',
    'li': 'fa-brands fa-linkedin',
    'yt': 'fa-brands fa-youtube',
    'wa': 'fa-brands fa-whatsapp'
  };

  const extractText = (val, fallback = '') => {
    if (typeof val !== 'object' || val === null) return val ?? fallback;
    return val.text || val.title || val.label || val.name || val.value || fallback;
  };

  const rawNaam = info.bedrijfsnaam || info.naam_bedrijf || info.naam || info.titel || 'De Schaar';
  const naam = extractText(rawNaam);

  let adres = extractText(info.adres || info.address || info.locatie);
  if (!adres && loc.straat_nummer) {
    adres = `${loc.straat_nummer}, ${loc.postcode} ${loc.stad}`;
  }

  const telefoon = extractText(info.telefoonnummer || info.telefoon || info.phone || loc.telefoonnummer || '');
  const email = extractText(info.email_algemeen || info.email_publiek || info.email || loc.email || '');
  const kvk = extractText(info.kvk_nummer || info.kvk || info.chamber_of_commerce || '');
  const copyright = extractText(info.copyright_tekst || 'Alle rechten voorbehouden.');

  return (
    <footer
      id="footer"
      className="py-24 text-slate-400 border-t border-white/5"
      style={{ backgroundColor: 'var(--color-footer-bg, #020617)' }}
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-3xl font-serif font-bold text-white mb-6 uppercase tracking-tighter">
              <span data-dock-type="text" data-dock-bind="footer.0.bedrijfsnaam">{naam}</span>
            </h3>
            {adres && (
              <div className="mb-4 flex items-start gap-4">
                <i className="fa-solid fa-location-dot text-accent mt-1 shrink-0"></i>
                <span data-dock-type="text" data-dock-bind="locatie.0.straat_nummer">{adres}</span>
              </div>
            )}

            {/* Social Icons */}
            <div className="flex gap-4 mt-10">
              {socialData.map((social, idx) => (
                <a
                  key={idx}
                  href={extractText(social.url) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/5 hover:bg-accent hover:text-white rounded-xl flex items-center justify-center text-xl transition-all duration-300"
                  title={extractText(social.naam)}
                  data-dock-type="text"
                  data-dock-bind={`social_media.${idx}.url`}
                >
                  <i className={iconMap[extractText(social.icoon_klasse)] || `fa-solid fa-${extractText(social.icoon_klasse)}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8">
              Contact
            </h4>
            <div className="space-y-6">
              {telefoon && (
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent transition-colors">
                    <i className="fa-solid fa-phone text-xs"></i>
                  </div>
                  <span data-dock-type="text" data-dock-bind="footer.0.telefoonnummer">{telefoon}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent transition-colors">
                    <i className="fa-solid fa-envelope text-xs"></i>
                  </div>
                  <span data-dock-type="text" data-dock-bind="footer.0.email">{email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Openingsuren */}
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8">
              Openingsuren
            </h4>
            <div className="space-y-2">
              {openingData.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs border-b border-white/5 pb-1">
                  <span data-dock-type="text" data-dock-bind={`openingsuren.${idx}.dag`}>{extractText(item.dag)}</span>
                  <span data-dock-type="text" data-dock-bind={`openingsuren.${idx}.uren`}>{extractText(item.uren)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8">
              Bedrijfsgegevens
            </h4>
            {kvk && (
              <p className="text-xs mb-4 flex justify-between border-b border-white/5 pb-2">
                <span className="opacity-50">
                  <span>KVK</span>
                </span>
                <span data-dock-type="text" data-dock-bind="footer.0.kvk_nummer">{kvk}</span>
              </p>
            )}
            <p className="text-[10px] leading-relaxed opacity-30 mt-8">
              &copy; {new Date().getFullYear()} {naam}.<br />
              <span data-dock-type="text" data-dock-bind="footer.0.copyright_tekst">{copyright}</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] uppercase tracking-widest opacity-20">
            Powered by Athena CMS
          </p>
          <div className="flex gap-6 text-[10px] uppercase tracking-widest font-bold">
            <a href={extractText(info.privacy_beleid_link) || "#"} className="hover:text-accent transition-colors" data-dock-type="text" data-dock-bind="footer.0.privacy_beleid_link">Privacy Policy</a>
            <a href={extractText(info.cookies_beleid_link) || "#"} className="hover:text-accent transition-colors" data-dock-type="text" data-dock-bind="footer.0.cookies_beleid_link">Cookie Beleid</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
