import React, { useState } from 'react';

/**
 * 🧩 FieldConfigModal
 * @description Allows users to toggle visibility of individual fields within a section.
 */
const FieldConfigModal = ({ sectionName, currentConfig, onSave, onClose }) => {
  const [config, setConfig] = useState(currentConfig || {});

  const toggleField = (field) => {
    setConfig(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = () => {
    onSave(sectionName, config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col animate-in zoom-in duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">Velden Beheren</h3>
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Sectie: {sectionName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
          {Object.entries(config).length > 0 ? (
            Object.entries(config).map(([field, isVisible]) => (
              <div key={field} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">{field.replace(/_/g, ' ')}</span>
                <button
                  onClick={() => toggleField(field)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isVisible ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isVisible ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400 italic py-10 text-xs">Geen veld-configuratie gevonden voor deze sectie.</p>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={handleSave}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
          >
            Configuratie Opslaan
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldConfigModal;
