import React from 'react';
import { Link } from 'react-router-dom';

/**
 * FooterModern (v9.0 Clean - Dehydrated)
 * Using standard HTML tags with data-dock-* attributes.
 */
export default function FooterModern({ siteSettings = {}, navigationData = [] }) {
  const settings = Array.isArray(siteSettings) ? (siteSettings[0] || {}) : (siteSettings || {});
  const siteName = settings.site_name || '{{PROJECT_NAME}}';
  const logoChar = (settings.logo_text || siteName).charAt(0).toUpperCase();

  const handleNavClick = (e, url) => {
    if (url && url.startsWith('#')) {
      e.preventDefault();
      const targetId = url.substring(1);
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = Array.isArray(navigationData) ? navigationData : [];
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white pt-24 pb-12 px-6 overflow-hidden relative">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top: Newsletter / Capture Area */}
        <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-10 md:p-16 border border-white/10 mb-20 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Stay ahead of the curve</h3>
            <p className="text-slate-400 text-lg leading-relaxed">Subscribe to our newsletter for the latest updates and exclusive insights delivered to your inbox.</p>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all min-w-[300px]"
            />
            <button className="bg-accent text-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20">
              Subscribe
            </button>
          </div>
        </div>

        {/* Middle: Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-4 group mb-8">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary text-2xl font-black group-hover:scale-110 transition-all">
                {logoChar}
              </div>
              <span className="text-2xl font-black tracking-tight">
                <span data-dock-bind="site_settings.0.site_name" data-dock-type="text">{siteName}</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed mb-8 flex flex-col gap-2">
              <span data-dock-bind="site_settings.0.footer_tagline" data-dock-type="text">
                {settings.footer_tagline || "Redefining the digital landscape with precision and passion."}
              </span>
              <span className="font-bold text-slate-200 mt-2" data-dock-bind="site_settings.0.site_email" data-dock-type="text">
                {settings.site_email}
              </span>
            </p>
            {/* Social Icons Mapping */}
            <div className="flex gap-4">
              {['twitter', 'facebook', 'linkedin', 'instagram'].map(platform => (
                <a key={platform} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all">
                  <i className={`fa-brands fa-${platform}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="col-span-1">
            <h4 className="text-sm font-black uppercase tracking-widest text-accent mb-8">Navigation</h4>
            <ul className="space-y-4">
              {navLinks.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.url}
                    data-dock-bind={`navigation.${idx}.label`}
                    data-dock-type="link"
                    className="text-slate-400 hover:text-white transition-colors"
                    onClick={(e) => handleNavClick(e, link.url)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-sm font-black uppercase tracking-widest text-accent mb-8">Services</h4>
            <ul className="space-y-4 text-slate-400">
              <li>Web Architecture</li>
              <li>Brand Strategy</li>
              <li>Automation Layer</li>
              <li>Cloud Ecosystems</li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-sm font-black uppercase tracking-widest text-accent mb-8">Legal</h4>
            <ul className="space-y-4 text-slate-400">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Settings</li>
            </ul>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-sm">
          <span>&copy; {year} <span data-dock-bind="site_settings.0.site_name" data-dock-type="text">{siteName}</span>. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <span>Built with</span>
            <span className="text-accent font-black">Athena v9.0</span>
            <i className="fa-solid fa-bolt text-[10px] text-accent"></i>
          </div>
        </div>
      </div>
    </footer>
  );
}
