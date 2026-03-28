import React, { useEffect } from 'react';

/**
 * ⚓ DockConnector v9.0
 * Minimalistic bridge for Lego projects.
 * Listen for updates from the Athena Dock and update local state.
 */
const DockConnector = ({ data, setData }) => {
  useEffect(() => {
    const handleMessage = (event) => {
      const { type, file, index, key, value } = event.data;

      if (type === 'DOCK_REQUEST_SYNC') {
          // Send current state back to Dock
          const val = data[file]?.[index]?.[key] || data[file]?.[key] || "";
          window.parent.postMessage({
              type: 'SITE_SYNC_RESPONSE',
              key,
              value: val
          }, '*');
      }

      if (type === 'DOCK_UPDATE_TEXT' || type === 'DOCK_UPDATE_COLOR') {
        setData(prev => {
          const newData = { ...prev };
          if (Array.isArray(newData[file])) {
            newData[file] = [...newData[file]];
            newData[file][index] = { ...newData[file][index], [key]: value };
          } else if (newData[file]) {
            newData[file] = { ...newData[file], [key]: value };
          }
          return newData;
        });
      }
      
      if (type === 'DOCK_UPDATE_SECTION_ORDER') {
          setData(prev => ({ ...prev, section_order: value }));
      }
    };

    window.addEventListener('message', handleMessage);

    // --- CLICK HANDLING (Shift+Click to edit) ---
    const handleClick = (e) => {
        const target = e.target.closest('[data-dock-bind]');
        if (target && window.parent !== window) {
            if (!e.shiftKey) return;

            e.preventDefault();
            e.stopPropagation();

            const bindStr = target.getAttribute('data-dock-bind');
            const parts = bindStr.split('.');
            const binding = {
                file: parts[0],
                index: parseInt(parts[1], 10),
                key: parts.slice(2).join('.')
            };

            const dockType = target.getAttribute('data-dock-type') || (
                (binding.key && (binding.key.toLowerCase().includes('foto') ||
                    binding.key.toLowerCase().includes('image') ||
                    binding.key.toLowerCase().includes('img') ||
                    binding.key.toLowerCase().includes('afbeelding') ||
                    binding.key.toLowerCase().includes('video'))) ? 'media' : 'text'
            );

            let currentValue = target.getAttribute('data-dock-current') || target.innerText;

            if (dockType === 'media') {
                const img = target.tagName === 'IMG' ? target : target.querySelector('img');
                if (img) {
                    const src = img.getAttribute('src');
                    if (src && src.includes('/images/')) {
                        currentValue = src.split('/images/').pop().split('?')[0];
                    } else {
                        currentValue = src;
                    }
                }
            }

            window.parent.postMessage({
                type: 'SITE_CLICK',
                binding: binding,
                currentValue: currentValue || "",
                tagName: target.tagName,
                dockType: dockType
            }, '*');
        }
    };

    document.addEventListener('click', handleClick, true);

    // Notify Dock we are ready
    const notifyReady = () => {
        window.parent.postMessage({
            type: 'SITE_READY',
            structure: {
                sections: data.section_order || [],
                data: data,
                url: window.location.href,
                timestamp: Date.now()
            }
        }, '*');
    };

    const timer = setTimeout(notifyReady, 500);
    return () => {
        window.removeEventListener('message', handleMessage);
        document.removeEventListener('click', handleClick, true);
        clearTimeout(timer);
    };
  }, [data, setData]);

  return null; // Component renders nothing
};

export default DockConnector;
