import React, { useEffect } from 'react';

export function StyleInjector({ config = {} }) {
  useEffect(() => {
    const root = document.documentElement;
    if (config.primary_color) root.style.setProperty('--athena-primary', config.primary_color);
    if (config.secondary_color) root.style.setProperty('--athena-secondary', config.secondary_color);
  }, [config]);
  return null;
}
