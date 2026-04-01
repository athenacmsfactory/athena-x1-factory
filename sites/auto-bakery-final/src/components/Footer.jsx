import React from 'react';
import { useLego, bindProps } from '../lib/LegoUtils';

export default function Footer({ data }) {
  const settingsSource = data?.site_settings || {};
  const settings = Array.isArray(settingsSource) ? (settingsSource[0] || {}) : settingsSource;
  const contactInfo = data?.contact?.[0] || {};

  // site_settings bindings
  const naamRes         = useLego(settings, 'site_name', "auto-bakery-final");
  const taglineRes      = useLego(settings, 'tagline', "");
  const contactTitleRes = useLego(settings, 'footer_contact_title', 'Contact');
  const legalTitleRes   = useLego(settings, 'footer_legal_title', 'Bedrijfsgegevens');
  const footerTextRes   = useLego(settings, 'footer_text', 'Professionele website geleverd door Athena CMS Factory.');
  const creditTextRes   = useLego(settings, 'footer_credit_text', 'Gemaakt met Athena CMS Factory');

  // contact bindings
  const emailRes    = useLego(contactInfo, 'email', settings.email || '');
  const locationRes = useLego(contactInfo, 'location', '');
  const btwRes      = useLego(contactInfo, 'btw_nummer', contactInfo.btw || '');
  const linkedinRes = useLego(contactInfo, 'linkedin_url', '');

  const sectionSettings = 'site_settings';
  const sectionContact  = 'contact';

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
            <h3 className="text-3xl font-serif font-bold text-white" {...bindProps(naamRes, sectionSettings, 0, 'text')}>
              {naamRes.content}
            </h3>
            {taglineRes.content && (
              <p className="text-lg leading-relaxed font-light" {...bindProps(taglineRes, sectionSettings, 0, 'text')}>
                {taglineRes.content}
              </p>
            )}
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-accent" {...bindProps(contactTitleRes, sectionSettings, 0, 'text')}>
              {contactTitleRes.content}
            </h4>
            <ul className="space-y-4">
              {emailRes.content && (
                <li className="flex items-center gap-4">
                  <i className="fa-solid fa-envelope text-accent w-5"></i>
                  <span {...bindProps(emailRes, sectionContact, 0, 'text')}>{emailRes.content}</span>
                </li>
              )}
              {locationRes.content && (
                <li className="flex items-center gap-4">
                  <i className="fa-solid fa-location-dot text-accent w-5"></i>
                  <span {...bindProps(locationRes, sectionContact, 0, 'text')}>{locationRes.content}</span>
                </li>
              )}
              {linkedinRes.content && (
                <li className="flex items-center gap-4">
                  <i className="fa-brands fa-linkedin text-accent w-5"></i>
                  <a
                    href={linkedinRes.content}
                    {...bindProps(linkedinRes, sectionContact, 0, 'link')}
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
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-accent" {...bindProps(legalTitleRes, sectionSettings, 0, 'text')}>
              {legalTitleRes.content}
            </h4>
            <div className="space-y-4">
              {btwRes.content && (
                <p className="flex items-center gap-2">
                  <span className="text-slate-500">BTW:</span>
                  <span {...bindProps(btwRes, sectionContact, 0, 'text')}>{btwRes.content}</span>
                </p>
              )}
              <p className="text-sm font-light leading-relaxed" {...bindProps(footerTextRes, sectionSettings, 0, 'text')}>
                {footerTextRes.content}
              </p>
            </div>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <p>&copy; {new Date().getFullYear()} {naamRes.content}. Alle rechten voorbehouden.</p>
          <div className="flex items-center gap-2 opacity-50">
            <img src="./athena-icon.svg" alt="Athena Logo" className="w-5 h-5" />
            <span {...bindProps(creditTextRes, sectionSettings, 0, 'text')}>{creditTextRes.content}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}