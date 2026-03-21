import React from 'react';

const FooterExpanded = ({ data }) => {
  const settings = data.site_settings?.[0] || {};
  const contact = data.contact?.[0] || {};
  return (
    <footer className="py-20 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter mb-4">{settings.bedrijfsnaam}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{settings.ondertitel}</p>
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3"><i className="fa-solid fa-location-dot text-primary"></i> {contact.adres}</li>
            <li className="flex items-center gap-3"><i className="fa-solid fa-phone text-primary"></i> {contact.telefoon}</li>
            <li className="flex items-center gap-3"><i className="fa-solid fa-envelope text-primary"></i> {contact.email}</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Volg Ons</h4>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-all"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-all"><i className="fa-brands fa-instagram"></i></a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-all"><i className="fa-brands fa-linkedin-in"></i></a>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-20 pt-8 border-t border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest text-center">
        © {new Date().getFullYear()} {settings.bedrijfsnaam}. Crafted with Athena CMS.
      </div>
    </footer>
  );
};

export default FooterExpanded;
