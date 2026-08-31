import React from 'react';
import { useTranslation } from 'react-i18next';

export function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="w-full max-w-7xl mx-auto px-6 py-10 border-t border-[#E5E1DA] flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 text-xs text-[#8C8275]">
      <div className="flex items-center">
        <span className="font-bold text-sm tracking-tight text-[#1A1A1A]">Heartlines</span>
      </div>
      <div className="font-semibold">
        {t('footer.rights')}
      </div>
    </footer>
  );
}
