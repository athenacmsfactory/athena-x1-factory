/**
 * ⚓ Athena Dock Connector v8.5 (Universal - Docked Track)
 * Handles communication between the generated site (iframe) and the Athena Dock (parent).
 * Updated for the Section Manager and Advanced Styling tools.
 */
(function () {
    console.log("⚓ Athena Dock Connector v8.5 Active");

    let lastKnownData = null;

    const getApiUrl = (path) => {
        const base = import.meta.env.BASE_URL || '/';
        return (base + '/' + path).replace(new RegExp('/+', 'g'), '/');
    };

    const parseBinding = (bindStr) => {
        if (!bindStr) return {};
        try {
            if (bindStr.startsWith('{')) return JSON.parse(bindStr);
            const parts = bindStr.split('.');
            if (parts.length >= 3) {
                return {
                    file: parts[0],
                    index: parseInt(parts[1], 10),
                    key: parts.slice(2).join('.')
                };
            }
            return { key: bindStr };
        } catch(e) {
            console.warn("Athena: Binding parse error", bindStr);
            return {};
        }
    };

    const themeMappings = {
        light: {
            'light_primary_color': ['--color-primary'],
            'light_accent_color': ['--color-accent'],
            'light_button_color': ['--color-button-bg'],
            'light_card_color': ['--color-card-bg'],
            'light_header_color': ['--color-header-bg'],
            'light_bg_color': ['--color-background'],
            'light_text_color': ['--color-text']
        },
        dark: {
            'dark_primary_color': ['--color-primary'],
            'dark_accent_color': ['--color-accent'],
            'dark_button_color': ['--color-button-bg'],
            'dark_card_color': ['--color-card-bg'],
            'dark_header_color': ['--color-header-bg'],
            'dark_bg_color': ['--color-background'],
            'dark_text_color': ['--color-text']
        }
    };

    function scanSections() {
        const sections = [];
        const sectionElements = document.querySelectorAll('[data-dock-section]');
        sectionElements.forEach(el => {
            sections.push(el.getAttribute('data-dock-section'));
        });
        return sections;
    }

    function notifyDock(fullData = null) {
        if (fullData) lastKnownData = fullData;
        const structure = {
            sections: scanSections(),
            layouts: lastKnownData?.layout_settings?.[0] || lastKnownData?.layout_settings || {},
            data: lastKnownData || {},
            url: window.location.href,
            currentPath: window.location.pathname.replace(import.meta.env.BASE_URL, '') || '/',
            timestamp: Date.now()
        };
        window.parent.postMessage({ type: 'SITE_READY', structure }, '*');
    }

    window.addEventListener('message', async (event) => {
        const { type, key, value, section, config, file, index } = event.data;

        // --- 🎨 STYLE UPDATES ---
        if (type === 'DOCK_UPDATE_COLOR') {
            const isDark = document.documentElement.classList.contains('dark');
            const currentTheme = isDark ? 'dark' : 'light';

            // Global Variables
            if (key === 'header_hoogte' || key === 'header_height') {
                document.documentElement.style.setProperty('--header-height', value + 'px');
            } else if (key === 'header_transparantie' || key === 'header_opacity') {
                document.documentElement.style.setProperty('--header-opacity', value);
            } else if (key === 'content_top_offset') {
                document.documentElement.style.setProperty('--content-top-offset', value + 'px');
            } else if (key === 'hero_overlay_transparantie') {
                document.documentElement.style.setProperty('--hero-overlay-opacity', value);
            } else if (key === 'hero_hoogte') {
                document.documentElement.style.setProperty('--hero-height', value + 'px');
            } else if (key === 'hero_alignment') {
                document.documentElement.style.setProperty('--hero-align', value);
            } else if (key === 'header_visible') {
                const nav = document.querySelector('nav');
                if (nav) nav.style.display = value === false ? 'none' : 'flex';
            }

            // Theme colors
            const targetTheme = key.startsWith('dark') ? 'dark' : 'light';
            const vars = themeMappings[currentTheme][key];
            if (vars && targetTheme === currentTheme) {
                vars.forEach(v => document.documentElement.style.setProperty(v, value));
            }
        }

        // --- 🏗️ STRUCTURE UPDATES ---
        if (type === 'DOCK_UPDATE_SECTION_VISIBILITY') {
            const el = document.querySelector(`[data-dock-section="${section}"]`);
            if (el) el.style.display = value === false ? 'none' : '';
        }

        if (type === 'DOCK_UPDATE_SECTION_PADDING') {
            const el = document.querySelector(`[data-dock-section="${section}"]`);
            if (el) el.style.setProperty('--section-padding-y', value + 'px');
        }

        if (type === 'DOCK_UPDATE_LAYOUT') {
            // Layout changes usually require a re-render, so we trigger a refresh or let the app handle it
            console.log("📐 Layout change detected:", section, value);
            // If the app is using v8.1 Reactive Data, it will auto-update.
        }

        if (type === 'DOCK_UPDATE_SECTION_CONFIG') {
            console.log("⚙️ Section Config updated:", file, config);
            // This is handled reactively by the App if connected to the bridge.
        }

        if (type === 'DOCK_TRIGGER_REFRESH' || type === 'DOCK_UPDATE_SECTION_ORDER') {
            window.location.reload();
        }

        // --- 📝 CONTENT UPDATES ---
        if (type === 'DOCK_UPDATE_TEXT') {
            const elements = document.querySelectorAll(`[data-dock-bind]`);
            elements.forEach(el => {
                const elBind = parseBinding(el.getAttribute('data-dock-bind'));
                if (elBind.file !== file || elBind.index !== index || elBind.key !== key) return;

                const dockType = el.getAttribute('data-dock-type') || 'text';
                if (dockType === 'media') {
                    const mediaEl = el.tagName === 'IMG' ? el : el.querySelector('img');
                    if (mediaEl) mediaEl.src = value.startsWith('http') ? value : `${import.meta.env.BASE_URL}images/${value}`.replace(/\/+/g, '/');
                } else if (dockType === 'link') {
                    const { label } = (typeof value === 'object') ? value : { label: value };
                    el.innerText = label || "";
                } else {
                    el.innerText = (typeof value === 'object') ? (value.text || "") : value;
                }
            });
        }
    });

    // Notify dock when ready
    if (document.readyState === 'complete') notifyDock();
    else window.addEventListener('load', () => notifyDock());

    window.athenaScan = notifyDock;

    // Interaction logic (Shift+Click)
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-dock-bind]');
        if (target && window.parent !== window && e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();

            const binding = parseBinding(target.getAttribute('data-dock-bind'));
            const dockType = target.getAttribute('data-dock-type') || 'text';
            let currentValue = target.getAttribute('data-dock-current') || target.innerText;

            if (dockType === 'link') {
                currentValue = { label: target.innerText, url: target.getAttribute('data-dock-url') || "" };
            }

            window.parent.postMessage({
                type: 'SITE_CLICK',
                binding,
                currentValue,
                dockType
            }, '*');
        }
    }, true);

})();
