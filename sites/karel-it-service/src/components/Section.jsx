
import React from 'react';
import Hero from './Hero';
import About from './About';
import Features from './Features';
import Testimonials from './Testimonials';
import Contact from './Contact';


function Section({ data }) {
  if (!data) return <div className="p-20 text-center font-bold text-slate-400">Loading data...</div>;

  return (
    <div className="sections-wrapper">
      <div data-dock-section="hero">
        <Hero data={data.hero} sectionName="hero" />
      </div>
      <div data-dock-section="over_ons">
        <About data={data.over_ons} sectionName="over_ons" />
      </div>
      <div data-dock-section="features">
        <Features data={data.features} sectionName="features" />
      </div>
      <div data-dock-section="testimonials">
        <Testimonials data={data.testimonials} sectionName="testimonials" />
      </div>
      <div data-dock-section="contact">
        <Contact data={data.contact} sectionName="contact" />
      </div>
    </div>
  );
}

export default Section;
