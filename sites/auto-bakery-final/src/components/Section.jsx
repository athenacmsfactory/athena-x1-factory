import { useEffect } from 'react';
import GenericSection from './GenericSection';
import Hero from './Hero';
import AboutSection from './AboutSection';
import ProductGrid from './ProductGrid';

const Section = ({ data }) => {
  const sectionOrder = data.section_order || [];
  const layoutSettings = data.layout_settings || {};

  useEffect(() => {
    if (window.athenaScan) {
      window.athenaScan(data);
    }
  }, [data, sectionOrder]);

  const getComponent = (sectionName) => {
      const lower = sectionName.toLowerCase();

      if (lower === 'basis' || lower === 'basisgegevens' || lower === 'hero') return Hero;
      if (lower.includes('about') || lower.includes('info')) return AboutSection;
      if (lower.includes('product') || lower.includes('shop') || lower.includes('dienst') || lower.includes('feature') || lower.includes('services')) return ProductGrid;
      
      return GenericSection;
  };

  return (
    <div className="flex flex-col">
      {sectionOrder.map((sectionName, idx) => {
        const items = data[sectionName] || [];
        if (items.length === 0) return null;
        
        const Component = getComponent(sectionName);
        const layout = layoutSettings[sectionName] || 'list';
        const sectionSettings = data.section_settings?.[sectionName] || {};
        const sectionBgColor = sectionSettings.backgroundColor || null;
        const sectionStyle = sectionBgColor ? { backgroundColor: sectionBgColor } : {};

        return (
            <Component 
                key={idx} 
                sectionName={sectionName} 
                data={items} 
                layout={layout}
                style={sectionStyle}
                features={{}} 
            />
        );
      })}
    </div>
  );
};

export default Section;