import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Key, Eye, EyeOff, AlertCircle, Trash2, CheckCircle2, Film, Sparkles } from 'lucide-react';
import { AVAILABLE_VOICES, VIDEO_MODELS } from '../../services/gemini';
import { useStudioSettings } from '../../context/StudioSettingsContext';

export function CustomSelect({
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
        className="w-full bg-white border border-[#E5E1DA] p-4 rounded-2xl text-left flex items-center justify-between hover:border-[#C5A880] transition-all shadow-sm group cursor-pointer"
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
                  className={`w-full text-left px-4 py-2.5 hover:bg-[#FAF9F7] transition-colors border-b border-[#F5F2EE] last:border-0 flex flex-col cursor-pointer ${value === option.value ? 'bg-[#C5A880]/5' : ''}`}
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
    apiKey,
    clearApiKey,
    agnesApiKey,
    setAgnesApiKey,
    clearAgnesApiKey,
    videoProvider,
    setVideoProvider,
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

  const [agnesKeyInput, setAgnesKeyInput] = React.useState(agnesApiKey || '');
  const [showAgnesKey, setShowAgnesKey] = React.useState(false);
  const [agnesKeyError, setAgnesKeyError] = React.useState<string | null>(null);
  const [agnesKeySavedFeedback, setAgnesKeySavedFeedback] = React.useState(false);

  React.useEffect(() => {
    setAgnesKeyInput(agnesApiKey || '');
  }, [agnesApiKey]);

  const handleSaveAgnesKey = () => {
    const trimmed = agnesKeyInput.trim();
    if (!trimmed) {
      setAgnesKeyError("La clé API Agnes ne peut pas être vide.");
      return;
    }
    setAgnesApiKey(trimmed);
    setAgnesKeyError(null);
    setAgnesKeySavedFeedback(true);
    setTimeout(() => setAgnesKeySavedFeedback(false), 2000);
  };

  const handleSelectProvider = (provider: 'veo' | 'agnes') => {
    if (provider === 'agnes') {
      const activeKey = (agnesApiKey || agnesKeyInput || '').trim();
      if (!activeKey) {
        setAgnesKeyError("La clé API Agnes est obligatoire pour sélectionner ce moteur d'animation. Veuillez renseigner votre clé Agnes.");
        return;
      }
      if (!agnesApiKey && agnesKeyInput.trim()) {
        setAgnesApiKey(agnesKeyInput.trim());
      }
    }
    setAgnesKeyError(null);
    setVideoProvider(provider);
  };

  const handleToggleAnimateVideo = () => {
    const nextVal = !animateVideo;
    if (nextVal && videoProvider === 'agnes') {
      const activeKey = (agnesApiKey || agnesKeyInput || '').trim();
      if (!activeKey) {
        setAgnesKeyError("La clé API Agnes est obligatoire pour activer l'animation avec Agnes Video. Veuillez renseigner votre clé ci-dessous.");
        return;
      }
    }
    setAgnesKeyError(null);
    setAnimateVideo(nextVal);
  };

  const scriptModelOptions = [
    { value: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', description: t('studio.labels.flash38Desc') },
    { value: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite', description: t('studio.labels.flashLite35Desc') },
    { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', description: t('studio.labels.flash35Desc') },
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
              <h3 className="text-xl font-sans font-bold text-[#1A1A1A] mt-2">Moteur d'Animation Vidéo</h3>
              <p className="text-sm text-[#7A7570] mt-2">
                Animez chaque scène de votre histoire avec Google Veo ou Agnes Video v2.0.
              </p>
            </div>
          )}

          {/* Error Banner if validation fails */}
          {agnesKeyError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-bold text-red-800">Clé API requise</p>
                <p className="text-xs text-red-700 mt-0.5">{agnesKeyError}</p>
              </div>
            </div>
          )}

          {/* Toggle Animate Video */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleToggleAnimateVideo}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all shadow-sm cursor-pointer ${
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
                    Chaque image générée sera convertie en clip cinématique fluide
                  </span>
                </div>
              </div>
              {animateVideo && (
                <span className="px-2.5 py-1 bg-[#C5A880]/20 text-[#8F744F] text-[9px] font-bold uppercase tracking-widest rounded-full shrink-0">
                  Actif
                </span>
              )}
            </button>
          </div>

          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-widest font-bold text-[#A8A196]">
              Sélectionnez le moteur d'animation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Google Veo Card */}
              <button
                type="button"
                onClick={() => handleSelectProvider('veo')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  videoProvider === 'veo'
                    ? 'border-[#C5A880] bg-[#C5A880]/5 shadow-sm'
                    : 'border-[#E5E1DA] bg-white hover:border-[#C5A880]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Film className={`w-4 h-4 ${videoProvider === 'veo' ? 'text-[#C5A880]' : 'text-[#7A7570]'}`} />
                    <span className="text-sm font-bold text-[#1A1A1A]">Google Veo (3.1)</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    videoProvider === 'veo' ? 'border-[#C5A880] bg-[#C5A880]' : 'border-[#D1C9BE]'
                  }`}>
                    {videoProvider === 'veo' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>
                <p className="text-[11px] text-[#7A7570] leading-relaxed">
                  Modèles Veo Lite & Fast via votre compte Google AI Studio.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] bg-[#EAE6DF] text-[#555] px-2 py-0.5 rounded font-mono">
                    720p / 1080p
                  </span>
                  <span className="text-[10px] text-[#A8A196]">Payant GCP</span>
                </div>
              </button>

              {/* Agnes Video Card */}
              <button
                type="button"
                onClick={() => handleSelectProvider('agnes')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  videoProvider === 'agnes'
                    ? 'border-[#C5A880] bg-[#C5A880]/5 shadow-sm'
                    : 'border-[#E5E1DA] bg-white hover:border-[#C5A880]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 ${videoProvider === 'agnes' ? 'text-[#C5A880]' : 'text-[#7A7570]'}`} />
                    <span className="text-sm font-bold text-[#1A1A1A]">Agnes Video (v2.0)</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    videoProvider === 'agnes' ? 'border-[#C5A880] bg-[#C5A880]' : 'border-[#D1C9BE]'
                  }`}>
                    {videoProvider === 'agnes' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>
                <p className="text-[11px] text-[#7A7570] leading-relaxed">
                  Moteur haute cohérence Agnes AI (121 frames @ 24fps).
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] bg-[#EAE6DF] text-[#555] px-2 py-0.5 rounded font-mono">
                    apihub.agnes-ai.com
                  </span>
                  {agnesApiKey ? (
                    <span className="text-[10px] text-green-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Clé OK
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-700 font-bold">
                      Clé requise
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Agnes Key Input Box */}
          <div className={`p-5 rounded-2xl border transition-all ${videoProvider === 'agnes' ? 'bg-[#FAF9F7] border-[#C5A880]' : 'bg-white border-[#E5E1DA]'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#C5A880]" />
                <span className="text-xs uppercase tracking-wider font-bold text-[#1A1A1A]">
                  Clé API Agnes Video v2.0
                </span>
              </div>
              {agnesApiKey ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Clé active
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Non configurée
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#7A7570] mb-3">
              Indispensable si Agnes Video est sélectionné. Transmise de façon sécurisée à l'endpoint Agnes AI.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showAgnesKey ? "text" : "password"}
                  value={agnesKeyInput}
                  onChange={(e) => {
                    setAgnesKeyInput(e.target.value);
                    if (agnesKeyError) setAgnesKeyError(null);
                  }}
                  placeholder="Collez votre clé API Agnes..."
                  className="w-full pl-3 pr-10 py-2.5 text-xs font-mono bg-white border border-[#E5E1DA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                />
                <button
                  type="button"
                  onClick={() => setShowAgnesKey(!showAgnesKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showAgnesKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleSaveAgnesKey}
                className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#333] text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                {agnesKeySavedFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    Enregistrée
                  </>
                ) : (
                  "Enregistrer"
                )}
              </button>
              {agnesApiKey && (
                <button
                  type="button"
                  onClick={() => {
                    clearAgnesApiKey();
                    setAgnesKeyInput('');
                    if (videoProvider === 'agnes') setVideoProvider('veo');
                  }}
                  className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-[#E5E1DA]"
                  title="Supprimer la clé Agnes"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Details for Google Veo */}
          {videoProvider === 'veo' && (
            <div className="space-y-4">
              {animateVideo && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>⚠️ API Google Cloud requise</strong> — La génération vidéo Veo nécessite un compte de facturation actif. 
                    Coût estimé pour 6 scènes (~30s) : <strong>~{videoModel === 'veo-3.1-lite-generate-preview' ? '1.50$' : videoModel === 'veo-3.1-fast-generate-preview' ? '3.00$' : '12.00$'}</strong> en {videoQuality}.
                  </p>
                </div>
              )}

              {animateVideo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <CustomSelect
                    label="Modèle Vidéo"
                    value={videoModel}
                    onChange={(val) => {
                      setVideoModel(val);
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
            </div>
          )}

          {/* Details for Agnes Video */}
          {videoProvider === 'agnes' && (
            <div className="bg-white border border-[#E5E1DA] rounded-2xl p-4 space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A1A1A]">Spécifications Agnes Video v2.0</span>
                <span className="text-[10px] font-mono bg-[#EAE6DF] text-[#555] px-2 py-0.5 rounded">121 frames @ 24fps</span>
              </div>
              <p className="text-xs text-[#7A7570] leading-relaxed">
                Toutes les scènes seront générées via l'API Agnes Video (image-to-video en 768x1152 ou 1152x768). Le suivi des tâches et le téléchargement du MP4 final sont entièrement automatisés.
              </p>
            </div>
          )}
        </section>
      )}

      {showApiKeyActions && shouldShowSection('security') && (
        <section id="security" className="space-y-6">
          {showSectionHeaders && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A8A196]">Securite</p>
              <h3 className="text-xl font-sans font-bold text-[#1A1A1A] mt-2">Clés API</h3>
              <p className="text-sm text-[#7A7570] mt-2">
                Gérez les clés associées à vos comptes Google Gemini et Agnes Video.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* Gemini Key Status */}
            <div className="p-4 rounded-2xl border border-[#E5E1DA] bg-white flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1A1A1A]">Google Gemini API</p>
                <p className="text-[11px] text-[#7A7570] mt-0.5">Utilisée pour le script, les voix TTS et la génération d'images</p>
              </div>
              <button
                onClick={clearApiKey}
                className="text-xs font-bold tracking-widest uppercase text-red-600 hover:text-red-700 transition-colors cursor-pointer"
              >
                {t('studio.btnRemoveKey')}
              </button>
            </div>

            {/* Agnes Key Status */}
            <div className="p-4 rounded-2xl border border-[#E5E1DA] bg-white flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1A1A1A]">Agnes Video API</p>
                <p className="text-[11px] text-[#7A7570] mt-0.5">
                  {agnesApiKey ? "Clé configurée et prête pour l'animation" : "Aucune clé configurée"}
                </p>
              </div>
              {agnesApiKey ? (
                <button
                  onClick={() => {
                    clearAgnesApiKey();
                    setAgnesKeyInput('');
                    if (videoProvider === 'agnes') setVideoProvider('veo');
                  }}
                  className="text-xs font-bold tracking-widest uppercase text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                >
                  Supprimer
                </button>
              ) : (
                <span className="text-xs font-bold text-[#A8A196]">Optionnelle</span>
              )}
            </div>
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
            <CustomSelect
              label={t('studio.styleLabel')}
              value={imageStyle}
              onChange={setImageStyle}
              options={[
                { value: 'Pixar 3D', label: 'Pixar 3D', description: 'Style d\'animation 3D doux et expressif.' },
                { value: 'Cinématique Noir', label: 'Cinématique Noir', description: 'Fort contraste, ombres dramatiques, réaliste.' },
                { value: 'Aquarelle Douce', label: 'Aquarelle Douce', description: 'Peinture légère, romantique et apaisante.' },
                { value: 'Photoréalisme', label: 'Photoréalisme', description: 'Photos très détaillées, style documentaire.' },
                { value: 'Anime Japonais', label: 'Anime Japonais', description: 'Style animation japonaise classique (2D).' },
                { value: 'Cyberpunk', label: 'Cyberpunk', description: 'Néons, futuriste, couleurs vibrantes.' }
              ]}
            />
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
            className="w-full bg-[#1A1A1A] text-white font-bold py-4 rounded-full transition-transform active:scale-95 hover:bg-black shadow-lg cursor-pointer"
          >
            {t('studio.btnSaveConfig')}
          </button>
        </div>
      )}
    </div>
  );
}
