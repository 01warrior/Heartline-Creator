import React from 'react';
import { Loader2, X } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { FeatherIcon } from '@hugeicons/core-free-icons';
import { useTranslation } from 'react-i18next';

type SuggestionsModalProps = {
  isOpen: boolean;
  suggestions: string[];
  isSuggesting: boolean;
  onClose: () => void;
  onSelect: (suggestion: string) => void;
  onRefresh: () => void;
};

export function SuggestionsModal({
  isOpen,
  suggestions,
  isSuggesting,
  onClose,
  onSelect,
  onRefresh
}: SuggestionsModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#FAF9F7] w-full max-w-lg p-8 rounded-3xl border border-[#E5E1DA] shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-sans font-bold text-[#1A1A1A]">{t('studio.aiSuggestions')}</h2>
            <p className="text-[#A8A196] text-xs font-bold uppercase tracking-widest mt-1">{t('studio.themePick')}</p>
          </div>
          <button onClick={onClose} className="text-[#A8A196] hover:text-[#1A1A1A] transition-colors p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid gap-3">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(suggestion)}
              className="w-full text-left p-5 bg-white border border-[#E5E1DA] rounded-2xl hover:border-[#C5A880] hover:bg-[#FAF9F7] transition-all group relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E5E1DA] group-hover:bg-[#C5A880] transition-colors"></div>
              <span className="text-[#1A1A1A] font-medium block">{suggestion}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onRefresh}
          disabled={isSuggesting}
          className="w-full py-4 border border-dashed border-[#C5A880] text-[#C5A880] rounded-2xl font-bold text-sm hover:bg-[#C5A880]/5 transition-colors flex items-center justify-center gap-2"
        >
          {isSuggesting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <HugeiconsIcon icon={FeatherIcon} className="w-4 h-4" color="currentColor" strokeWidth={2.25} />
          )}
          {t('studio.btnMoreIdeas')}
        </button>
      </div>
    </div>
  );
}
