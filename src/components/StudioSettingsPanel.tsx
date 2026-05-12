import React from 'react';
import { useTranslation } from 'react-i18next';
import { AVAILABLE_VOICES } from '../services/gemini';
import { useStudioSettings } from './StudioSettingsContext';

function CustomSelect({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: { value: string; label: string; description?: string }[];
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find((option) => option.value === value) || options[0];

  return (
    <div className="space-y-3 relative">
      <label className="block text-xs uppercase tracking-widest font-bold text-[#A8A196]">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-[#E5E1DA] p-4 rounded-2xl text-left flex items-center justify-between hover:border-[#C5A880] transition-all shadow-sm group"
      >
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[#1A1A1A]">{selectedOption.label}</span>
          {selectedOption.description && (
            <span className="text-[10px] text-[#A8A196] leading-tight mt-0.5">{selectedOption.description}</span>
          )}
        </div>
        <span className={`w-4 h-4 text-[#A8A196] group-hover:text-[#C5A880] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          v
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E1DA] rounded-2xl shadow-2xl z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-64 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-[#FAF9F7] transition-colors border-b border-[#F5F2EE] last:border-0 flex flex-col ${value === option.value ? 'bg-[#C5A880]/5' : ''}`}
                >
                  <span className={`text-xs font-bold ${value === option.value ? 'text-[#C5A880]' : 'text-[#1A1A1A]'}`}>
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="text-[10px] text-[#A8A196] leading-tight mt-0.5">{option.description}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function StudioSettingsPanel({
  showApiKeyActions = false,
  onClose
}: {
  showApiKeyActions?: boolean;
  onClose?: () => void;
}) {
  const { t } = useTranslation();
  const {
    clearApiKey,
    scriptModel,
    setScriptModel,
    imageModel,
    setImageModel,
    ttsModel,
    setTtsModel,
    selectedVoice,
    setSelectedVoice
  } = useStudioSettings();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomSelect
          label={t('studio.labels.scriptModel')}
          value={scriptModel}
          onChange={setScriptModel}
          options={[
            { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', description: t('studio.labels.flashLiteDesc') },
            { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', description: t('studio.labels.flashDesc') },
            { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro', description: t('studio.labels.proDesc') },
            { value: 'gemini-2.5-flash-preview', label: 'Gemini 2.5 Flash', description: t('studio.labels.legacyDesc') }
          ]}
        />

        <CustomSelect
          label={t('studio.labels.imageModel')}
          value={imageModel}
          onChange={setImageModel}
          options={[
            { value: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image', description: t('studio.labels.nanoDesc') },
            { value: 'gemini-3.1-flash-image-preview', label: 'Gemini 3.1 Flash Image', description: t('studio.labels.highResDesc') }
          ]}
        />

        <CustomSelect
          label={t('studio.labels.ttsModel')}
          value={ttsModel}
          onChange={setTtsModel}
          options={[
            { value: 'gemini-3.1-flash-tts-preview', label: 'Gemini 3.1 Flash TTS', description: t('studio.labels.ttsFlashDesc') },
            { value: 'gemini-3.1-pro-tts-preview', label: 'Gemini 3.1 Pro TTS', description: t('studio.labels.ttsProDesc') }
          ]}
        />

        <CustomSelect
          label={t('studio.labels.voiceTone')}
          value={selectedVoice}
          onChange={setSelectedVoice}
          options={AVAILABLE_VOICES.map((voice) => ({
            value: voice,
            label: voice,
            description: voice === 'Kore' || voice === 'Aoede' ? t('studio.labels.femSoft') : t('studio.labels.maleDeep')
          }))}
        />
      </div>

      {showApiKeyActions && (
        <div className="pt-6 border-t border-[#E5E1DA]">
          <button
            onClick={clearApiKey}
            className="text-xs font-bold tracking-widest uppercase text-[#A8A196] hover:text-[#1A1A1A] transition-colors"
          >
            {t('studio.btnRemoveKey')}
          </button>
        </div>
      )}

      {onClose && (
        <div className="pt-4 mt-4 border-t border-[#E5E1DA]">
          <button
            onClick={onClose}
            className="w-full bg-[#1A1A1A] text-white font-bold py-4 rounded-full transition-transform active:scale-95 hover:bg-black shadow-lg"
          >
            {t('studio.btnSaveConfig')}
          </button>
        </div>
      )}
    </div>
  );
}
