import React from 'react';
import HeroLegoV9 from './components/legos/HeroLegoV9';
import BenefitsLegoV9 from './components/legos/BenefitsLegoV9';
import TextLegoV9 from './components/legos/TextLegoV9';
import ContactLegoV9 from './components/legos/ContactLegoV9';
import ContactInfoLegoV9 from './components/legos/ContactInfoLegoV9';
import gentseData from './assets/gentse-dakwerken.json';
import './style.css';

function App() {
  return (
    <main className="min-h-screen bg-midnight">
      {/* simulation header */}
      <div className="bg-indigo-600 py-1.5 px-4 text-white text-[10px] font-mono flex justify-between items-center opacity-80">
        <span>ATHENA V9.2 WERKPLAATS / REPLICATIE MODE</span>
        <span>FONT: JETBRAINS_MONO</span>
      </div>
      
      <HeroLegoV9 data={gentseData.hero} />
      
      <div className="relative">
        {/* Glow effecten verwijderd voor een strakkere look */}
        <BenefitsLegoV9 data={gentseData.benefits} />
        <TextLegoV9 data={gentseData.about} />
        <ContactLegoV9 />
        <ContactInfoLegoV9 data={gentseData.contact} />
      </div>
      
      <footer className="py-20 px-6 bg-[#1a1a1a] text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-base md:text-lg">
          <div>
            <h3 className="text-2xl font-bold mb-6">{gentseData.companyName}</h3>
            <p className="text-slate-400">{gentseData.tagline}</p>
          </div>
          <div>
            <h4 className="text-indigo-400 font-bold mb-6 uppercase tracking-widest">Openingsuren</h4>
            <ul className="space-y-3 text-slate-400">
              {gentseData.openingHours.map((item, i) => (
                <li key={i}>
                  <strong className="text-white">{item.day}:</strong> {item.hours}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-indigo-400 font-bold mb-6 uppercase tracking-widest">Contact</h4>
            <p className="text-slate-400 leading-relaxed space-y-2">
              {gentseData.contact.address}<br />
              {gentseData.contact.phone}<br />
              {gentseData.contact.email}
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-10 border-t border-slate-800 text-center text-xs text-slate-600 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} {gentseData.companyName}. All rights reserved.<br />
          <span className="opacity-50 mt-2 block">Powered by Auto-F | Generation 2 AI Factory</span>
        </div>
      </footer>
    </main>
  );
}

export default App;
