import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../..');
const SITETYPES_PATH = path.join(ROOT, 'factory/3-sitetypes/unified');

const HEADER_TEMPLATE = `import React from 'react';
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
}`;

const FOOTER_TEMPLATE = `import React from 'react';

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
}`;

// Note: Section.jsx should use the template from Section.base.jsx usually, 
// but we'll manually overwrite it here if it exists in the sitetype.
const SECTION_BASE_OVERWRITE = fs.readFileSync(path.join(ROOT, 'factory/2-templates/logic/Section.base.jsx'), 'utf8');

async function migrate() {
    console.log("🚀 Starting Athena 1-1-1 Component Migration...");
    const sitetypes = fs.readdirSync(SITETYPES_PATH);

    for (const siteType of sitetypes) {
        const typePath = path.join(SITETYPES_PATH, siteType);
        if (!fs.statSync(typePath).isDirectory()) continue;

        // Find components directory
        // Standard structure: <typePath>/web/standard/src/components/ or <typePath>/web/standard/components/
        const searchPaths = [
            path.join(typePath, 'web/standard/components'),
            path.join(typePath, 'web/standard/src/components'),
            path.join(typePath, 'web/original/components'),
            path.join(typePath, 'web/src/components')
        ];

        let foundCompDir = searchPaths.find(p => fs.existsSync(p));

        if (foundCompDir) {
            console.log(`\n📦 Migrating: ${siteType} (${foundCompDir})`);
            
            // 1. Header.jsx
            const headerPath = path.join(foundCompDir, 'Header.jsx');
            if (fs.existsSync(headerPath)) {
                console.log(`   - Updating Header.jsx`);
                fs.writeFileSync(headerPath, HEADER_TEMPLATE);
            }

            // 2. Footer.jsx
            const footerPath = path.join(foundCompDir, 'Footer.jsx');
            if (fs.existsSync(footerPath)) {
                console.log(`   - Updating Footer.jsx`);
                fs.writeFileSync(footerPath, FOOTER_TEMPLATE);
            }

            // 3. Section.jsx
            const sectionPath = path.join(foundCompDir, 'Section.jsx');
            if (fs.existsSync(sectionPath)) {
                console.log(`   - Updating Section.jsx (Hybrid 1-1-1)`);
                fs.writeFileSync(sectionPath, SECTION_BASE_OVERWRITE);
            }
        }
    }

    console.log("\n✅ Done! All 26+ sitetypes components modernized.");
}

migrate().catch(console.error);
