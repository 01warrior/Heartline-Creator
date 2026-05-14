import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StudioSettingsPanel } from '../../StudioSettingsPanel';

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#FAF9F7] w-full max-w-2xl max-h-[80vh] p-6 rounded-3xl border border-[#E5E1DA] shadow-2xl space-y-6 animate-in slide-in-from-bottom-4 duration-300 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-sans font-bold text-[#1A1A1A]">{t('studio.settingsTitle')}</h2>
          <button onClick={onClose} className="text-[#A8A196] hover:text-[#1A1A1A] transition-colors p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <StudioSettingsPanel visibleSections={['voice']} onClose={onClose} />
      </div>
    </div>
  );
}
