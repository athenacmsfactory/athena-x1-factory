import React from 'react';
import { useLego, bindProps } from '../lib/LegoUtils';

const IconMail = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IconPhone = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l.91-1.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconSend = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;

function ContactSection({ data, sectionName = 'contact' }) {
  const item = data?.[0] || {
    email: 'info@athenafactory.be',
    telefoon: '+32 400 00 00 00',
    adres: 'Gent, België'
  };

  const email = useLego(item, 'email', 'info@athenafactory.be');
  const phone = useLego(item, 'telefoon', '+32 400 00 00 00');

  return (
    <section id={sectionName} className="py-24 px-8 bg-slate-900 text-white" data-dock-section={sectionName}>
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20">
        <div>
          <h2 className="text-5xl font-black mb-8 tracking-tighter">Laten we bouwen.</h2>
          <p className="text-slate-400 text-xl mb-12">Klaar om de volgende stap te zetten met de Lego Factory?</p>

          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                <IconMail />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Email ons</p>
                <p 
                  className="font-bold text-lg" 
                  {...bindProps(email, sectionName)}
                >
                  {email.content}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center">
                <IconPhone />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Bel ons</p>
                <p 
                  className="font-bold text-lg" 
                  {...bindProps(phone, sectionName)}
                >
                  {phone.content}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 p-10 rounded-[40px] border border-white/10 backdrop-blur-xl">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-6">
              <input type="text" placeholder="Naam" className="bg-white/10 border border-white/20 rounded-2xl p-4 focus:outline-none focus:border-blue-500 transition-all text-white placeholder-slate-500" />
              <input type="email" placeholder="Email" className="bg-white/10 border border-white/20 rounded-2xl p-4 focus:outline-none focus:border-blue-500 transition-all text-white placeholder-slate-500" />
            </div>
            <textarea placeholder="Bericht" rows="4" className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 focus:outline-none focus:border-blue-500 transition-all text-white placeholder-slate-500"></textarea>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3">
              Verstuur Bericht <IconSend />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
