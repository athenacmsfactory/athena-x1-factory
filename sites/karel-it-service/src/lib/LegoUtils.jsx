import React from 'react';

/**
 * 🧱 LegoUtils v9.2 (Evolution Standard)
 * Centralized logic for Athena v9.x components.
 */

/**
 * getImageUrl helper
 * Safely resolves image paths for both external and local assets.
 */
export const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  // Clean path by removing any leading slashes
  const cleanPath = path.replace(/^\//, '');
  
  // Use Vite's BASE_URL for proper sub-path resolution in Dashboard previews
  const baseUrl = import.meta.env.BASE_URL || "/";
  
  // If it's a simple filename, assume it's in the images/ directory
  if (!cleanPath.includes('/')) {
    return `${baseUrl}images/${cleanPath}`;
  }
  
  return `${baseUrl}${cleanPath}`;
};

/**
 * useLego hook
 * Processes a data field (which could be a string or a Dock Style Object)
 */
export const useLego = (data, fieldName, fallback = "") => {
  const rawValue = data?.[fieldName];
  
  if (!rawValue) return { content: fallback, style: {}, bind: fieldName };

  if (typeof rawValue === 'string') {
    return { content: rawValue, style: {}, bind: fieldName };
  }

  const style = {
    color: rawValue.color,
    fontSize: rawValue.fontSize ? (typeof rawValue.fontSize === 'number' ? `${rawValue.fontSize}px` : rawValue.fontSize) : undefined,
    fontWeight: rawValue.fontWeight,
    fontStyle: rawValue.fontStyle,
    fontFamily: rawValue.fontFamily,
    textAlign: rawValue.textAlign,
    paddingTop: rawValue.paddingTop ? `${rawValue.paddingTop}px` : undefined,
    paddingBottom: rawValue.paddingBottom ? `${rawValue.paddingBottom}px` : undefined,
    textShadow: rawValue.shadowBlur > 0 ? `${rawValue.shadowX}px ${rawValue.shadowY}px ${rawValue.shadowBlur}px ${rawValue.shadowColor}` : undefined,
  };

  const content = rawValue.text ?? rawValue.title ?? rawValue.label ?? rawValue.value ?? fallback;

  return { content, style, bind: fieldName };
};

/**
 * bindProps helper
 * Returns an object with data-dock-bind and optional style.
 */
export const bindProps = (legoResult, sectionName, index = 0, type = 'text') => {
  const { bind, style, content } = legoResult;
  return {
    'data-dock-bind': `${sectionName}.${index}.${bind}`,
    'data-dock-type': type,
    'data-dock-current': typeof content === 'string' ? content : "",
    style: Object.keys(style).length > 0 ? style : undefined
  };
};
