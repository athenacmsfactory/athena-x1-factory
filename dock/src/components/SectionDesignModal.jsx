import React, { useState } from 'react';

/**
 * 🎨 SectionDesignModal
 * @description Manual styling controls for a specific section.
 */
const SectionDesignModal = ({ sectionName, currentSettings, currentLayout, onSave, onClose }) => {
  const [settings, setSettings] = useState({
    backgroundColor: currentSettings?.backgroundColor || '#ffffff',
    paddingTop: currentSettings?.paddingTop || '96px', // Default 24 (6 * 4)
    paddingBottom: currentSettings?.paddingBottom || '96px',
    borderRadius: currentSettings?.borderRadius || '0px',
    alignment: currentSettings?.alignment || 'left',
    layout: currentLayout || 'list',
    ...currentSettings
  });

  const handleSave = () => {
    onSave(sectionName, settings);
    onClose();
  };

  const parsePadding = (val) => parseInt(val) || 0;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col animate-in zoom-in duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">Sectie Ontwerp</h3>
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Beheer styling voor: {sectionName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          {/* Color Picker */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Achtergrondkleur</label>
            <div className="flex items-center gap-4">
                <input 
                    type="color" 
                    value={settings.backgroundColor} 
                    onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-16 h-16 rounded-2xl cursor-pointer bg-transparent border-2 border-slate-100 dark:border-slate-800"
                />
                <input 
                    type="text" 
                    value={settings.backgroundColor} 
                    onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl p-4 text-sm font-mono"
                />
            </div>
          </div>

          {/* Padding Sliders */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center block">Padding Boven ({parsePadding(settings.paddingTop)}px)</label>
                <input 
                    type="range" min="0" max="300" step="4"
                    value={parsePadding(settings.paddingTop)}
                    onChange={(e) => setSettings(prev => ({ ...prev, paddingTop: `${e.target.value}px` }))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none accent-blue-600"
                />
            </div>
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center block">Padding Onder ({parsePadding(settings.paddingBottom)}px)</label>
                <input 
                    type="range" min="0" max="300" step="4"
                    value={parsePadding(settings.paddingBottom)}
                    onChange={(e) => setSettings(prev => ({ ...prev, paddingBottom: `${e.target.value}px` }))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none accent-blue-600"
                />
            </div>
          </div>

          {/* Alignment */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Uitlijning Content</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {['left', 'center', 'right'].map(align => (
                    <button
                        key={align}
                        onClick={() => setSettings(prev => ({ ...prev, alignment: align }))}
                        className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${settings.alignment === align ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {align}
                    </button>
                ))}
            </div>
          </div>

          {/* Border Radius */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Hoek-afronding ({parsePadding(settings.borderRadius)}px)</label>
            <input 
                type="range" min="0" max="100" step="2"
                value={parsePadding(settings.borderRadius)}
                onChange={(e) => setSettings(prev => ({ ...prev, borderRadius: `${e.target.value}px` }))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none accent-blue-600"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={handleSave}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
          >
            Stijl Toepassen
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionDesignModal;
