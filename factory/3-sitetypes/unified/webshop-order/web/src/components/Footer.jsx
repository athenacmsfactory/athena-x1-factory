import React from 'react';

export default function Footer({ data }) {
  const footerData = data.footer || {};
  
  return (
    <footer className="bg-slate-900 text-white py-20 px-6 mt-12 overflow-hidden relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div>
          <h3 className="text-xl font-bold mb-6 text-white" data-dock-type="text" data-dock-bind="footer.brand_name">{footerData.brand_name || 'Athena'}</h3>
          <p className="text-slate-400 leading-relaxed" data-dock-type="text" data-dock-bind="footer.description">
            {footerData.description || 'Premium kwaliteit en service sinds 2026.'}
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-accent">Contact</h4>
          <div className="space-y-4 text-slate-400">
             <p><i className="fa-solid fa-envelope mr-3 text-accent/50"></i><span data-dock-type="text" data-dock-bind="footer.email">{footerData.email || 'info@athena.be'}</span></p>
             <p><i className="fa-solid fa-phone mr-3 text-accent/50"></i><span data-dock-type="text" data-dock-bind="footer.phone">{footerData.phone || '+32 400 00 00 00'}</span></p>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-accent">Links</h4>
          <ul className="space-y-3 text-slate-400">
             <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
             <li><a href="#producten" className="hover:text-white transition-colors">Shop</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-accent">Nieuwsbrief</h4>
          <div className="flex bg-white/10 rounded-full p-1 border border-white/20 focus-within:border-accent transition-all">
            <input type="email" placeholder="Uw e-mail..." className="bg-transparent border-none focus:ring-0 px-4 py-2 w-full text-sm outline-none" />
            <button className="bg-accent text-white px-6 py-2 rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-transform">Ok</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} {footerData.brand_name || 'Athena'}. Alle rechten voorbehouden.</p>
      </div>
    </footer>
  );
}