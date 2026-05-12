import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';

type ErrorState = { title: string; message: string } | null;

type ErrorModalProps = {
  error: ErrorState;
  onClose: () => void;
};

export function ErrorModal({ error, onClose }: ErrorModalProps) {
  const { t } = useTranslation();

  if (!error) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl space-y-6 animate-in zoom-in-95 duration-300 border border-red-100">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-sans font-bold text-[#1A1A1A]">{error.title}</h2>
            <p className="text-[#7A7570] text-sm mt-2 leading-relaxed">
              {error.message}
            </p>
          </div>
        </div>

        <div className="bg-[#FAF9F7] p-4 rounded-2xl border border-[#E5E1DA]">
          <p className="text-[11px] font-bold text-[#A8A196] uppercase tracking-wider mb-2">{t('studio.howToSolve')}</p>
          <ul className="text-xs text-[#7A7570] space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#C5A880]/10 text-[#C5A880] flex items-center justify-center flex-shrink-0">1</span>
              {t('studio.solve1')}
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#C5A880]/10 text-[#C5A880] flex items-center justify-center flex-shrink-0">2</span>
              {t('studio.solve2')}
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#C5A880]/10 text-[#C5A880] flex items-center justify-center flex-shrink-0">3</span>
              <Trans i18nKey="studio.solve3">
                Ouvrez la **Bibliothèque** pour télécharger les éléments déjà générés !
              </Trans>
            </li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-[#1A1A1A] text-white rounded-full font-bold text-sm hover:bg-black transition-colors"
        >
          {t('studio.btnUnderstood')}
        </button>
      </div>
    </div>
  );
}
