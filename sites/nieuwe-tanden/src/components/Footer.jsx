import React from 'react';

/**
 * ⚓ Athena Pro Footer v7
 * Volledig bewerkbaar via de Dock en gekoppeld aan 'basisgegevens'.
 */
export default function Footer({ primaryTable }) {
  const info = primaryTable?.[0] || {};
  
  // Velden zoeken met aliassen (voor robuustheid)
  const findValue = (keys) => {
    const key = keys.find(k => info[k] !== undefined);
    return { value: info[key] || '', key: key || keys[0] };
  };

  const naam = findValue(['bedrijfsnaam', 'naam_bedrijf', 'naam', 'titel', 'site_naam']);
  const adres = findValue(['adres', 'address', 'locatie']);
  const telefoon = findValue(['telefoonnummer', 'telefoon', 'phone']);
  const email = findValue(['email_algemeen', 'email_publiek', 'email']);
  const kvk = findValue(['kvk_nummer', 'kvk', 'chamber_of_commerce']);
  const btw = findValue(['btw_nummer', 'btw', 'vat_number']);

  return (
    <footer className="py-20 bg-slate-950 text-slate-400 border-t border-white/5" data-dock-section="footer">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          
          {/* Kolom 1: Branding & Missie */}
          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold text-white tracking-tight">
              <span data-dock-type="text" data-dock-bind="basisgegevens.0.naam.key">{naam.value || 'Athena Project'}</span>
            </h3>
            <div className="h-1 w-12 bg-accent rounded-full"></div>
            <p className="text-sm leading-relaxed max-w-xs">
              Gerealiseerd met Athena CMS Factory. Wetenschappelijk onderbouwde innovatie in tandheelkunde.
            </p>
          </div>

          {/* Kolom 2: Direct Contact */}
          <div className="space-y-6">
            <h4 className="text-sm uppercase font-black tracking-[0.2em] text-accent">Contact</h4>
            <ul className="space-y-4">
              {adres.value && (
                <li className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <i className="fa-solid fa-location-dot text-accent text-xs"></i>
                  </div>
                  <span className="text-sm group-hover:text-white transition-colors cursor-pointer" data-dock-type="text" data-dock-bind="basisgegevens.0.adres.key">{...}</span>
            </svg>
            <span className="text-[11px] font-serif font-bold italic tracking-tight text-white">Athena CMS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}