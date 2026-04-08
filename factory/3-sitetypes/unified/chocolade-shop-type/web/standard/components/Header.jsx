import React from 'react';
import { useCart } from './CartContext';

export default function Header({ data }) {
  const headerData = data.header || {};
  const siteSettings = data.site_settings || {};
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const logoUrl = headerData.logo || 'athena-icon.svg';
  const menuLinks = headerData.menu_links || [
    { label: 'Home', url: '/' },
    { label: 'Producten', url: '#producten' },
    { label: 'Over Ons', url: '#over-ons' }
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <img src={logoUrl} alt="Logo" className="w-10 h-10 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-accent transition-colors" data-dock-type="text" data-dock-bind="header.site_name">
            {headerData.site_name || 'Athena Shop'}
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {menuLinks.map((link, i) => (
            <a key={i} href={link.url} className="text-sm font-medium text-slate-600 hover:text-accent transition-colors uppercase tracking-wider">
              {link.label}
            </a>
          ))}
          <a href="/#/checkout" className="relative p-2 text-slate-700 hover:text-accent transition-colors group">
            <i className="fa-solid fa-cart-shopping text-xl"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                {cartCount}
              </span>
            )}
          </a>
        </div>
      </div>
    </nav>
  );
}