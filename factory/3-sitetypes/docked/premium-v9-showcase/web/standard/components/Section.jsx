import React from 'react';
import HeroV9 from './HeroV9';
import BentoGrid from './BentoGrid';

/**
 * Section Renderer for premium-v9-showcase
 * Maps blueprint section IDs to the correct premium components.
 */
export default function Section({ data }) {
  const sectionOrder = data.section_order || [];
  
  return (
    <div className="flex flex-col">
      {sectionOrder.map((sectionId, idx) => {
        const sectionData = data[sectionId];
        if (!sectionData) return null;

        // Map sectionId/type to components
        if (sectionId === 'hero_v9') {
          return <HeroV9 key={idx} data={sectionData[0]} sectionName={sectionId} />;
        }
        
        if (sectionId === 'bento_grid') {
          return <BentoGrid key={idx} data={sectionData[0]} sectionName={sectionId} />;
        }

        return null;
      })}
    </div>
  );
}
