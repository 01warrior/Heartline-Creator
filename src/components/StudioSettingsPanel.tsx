import React from 'react';
import { useTranslation } from 'react-i18next';
import { AVAILABLE_VOICES, VIDEO_MODELS } from '../services/gemini';
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
  onClose,
  visibleSections,
  showSectionHeaders = true
}: {
  showApiKeyActions?: boolean;
  onClose?: () => void;
  visibleSections?: Array<'models' | 'voice' | 'security' | 'style' | 'script' | 'animation'>;
  showSectionHeaders?: boolean;
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
    setSelectedVoice,
    imageStyle,
    setImageStyle,
    sceneCountMin,
    setSceneCountMin,
    sceneCountMax,
    setSceneCountMax,
    animateVideo,
    setAnimateVideo,
    videoModel,
    setVideoModel,
    videoQuality,
    setVideoQuality
  } = useStudioSettings();

  const scriptModelOptions = [
    { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', description: t('studio.labels.flashLiteDesc') },
    { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', description: t('studio.labels.flashDesc') },
    { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro', description: t('studio.labels.proDesc') },
    { value: 'gemini-2.5-flash-preview', label: 'Gemini 2.5 Flash', description: t('studio.labels.legacyDesc') }
  ];

  const imageModelOptions = [
    { value: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image', description: t('studio.labels.nanoDesc') },
    { value: 'gemini-3.1-flash-image-preview', label: 'Gemini 3.1 Flash Image', description: t('studio.labels.highResDesc') }
  ];

  const ttsModelOptions = [
    { value: 'gemini-3.1-flash-tts-preview', label: 'Gemini 3.1 Flash TTS', description: t('studio.labels.ttsFlashDesc') },
    { value: 'gemini-3.1-pro-tts-preview', label: 'Gemini 3.1 Pro TTS', description: t('studio.labels.ttsProDesc') }
  ];

  const voiceOptions = AVAILABLE_VOICES.map((voice) => ({
    value: voice,
    label: voice,
    description: voice === 'Kore' || voice === 'Aoede' ? t('studio.labels.femSoft') : t('studio.labels.maleDeep')
  }));

  // Video model options
  const videoModelOptions = VIDEO_MODELS.map((m) => ({
    value: m.id,
    label: m.label,
    description: m.id === 'veo-3.1-generate-preview'
      ? 'Aperçu (Recommandé) — Supporte toutes les résolutions'
      : m.id === 'veo-3.1-lite-generate-preview' 
        ? 'Économique — 0.05$/s (720p), 0.08$/s (1080p)' 
        : m.id === 'veo-3.1-fast-generate-preview' 
          ? 'Rapide — 0.10$/s (720p), 0.30$/s (4K)'
          : 'Meilleure qualité — 0.40$/s (720p/1080p), 0.60$/s (4K)'
  }));

  // Video quality options (conditional on model)
  const selectedVideoModel = VIDEO_MODELS.find(m => m.id === videoModel);
  const videoQualityOptions = [
    { value: '720p', label: '720p', description: 'HD — Économique' },
    { value: '1080p', label: '1080p', description: 'Full HD — Recommandé' },
    ...(selectedVideoModel?.supports4K ? [{ value: '4k', label: '4K', description: 'Ultra HD — Premium (non disponible sur Lite)' }] : [])
  ];

  const selectConfigs = [
    {
      label: t('studio.labels.scriptModel'),
      value: scriptModel,
      onChange: setScriptModel,
      options: scriptModelOptions
    },
    {
      label: t('studio.labels.imageModel'),
      value: imageModel,
      onChange: setImageModel,
      options: imageModelOptions
    },
    {
      label: t('studio.labels.ttsModel'),
      value: ttsModel,
      onChange: setTtsModel,
      options: ttsModelOptions
    },
    {
      label: t('studio.labels.voiceTone'),
      value: selectedVoice,
      onChange: setSelectedVoice,
      options: voiceOptions
    }
  ];

  const shouldShowSection = (sectionId: 'models' | 'voice' | 'security' | 'style' | 'script' | 'animation') =>
    !visibleSections || visibleSections.includes(sectionId);

  return (
    <div className="space-y-12">
      {shouldShowSection('models') && (
        <section id="models" className="space-y-6">
          {showSectionHeaders && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A8A196]">Modeles</p>
              <h3 className="text-xl font-sans font-bold text-[#1A1A1A] mt-2">Configuration des modeles</h3>
              <p className="text-sm text-[#7A7570] mt-2">
                Ajustez le modele de script et le moteur d'image pour vos generations.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectConfigs.slice(0, 2).map((config) => (
              <CustomSelect
                key={config.label}
                label={config.label}
                value={config.value}
                onChange={config.onChange}
                options={config.options}
              />
            ))}
          </div>
        </section>
      )}

      {shouldShowSection('voice') && (
        <section id="voice" className="space-y-6">
          {showSectionHeaders && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A8A196]">Voix</p>
              <h3 className="text-xl font-sans font-bold text-[#1A1A1A] mt-2">Voix et narration</h3>
              <p className="text-sm text-[#7A7570] mt-2">
                Choisissez le modele TTS et la tonalite de narration.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectConfigs.slice(2).map((config) => (
              <CustomSelect
                key={config.label}
                label={config.label}
                value={config.value}
                onChange={config.onChange}
                options={config.options}
              />
            ))}
          </div>
        </section>
      )}

      {shouldShowSection('animation') && (
        <section id="animation" className="space-y-6">
          {showSectionHeaders && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A8A196]">Animation</p>
              <h3 className="text-xl font-sans font-bold text-[#1A1A1A] mt-2">Animation Vidéo (Veo)</h3>
              <p className="text-sm text-[#7A7570] mt-2">
                Animez vos scènes en clips vidéo cinématiques avec Veo 3.1.
              </p>
            </div>
          )}

          {/* Toggle Animate Video */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setAnimateVideo(!animateVideo)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all shadow-sm ${
                animateVideo 
                  ? 'border-[#C5A880] bg-[#C5A880]/5' 
                  : 'border-[#E5E1DA] bg-white hover:border-[#C5A880]/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-7 rounded-full relative transition-colors ${animateVideo ? 'bg-[#C5A880]' : 'bg-[#E5E1DA]'}`}>
                  <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all ${animateVideo ? 'left-[22px]' : 'left-0.5'}`} />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-[#1A1A1A] block">Animer les scènes en vidéo</span>
                  <span className="text-[10px] text-[#A8A196] leading-tight block mt-0.5">
                    Chaque image sera animée en clip vidéo via Veo (image-to-video)
                  </span>
                </div>
              </div>
              {animateVideo && (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-widest rounded-full shrink-0">
                  Payant
                </span>
              )}
            </button>

            {/* Warning about costs */}
            {animateVideo && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>⚠️ API payante requise</strong> — La génération vidéo Veo nécessite un billing actif sur votre compte Google Cloud. 
                  Coût estimé pour 6 scènes (~30s) : <strong>~{videoModel === 'veo-3.1-lite-generate-preview' ? '1.50$' : videoModel === 'veo-3.1-fast-generate-preview' ? '3.00$' : '12.00$'}</strong> en {videoQuality}.
                </p>
              </div>
            )}
          </div>

          {/* Video model & quality selectors (shown only when animation is enabled) */}
          {animateVideo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <CustomSelect
                label="Modèle Vidéo"
                value={videoModel}
                onChange={(val) => {
                  setVideoModel(val);
                  // Reset quality to 1080p if switching to a model that doesn't support current quality
                  const newModel = VIDEO_MODELS.find(m => m.id === val);
                  if (!newModel?.supports4K && videoQuality === '4k') {
                    setVideoQuality('1080p');
                  }
                }}
                options={videoModelOptions}
              />
              <CustomSelect
                label="Qualité Vidéo"
                value={videoQuality}
                onChange={setVideoQuality}
                options={videoQualityOptions}
              />
            </div>
          )}
        </section>
      )}

      {showApiKeyActions && shouldShowSection('security') && (
        <section id="security" className="space-y-6">
          {showSectionHeaders && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A8A196]">Securite</p>
              <h3 className="text-xl font-sans font-bold text-[#1A1A1A] mt-2">Cle API</h3>
              <p className="text-sm text-[#7A7570] mt-2">
                Gerer la cle associee a votre compte pour les appels IA.
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={clearApiKey}
              className="text-xs font-bold tracking-widest uppercase text-[#A8A196] hover:text-[#1A1A1A] transition-colors"
            >
              {t('studio.btnRemoveKey')}
            </button>
          </div>
        </section>
      )}

      {shouldShowSection('style') && (
        <section id="style" className="space-y-6">
          {showSectionHeaders && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A8A196]">Style visuel</p>
              <h3 className="text-xl font-sans font-bold text-[#1A1A1A] mt-2">Direction artistique</h3>
              <p className="text-sm text-[#7A7570] mt-2">
                Affinez le style utilise pour toutes les images generees.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-[#A8A196] mb-2">
              {t('studio.styleLabel')}
            </label>
            <div className="relative bg-white border border-[#E5E1DA] rounded-xl overflow-hidden focus-within:border-[#C5A880] transition-colors shadow-sm">
              <input
                type="text"
                value={imageStyle}
                onChange={e => setImageStyle(e.target.value)}
                placeholder={t('studio.stylePlaceholder')}
                className="w-full bg-transparent p-4 text-[#1A1A1A] text-sm placeholder-[#A8A196] focus:outline-none"
              />
            </div>
            <p className="mt-3 text-[10px] text-[#A8A196] leading-relaxed italic">
              {t('studio.styleTip')}
            </p>
          </div>
        </section>
      )}

      {shouldShowSection('script') && (
        <section id="script" className="space-y-6">
          {showSectionHeaders && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A8A196]">Script</p>
              <h3 className="text-xl font-sans font-bold text-[#1A1A1A] mt-2">Paramètres du poème</h3>
              <p className="text-sm text-[#7A7570] mt-2">
                Personnalisez la longueur du poème généré (nombre de scènes).
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-[#A8A196] mb-2">
                Nombre de scènes : {sceneCountMin}-{sceneCountMax}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-2">Minimum</label>
                  <input
                    type="number"
                    min="2"
                    max="12"
                    value={sceneCountMin}
                    onChange={(e) => {
                      const val = Math.min(parseInt(e.target.value, 10) || 2, sceneCountMax);
                      setSceneCountMin(Math.max(val, 2));
                    }}
                    className="w-full bg-white border border-[#E5E1DA] p-3 rounded-xl text-[#1A1A1A] font-mono text-sm focus:outline-none focus:border-[#C5A880] transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-2">Maximum</label>
                  <input
                    type="number"
                    min="2"
                    max="12"
                    value={sceneCountMax}
                    onChange={(e) => {
                      const val = Math.max(parseInt(e.target.value, 10) || 12, sceneCountMin);
                      setSceneCountMax(Math.min(val, 12));
                    }}
                    className="w-full bg-white border border-[#E5E1DA] p-3 rounded-xl text-[#1A1A1A] font-mono text-sm focus:outline-none focus:border-[#C5A880] transition-colors shadow-sm"
                  />
                </div>
              </div>
              <p className="mt-3 text-[10px] text-[#A8A196] leading-relaxed italic">
                L'IA générera un nombre de scènes entre ces deux valeurs. Augmentez pour plus de détails, diminuez pour plus de concision.
              </p>
            </div>
          </div>
        </section>
      )}

      {onClose && (
        <div className="pt-4">
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
