import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('fr') ? 'en' : 'fr';
    i18n.changeLanguage(nextLang);
  };

  const currentLang = i18n.language.startsWith('fr') ? 'FR' : 'EN';

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 h-[46px] bg-white border border-[#E5E1DA] rounded-2xl text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:border-[#C5A880] transition-all shadow-sm hover:scale-105 active:scale-95"
    >
      <Globe className="w-4 h-4 text-[#C5A880]" />
      <span>{currentLang}</span>
    </button>
  );
}
