import { createContext, useContext, useEffect, useState } from 'react';

const StyleContext = createContext();

export const useStyles = () => useContext(StyleContext);

/**
 * StyleProvider for docked track.
 * Reads style_config from data and applies CSS variables to :root.
 * Dock can override these variables via postMessage.
 */
export const StyleProvider = ({ children, data = {} }) => {
    const styleConfig = Array.isArray(data.style_config)
        ? (data.style_config[0] || {})
        : (data.style_config || {});

    const [styles, setStyles] = useState(styleConfig);

    // Apply CSS variables to :root whenever styles change
    useEffect(() => {
        const root = document.documentElement;
        
        const applyVariables = (targetStyles, selector = '') => {
            Object.entries(targetStyles).forEach(([key, value]) => {
                if (key.startsWith('_')) return; // Skip metadata
                
                let propertyName = key;
                if (key.startsWith('--')) {
                    propertyName = key;
                } else if (key === 'font_heading') {
                    propertyName = '--font-heading';
                } else if (key === 'font_body') {
                    propertyName = '--font-body';
                } else if (key === 'font_base_size') {
                    propertyName = '--font-base-size';
                } else if (key === 'button_radius') {
                    propertyName = '--button-radius';
                } else if (key === 'button_style') {
                    propertyName = '--button-style';
                } else if (!key.includes('_')) {
                    return; // Skip non-CSS keys unless mapped
                }

                if (selector === '.dark') {
                    if (root.classList.contains('dark')) {
                        root.style.setProperty(propertyName, value);
                    }
                } else {
                    root.style.setProperty(propertyName, value);
                }
            });
        };

        // Apply light/default variables
        applyVariables(styles);

        // Apply dark mode overrides if present and active
        if (styles._dark_mode && root.classList.contains('dark')) {
            applyVariables(styles._dark_mode);
        }

        // Add a mutation observer to re-apply if .dark class is toggled
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    applyVariables(styles);
                    if (styles._dark_mode && root.classList.contains('dark')) {
                        applyVariables(styles._dark_mode);
                    }
                }
            });
        });

        observer.observe(root, { attributes: true });

        return () => {
            observer.disconnect();
            // Cleanup: remove custom properties on unmount
            Object.keys(styles).forEach(key => {
                if (key.startsWith('--')) root.style.removeProperty(key);
            });
            if (styles._dark_mode) {
                Object.keys(styles._dark_mode).forEach(key => {
                    if (key.startsWith('--')) root.style.removeProperty(key);
                });
            }
        };
    }, [styles]);

    // Listen for Dock style updates via postMessage
    useEffect(() => {
        const handler = (event) => {
            if (event.data?.type === 'athena-style-update' && event.data.styles) {
                setStyles(prev => ({ ...prev, ...event.data.styles }));
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    return (
        <StyleContext.Provider value={{ styles, setStyles }}>
            {children}
        </StyleContext.Provider>
    );
};

export default StyleContext;
