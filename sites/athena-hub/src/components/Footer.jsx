import React from 'react';

const Footer = ({ siteSettings = {}, footerData = {}, data }) => {
  const settings = Array.isArray(siteSettings) ? (siteSettings[0] || {}) : (siteSettings || {});
  const footer = Array.isArray(footerData) ? (footerData[0] || {}) : (footerData || {});
  const siteName = settings.site_name || 'Athena Hub';

  return (
    <footer className="bg-primary text-white pt-24 pb-12 px-6 overflow-hidden relative" data-dock-section="footer">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="space-y-8">
            <h2 className="text-3xl font-black tracking-tighter" data-dock-type="text" data-dock-bind="site_settings.0.site_name">
              {siteName}
            </h2>
            <p className="text-slate-400 leading-relaxed font-light" data-dock-type="text" data-dock-bind="footer.0.tagline">
              {footer.tagline || settings.tagline}
            </p>
            <div className="flex gap-4">
              {[
                { icon: 'fa-facebook-f', url: footer.facebook_url },
                { icon: 'fa-linkedin-in', url: footer.linkedin_url },
                { icon: 'fa-instagram', url: footer.instagram_url }
              ].map((social, i) => (
                <a key={i} href={social.url || "#"} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all duration-300">
                  <i className={`fa-brands ${social.icon} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-accent mb-8">Navigation</h4>
            <ul className="space-y-4 text-sm font-medium">
              {['Home', 'Showcase', 'Proces', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-accent mb-8">Get in Touch</h4>
            <ul className="space-y-6 text-sm">
              <li className="flex items-start gap-4">
                <i className="fa-solid fa-envelope text-accent mt-1"></i>
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-500 mb-1">Email us</p>
                  <a href={`mailto:${footer.email}`} className="text-slate-200 hover:text-accent transition-colors" data-dock-type="text" data-dock-bind="footer.0.email">
                    {footer.email || "info@athena-cms.be"}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <i className="fa-solid fa-phone text-accent mt-1"></i>
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-500 mb-1">Call us</p>
                  <a href={`tel:${footer.telefoon}`} className="text-slate-200 hover:text-accent transition-colors" data-dock-type="text" data-dock-bind="footer.0.telefoon">
                    {footer.telefoon || "+32 470 00 00 00"}
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-accent mb-8">Location</h4>
            <div className="space-y-4">
               <p className="text-slate-300 text-sm leading-relaxed" data-dock-type="text" data-dock-bind="footer.0.adres">
                 {footer.adres || "Gent, België"}
               </p>
               <div className="pt-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 italic text-[11px] text-slate-400">
                    "Innovation distinguishes between a leader and a follower."
                  </div>
               </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500" data-dock-type="text" data-dock-bind="footer.0.footer_text">
            {footer.footer_text || `© ${new Date().getFullYear()} ${siteName}. All Rights Reserved.`}
          </p>
          <div className="flex items-center gap-6">
            <img src={`${import.meta.env.BASE_URL}athena-icon.svg`} className="h-6 opacity-30 grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Athena" />
            <span className="text-[9px] font-black uppercase tracking-tighter text-slate-600">Built with Athena CMS v8.6</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
