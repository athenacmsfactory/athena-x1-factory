import React from 'react';

const IconMenu = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>;
const IconArrow = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;

function ModernHeader({ data, sectionName = 'header' }) {
  const menu = data || [
    { label: 'Diensten', anchor: '#features' },
    { label: 'Cases', anchor: '#testimonials' },
    { label: 'Contact', anchor: '#contact' }
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-2xl border-b border-white/20">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic">A</div>
          <span 
            className="text-xl font-black tracking-tighter text-slate-900"
            data-dock-bind={`${sectionName}.0.site_name`}
          >
            ATHENA
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-10">
          {menu.map((item, i) => (
            <a 
              key={i} 
              href={item.anchor} 
              className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-widest"
              data-dock-bind={`${sectionName}.${i}.label`}
            >
              {item.label}
            </a>
          ))}
          <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all group">
            Start Project <IconArrow />
          </button>
        </nav>
...
        <button className="md:hidden text-slate-900">
          <IconMenu />
        </button>
      </div>
    </header>
  );
}

export default ModernHeader;
