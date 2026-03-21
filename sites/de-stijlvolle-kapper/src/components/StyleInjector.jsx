import React, { useEffect } from 'react';

/**
 * 🎨 StyleInjector (Athena v8.1)
 * Injecteert CSS variabelen op basis van de style_config.json
 */
export function StyleInjector({ config = {} }) {
  useEffect(() => {
    const root = document.documentElement;
    
    // Kleuren
    if (config.primary_color) root.style.setProperty('--athena-primary', config.primary_color);
    if (config.secondary_color) root.style.setProperty('--athena-secondary', config.secondary_color);
    if (config.background_color) root.style.setProperty('--athena-bg', config.background_color);
    
    // Spacing
    const topOffset = config.header_height || '0px';
    root.style.setProperty('--content-top-offset', topOffset);
    
  }, [config]);

  return null;
}
