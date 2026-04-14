import React from 'react';

export default function Footer({ data }) {
  const settingsSource = data?.site_settings || {};
  const settings = Array.isArray(settingsSource) ? (settingsSource[0] || {}) : settingsSource;
  const contactInfo = data?.contact?.[0] || {};

  const naam = settings.site_name || '{{PROJECT_NAME}}';
  const email = contactInfo.email || settings.email || '';
  const locatie = contactInfo.location || '';
  const btw = contactInfo.btw_nummer || contactInfo.btw || '';
  const linkedin = contactInfo.linkedin_url || contactInfo.linkedin || '';

  return (
    <footer
      className="py-24 text-slate-400 border-t border-slate-800 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-footer-bg, #0f172a)' }}
    >
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 mb-20">

          {/* Brand Identity */}
          <div className="space-y-6">
            <h3 
              className="text-3xl font-serif font-bold text-white"
              data-dock-bind={JSON.stringify({ file: 'site_settings', index: 0, key: 'site_name' })}
            >
              {naam}
            </h3>
            {settings.tagline && (
              <p 
                className="text-lg leading-relaxed font-light"
                data-dock-bind={JSON.stringify({ file: 'site_settings', index: 0, key: 'tagline' })}
              >
                {settings.tagline}
              </p>
            )}
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h4 
              className="text-sm font-bold uppercase tracking-[0.2em] text-accent"
              data-dock-bind={JSON.stringify({ file: 'site_settings', index: 0, key: 'footer_contact_title' })}
            >
              {settings.footer_contact_title || 'Contact'}
            </h4>
            <ul className="space-y-4">
              {email && (
                <li className="flex items-center gap-4">
                  <i className="fa-solid fa-envelope text-accent w-5"></i>
                  <span data-dock-bind={JSON.stringify({ file: 'contact', index: 0, key: 'email' })}>
                    {email}
                  </span>
                </li>
              )}
              {locatie && (
                <li className="flex items-center gap-4">
                  <i className="fa-solid fa-location-dot text-accent w-5"></i>
                  <span data-dock-bind={JSON.stringify({ file: 'contact', index: 0, key: 'location' })}>
                    {locatie}
                  </span>
                </li>
              )}
              {linkedin && (
                <li className="flex items-center gap-4">
                  <i className="fa-brands fa-linkedin text-accent w-5"></i>
                  <a
                    href={contactInfo.linkedin_url_url || linkedin}
                    data-dock-bind={JSON.stringify({ file: 'contact', index: 0, key: 'linkedin_url' })}
                    className="hover:text-white transition-colors"
                  >
                    {contactInfo.linkedin_label || "LinkedIn Profile"}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Legal / Company Info */}
          <div className="space-y-6">
            <h4 
              className="text-sm font-bold uppercase tracking-[0.2em] text-accent"
              data-dock-bind={JSON.stringify({ file: 'site_settings', index: 0, key: 'footer_legal_title' })}
            >
              {settings.footer_legal_title || 'Bedrijfsgegevens'}
            </h4>
            <div className="space-y-4">
              {btw && (
                <p className="flex items-center gap-2">
                  <span className="text-slate-500">BTW:</span>
                  <span data-dock-bind={JSON.stringify({ file: 'contact', index: 0, key: 'btw_nummer' })}>
                    {btw}
                  </span>
                </p>
              )}
              <p 
               className="text-sm font-light leading-relaxed"
               data-dock-bind={JSON.stringify({ file: 'site_settings', index: 0, key: 'footer_text' })}
              >
                {settings.footer_text || 'Professionele website geleverd door Athena CMS Factory.'}
              </p>
            </div>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <p>&copy; {new Date().getFullYear()} {naam}. Alle rechten voorbehouden.</p>
          <div className="flex items-center gap-2 opacity-50">
            <img src="./athena-icon.svg" alt="Athena Logo" className="w-5 h-5" />
            <span data-dock-bind={JSON.stringify({ file: 'site_settings', index: 0, key: 'footer_credit_text' })}>
              {settings.footer_credit_text || 'Gemaakt met Athena CMS Factory'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}