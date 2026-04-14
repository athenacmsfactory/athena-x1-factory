import React from 'react';

export default function Footer({ data }) {
  const footerData = data.footer || {};
  const siteSettings = data.site_settings || {};
  
  return (
    <footer className="bg-slate-900 text-white py-12 px-6 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h4 className="text-xl font-bold mb-4">{footerData.site_name || 'Athena'}</h4>
          <p className="text-slate-400 text-sm leading-relaxed" data-dock-type="text" data-dock-bind="footer.description">
            {footerData.description || 'Modern, AI-gestuurd webdesign voor bedrijven.'}
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <h5 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Contact</h5>
          <p className="text-sm text-slate-300" data-dock-type="text" data-dock-bind="footer.email">{footerData.email}</p>
          <p className="text-sm text-slate-300" data-dock-type="text" data-dock-bind="footer.phone">{footerData.phone}</p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Athena Framework</p>
          <p className="text-[10px] text-slate-700 mt-1 uppercase tracking-tighter">Powered by Hybrid AI Engine</p>
        </div>
      </div>
    </footer>
  );
}
