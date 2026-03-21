import React from 'react';

/**
 * 🌍 LanguageSwitcher
 * @description Allows users to toggle between different languages.
 */
const LanguageSwitcher = ({ currentLang, languages, onLangChange }) => {
  if (!languages || languages.length <= 1) return null;

  return (
    <div className="athena-lang-switcher flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700">
      {languages.map(lang => (
        <button
          key={lang}
          onClick={() => onLangChange(lang)}
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            currentLang === lang 
            ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
