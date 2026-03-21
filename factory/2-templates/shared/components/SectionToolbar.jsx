import React from 'react';

/**
 * 🛠️ SectionToolbar
 * @description Provides administrative controls for a section within the Athena Dock.
 */
const SectionToolbar = ({ sectionName, isVisible, onToggleVisibility, onMoveUp, onMoveDown, onDelete }) => {
    return (
        <div className="athena-section-toolbar absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 flex items-center gap-1 bg-slate-900 border border-slate-700 p-1 rounded-t-lg shadow-2xl pointer-events-auto">
            <div className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-800 mr-1">
                {sectionName.replace(/_/g, ' ')}
            </div>
            
            <button 
                onClick={() => onMoveUp()}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                title="Omhoog verplaatsen"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
            </button>

            <button 
                onClick={() => onMoveDown()}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                title="Omlaag verplaatsen"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>

            <div className="w-px h-4 bg-slate-800 mx-1"></div>

            <button 
                onClick={() => {
                    window.parent.postMessage({ type: 'CONFIGURE_FIELDS', sectionName }, '*');
                }}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                title="Velden beheren"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            </button>

            <button 
                onClick={() => {
                    window.parent.postMessage({ type: 'DESIGN_SECTION', sectionName }, '*');
                }}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                title="Handmatig ontwerpen"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
            </button>

            <button 
                onClick={() => {
                    const goal = window.prompt("Wat is het doel van de redesign?", "Maak het moderner en ruimer");
                    if (goal) {
                        window.parent.postMessage({ type: 'AI_REDESIGN_SECTION', sectionName, goal }, '*');
                    }
                }}
                className="p-1.5 hover:bg-purple-900/30 text-slate-400 hover:text-purple-400 rounded transition-colors"
                title="Sectie herontwerpen met AI"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.022l1.414 1.414a2 2 0 001.022.547l2.387.477a2 2 0 001.96-1.414l.477-2.387a2 2 0 00-.547-1.022l-1.414-1.414z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.828 14.172a4 2 0 115.656 2.828 4 2 0 01-5.656-2.828z"/></svg>
            </button>

            <button 
                onClick={() => {
                    const newName = window.prompt("Nieuwe naam voor deze sectie:", sectionName);
                    if (newName && newName !== sectionName) {
                        window.parent.postMessage({ type: 'RENAME_SECTION', oldName: sectionName, newName }, '*');
                    }
                }}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                title="Sectie hernoemen"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>

            <button 
                onClick={() => {
                    if (window.confirm("A/B Test starten voor deze sectie? AI genereert twee varianten.")) {
                        window.parent.postMessage({ type: 'AI_AB_TEST_SECTION', sectionName }, '*');
                    }
                }}
                className="p-1.5 hover:bg-blue-900/30 text-slate-400 hover:text-blue-400 rounded transition-colors"
                title="A/B Test starten"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </button>

            <div className="w-px h-4 bg-slate-800 mx-1"></div>

            <button 
                onClick={() => onToggleVisibility()}
                className={`p-1.5 rounded transition-colors ${!isVisible ? 'bg-amber-900/30 text-amber-500' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                title={isVisible ? "Sectie verbergen" : "Sectie tonen"}
            >
                {isVisible ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
                )}
            </button>

            <button 
                onClick={() => {
                    window.parent.postMessage({ type: 'DUPLICATE_SECTION', sectionName }, '*');
                }}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                title="Sectie dupliceren"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
            </button>

            <button 
                onClick={() => {
                    if (window.confirm(`Sectie '${sectionName}' verwijderen?`)) {
                        window.parent.postMessage({ type: 'DELETE_SECTION', sectionName }, '*');
                    }
                }}
                className="p-1.5 hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded transition-colors"
                title="Sectie verwijderen"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
        </div>
    );
};

export default SectionToolbar;
