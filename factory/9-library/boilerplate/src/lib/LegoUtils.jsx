import React from 'react';

/**
 * 🧱 LegoUtils v9.1
 * Helps components handle complex Dock data objects and standard HTML binding.
 */

/**
 * useLego hook
 * Processes a data field (which could be a string or a Dock Style Object)
 * and returns clean content and a style object.
 */
export const useLego = (data, fieldName, fallback = "") => {
  const rawValue = data?.[fieldName];
  
  if (!rawValue) return { content: fallback, style: {}, bind: fieldName };

  // If it's a simple string (legacy or simple sheet data)
  if (typeof rawValue === 'string') {
    return { content: rawValue, style: {}, bind: fieldName };
  }

  // If it's a Dock Style Object
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

  // Content extraction (handles multiple common naming conventions)
  const content = rawValue.text ?? rawValue.title ?? rawValue.label ?? rawValue.value ?? fallback;

  return { 
    content, 
    style, 
    bind: fieldName 
  };
};

/**
 * bindProps helper
 * Returns an object with data-dock-bind and optional style.
 * Usage: <h1 {...bindProps(useLego(data, 'titel'))}>{content}</h1>
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
