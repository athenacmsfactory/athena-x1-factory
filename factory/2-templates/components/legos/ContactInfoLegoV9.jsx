import React from 'react';

/**
 * Athena V9.2 compliant Contact Info Component
 */
export default function ContactInfoLegoV9({ data = {}, bind = {} }) {
  const {
    tekst_email = 'info@voorbeeld.be',
    tekst_telefoon = '+32 000 00 00',
    tekst_adres = 'Straat 1, Stad'
  } = data;

  return (
    <section 
      className="py-20 px-6 bg-midnight text-white border-t border-slate-900/50"
      data-dock-type="ContactInfoLegoV9"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-12 tracking-tighter">Contact Us</h2>
        <div className="space-y-4 text-lg md:text-xl text-slate-400 font-bold">
          <p data-dock-bind="tekst_email">Email: {tekst_email}</p>
          <p data-dock-bind="tekst_telefoon">Phone: {tekst_telefoon}</p>
          <p data-dock-bind="tekst_adres">Address: {tekst_adres}</p>
        </div>
      </div>
    </section>
  );
}
