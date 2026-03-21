import React from 'react';

const FooterColumns = ({ data }) => {
  const settings = data.site_settings?.[0] || {};
  const services = data.services || [];
  return (
    <footer className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
        <div className="col-span-2 md:col-span-1">
          <div className="w-12 h-12 bg-primary rounded-xl mb-6"></div>
          <h3 className="font-bold text-slate-900 mb-4">{settings.bedrijfsnaam}</h3>
          <p className="text-slate-500 text-sm">{settings.ondertitel}</p>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Diensten</h4>
          <ul className="space-y-3 text-sm text-slate-600">
            {services.slice(0, 5).map((s, i) => (
              <li key={i}><a href="#" className="hover:text-primary transition-colors">{s.titel}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Navigatie</h4>
          <ul className="space-y-3 text-sm text-slate-600">
            <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
            <li><a href="/over-ons" className="hover:text-primary transition-colors">Over Ons</a></li>
            <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Nieuwsbrief</h4>
          <div className="flex gap-2">
            <input type="email" placeholder="Email" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-primary" />
            <button className="bg-primary text-white p-2 rounded-lg"><i className="fa-solid fa-paper-plane"></i></button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterColumns;
