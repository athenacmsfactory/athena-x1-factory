import React, { useState, useEffect } from 'react';

/**
 * 🧱 LayoutManager
 * @description Centralized UI for managing site structure (reordering, adding, deleting sections).
 */
const LayoutManager = ({ sectionOrder, onReorder, onAdd, onDelete, onDuplicate, onToggleVisibility, sectionSettings, onClose, onApplyPreset, onSaveAsPreset }) => {
  const [list, setList] = useState(sectionOrder || []);
  const [activeTab, setActiveTab] = useState('manual');
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    fetch('/api/system/layout-presets')
        .then(res => res.json())
        .then(data => setPresets(data.presets || []))
        .catch(e => console.error(e));
  }, []);

  const move = (index, direction) => {
    const newList = [...list];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setList(newList);
    onReorder(newList);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">Layout Builder</h3>
            <div className="flex gap-4 mt-3">
                <button 
                    onClick={() => setActiveTab('manual')}
                    className={`text-[9px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'manual' ? 'border-blue-500 text-slate-800 dark:text-white' : 'border-transparent text-slate-400'}`}
                >
                    Huidige Layout
                </button>
                <button 
                    onClick={() => setActiveTab('presets')}
                    className={`text-[9px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'presets' ? 'border-blue-500 text-slate-800 dark:text-white' : 'border-transparent text-slate-400'}`}
                >
                    Snelstart Presets
                </button>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-slate-50/50 dark:bg-transparent">
          {activeTab === 'manual' ? (
            list.map((section, index) => {
                const settings = sectionSettings[section] || {};
                const isVisible = settings.visible !== false && settings.hidden !== true;

                return (
                <div 
                    key={`${section}-${index}`}
                    className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        !isVisible ? 'bg-slate-100/50 dark:bg-slate-800/30 border-dashed border-slate-300 dark:border-slate-700 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md'
                    }`}
                >
                    <div className="flex flex-col gap-1">
                        <button onClick={() => move(index, -1)} disabled={index === 0} className="text-slate-300 hover:text-blue-500 disabled:opacity-0 transition-colors">
                            <i className="fa-solid fa-caret-up"></i>
                        </button>
                        <button onClick={() => move(index, 1)} disabled={index === list.length - 1} className="text-slate-300 hover:text-blue-500 disabled:opacity-0 transition-colors">
                            <i className="fa-solid fa-caret-down"></i>
                        </button>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-black text-xs uppercase tracking-tight text-slate-700 dark:text-white truncate">
                            {section.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-mono">ID: {section}</p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => onDuplicate(section)}
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Dupliceren"
                        >
                            <i className="fa-solid fa-copy text-sm"></i>
                        </button>
                        <button 
                            onClick={() => onToggleVisibility(section, isVisible)}
                            className={`p-2 rounded-lg transition-colors ${!isVisible ? 'text-amber-500 bg-amber-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            title={isVisible ? "Verbergen" : "Tonen"}
                        >
                            <i className={`fa-solid ${isVisible ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                        </button>
                        <button 
                            onClick={() => onDelete(section)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Verwijderen"
                        >
                            <i className="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
                );
            })
          ) : (
            <div className="grid gap-4">
                {presets.map(preset => (
                    <button
                        key={preset.id}
                        onClick={() => onApplyPreset(preset.id)}
                        className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-left hover:border-blue-500 transition-all group"
                    >
                        <h4 className="font-black text-xs uppercase text-slate-800 dark:text-white mb-1">{preset.name}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-4">{preset.description}</p>
                        <div className="flex gap-1 flex-wrap">
                            {preset.order.map(s => (
                                <span key={s} className="text-[8px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded uppercase font-bold text-slate-400">{s}</span>
                            ))}
                        </div>
                    </button>
                ))}
            </div>
          )}
        </div>

        {activeTab === 'manual' && (
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <input 
                    type="text" 
                    placeholder="Naam voor deze preset..." 
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-blue-500"
                />
                <button 
                    onClick={() => { if (presetName) { onSaveAsPreset(presetName); setPresetName(''); } }}
                    disabled={!presetName}
                    className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30"
                >
                    Opslaan
                </button>
            </div>
        )}

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button 
                onClick={onAdd}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
                <i className="fa-solid fa-plus text-sm"></i>
                Nieuwe Sectie Toevoegen
            </button>
        </div>
      </div>
    </div>
  );
};

export default LayoutManager;
