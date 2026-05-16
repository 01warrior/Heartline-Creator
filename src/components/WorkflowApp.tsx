import React, { useState } from 'react';
import { playPcmAudio, audioDataToBlob } from '../services/gemini';
import { exportVideo, exportVideoFast } from '../services/videoExport';
import { ApiKeyInput } from './ApiKeyInput';
import { useStudioSettings } from './StudioSettingsContext';
import { LanguageSelector } from './LanguageSelector';
import { Loader2, Play, CheckCircle2, Check, Wand2, Edit3, Image as ImageIcon, Music, X, Sparkles, Download, Archive, Video, Share2, Facebook, Youtube } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CogIcon, FeatherIcon } from '@hugeicons/core-free-icons';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/loading.json';
import { STYLE_PRESETS, type Scene } from './workflow/workflowConfig';
import { useMediaGeneration } from './workflow/useMediaGeneration';
import { useScriptGeneration } from './workflow/useScriptGeneration';
import { SettingsModal } from './workflow/ui/SettingsModal';
import { SuggestionsModal } from './workflow/ui/SuggestionsModal';
import { ErrorModal } from './workflow/ui/ErrorModal';


export function WorkflowApp() {
  const { t } = useTranslation();
  const {
    apiKey,
    setApiKey,
    scriptModel,
    imageModel,
    ttsModel,
    selectedVoice,
    imageStyle,
    setImageStyle,
    sceneCountMin,
    sceneCountMax,
    animateVideo,
    videoModel,
    videoQuality
  } = useStudioSettings();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [error, setError] = useState<{title: string, message: string} | null>(null);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedVideoBlob, setExportedVideoBlob] = useState<Blob | null>(null);

  // Model Settings

  const parseGeminiError = (err: any) => {
    try {
      const errorStr = (err?.message || "").toString() + JSON.stringify(err);
      if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
        return {
          title: "Quota Exceeded",
          message: "You've hit the Gemini API free tier limit. This usually happens after a few generations in a minute. Please wait about 60 seconds and try again."
        };
      }
      if (errorStr.includes('404') || errorStr.includes('NOT_FOUND')) {
        return {
          title: "Model Not Found (404)",
          message: "The model selected in settings was not found. This might be because the model ID is slightly different or not available for your API Key. Please try 'Gemini 3.1 Flash TTS' instead."
        };
      }
      if (errorStr.includes('403') || errorStr.includes('PERMISSION_DENIED')) {
        return {
          title: "Permission Denied",
          message: "Please ensure your Gemini API Key is valid and has access to the models selected in settings."
        };
      }
    } catch (e) {}
    return {
      title: "AI Generation Error",
      message: typeof err === 'string' ? err : (err.message || "An unexpected error occurred while communicating with the AI.")
    };
  };



  const downloadImage = (base64: string, index: number) => {
    const link = document.createElement('a');
    link.href = base64; // The string already includes the data URL prefix: data:image/jpeg;base64,...
    link.download = `heartlines-scene-${index+1}.jpg`;
    link.click();
  };

  const handleDownloadAllZip = async () => {
    const zip = new JSZip();
    
    // Add images
    scenes.forEach((scene, i) => {
      if (scene.image) {
        // Strip data prefix (e.g. data:image/jpeg;base64,) from base64 string
        const base64Data = scene.image.split(',')[1];
        if (base64Data) {
          zip.file(`scene-${i + 1}.jpg`, base64Data, { base64: true });
        }
      }
      // Add animated videos if available
      if (scene.video) {
        const videoBase64 = scene.video.split(',')[1];
        if (videoBase64) {
          zip.file(`scene-${i + 1}-animated.mp4`, videoBase64, { base64: true });
        }
      }
    });

    // Add audio if available
    if (fullAudio) {
      try {
        const wavBlob = audioDataToBlob(fullAudio.data, fullAudio.mimeType);
        zip.file("narration.wav", wavBlob);
      } catch (err) {
        console.error("Failed to add WAV to zip", err);
      }
    }

    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "heartlines-production.zip");
    } catch (err) {
      console.error("Failed to generate zip", err);
      alert("Failed to generate zip archive.");
    }
  };

  const handleExportFast = async () => {
    if (!wavUrl || scenes.length === 0) return;
    setIsExportingVideo(true);
    setExportProgress(0);
    try {
      const blob = await exportVideoFast(scenes, wavUrl, (progress) => {
        setExportProgress(progress);
      });
      setExportedVideoBlob(blob);
      saveAs(blob, blob.type === 'video/mp4' ? 'video-production.mp4' : 'video-production.webm');
    } catch (err) {
      console.error("Failed to export video cleanly", err);
      alert("Failed to export video via fast mode.");
    } finally {
      setIsExportingVideo(false);
      setExportProgress(0);
    }
  };

  const handleExportMP4 = async () => {
    if (!wavUrl || scenes.length === 0) return;
    setIsExportingVideo(true);
    setExportProgress(0);
    try {
      const blob = await exportVideo(scenes, wavUrl, (progress) => {
        setExportProgress(progress);
      });
      setExportedVideoBlob(blob);
      saveAs(blob, 'video-production.mp4');
    } catch (err) {
      console.error("Failed to export video", err);
      alert("Failed to export video.");
    } finally {
      setIsExportingVideo(false);
      setExportProgress(0);
    }
  };

  const handleShareVideo = async () => {
    if (!exportedVideoBlob) return;

    const file = new File([exportedVideoBlob], 
      exportedVideoBlob.type === 'video/mp4' ? 'heartlines-video.mp4' : 'heartlines-video.webm', 
      { type: exportedVideoBlob.type }
    );

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Heartlines Video',
          text: 'Check out my poem video created with Heartlines!',
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback for browsers that don't support file sharing
      alert("Sharing not supported on this browser. Please download the video and upload it manually to TikTok/Facebook/YouTube.");
    }
  };

  const handleScenePhraseChange = (index: number, newPhrase: string) => {
    const newScenes = [...scenes];
    newScenes[index].phrase = newPhrase;
    setScenes(newScenes);
  };

  const {
    currentSceneIndex,
    generationProgress,
    handleGenerateMedia,
    isPlaying,
    playSequence,
    fullAudio,
    setFullAudio,
    rightPanelState,
    setRightPanelState,
    wavUrl,
    videoStatus
  } = useMediaGeneration({
    apiKey,
    scenes,
    setScenes,
    imageStyle,
    imageModel,
    ttsModel,
    selectedVoice,
    animateVideo,
    videoModel,
    videoQuality,
    parseGeminiError,
    setError
  });

  const {
    handleGeneratePoem,
    handleOpenSuggestions,
    handleRefreshSuggestions,
    isGeneratingPoem,
    isSuggesting,
    isSuggestionsModalOpen,
    setIsSuggestionsModalOpen,
    setSuggestions,
    setTopic,
    suggestions,
    topic
  } = useScriptGeneration({
    apiKey,
    scriptModel,
    setScenes,
    setError,
    setFullAudio,
    setRightPanelState,
    parseGeminiError,
    sceneCountMin,
    sceneCountMax
  });

  if (!apiKey) {
    return <ApiKeyInput onKeySubmit={setApiKey} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#2D2D2D] font-sans flex flex-col lg:flex-row overflow-hidden selection:bg-[#C5A880]/20">
      {/* LEFT PANEL: Editor & Settings */}
      <div className="w-full lg:w-1/2 p-6 lg:p-12 overflow-y-auto border-b lg:border-b-0 lg:border-r border-[#E5E1DA] h-auto lg:h-screen transition-all">
        <div className="max-w-xl mx-auto space-y-12">
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-sans font-bold mb-4 leading-tight tracking-tight text-[#2D2D2D] flex flex-wrap items-center gap-3 sm:gap-4">
                {t('studio.editorTitle')} 
                <span className="bg-[#1A1A1A] text-white px-3 sm:px-4 py-1 rounded-xl -rotate-2 font-normal text-2xl sm:text-3xl inline-block shadow-xl border border-[#333]">
                  {t('studio.editorBadge')}
                </span>
                <HugeiconsIcon icon={FeatherIcon} className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A880] opacity-60" color="currentColor" strokeWidth={2.25} />
              </h1>
              <p className="text-[#7A7570] text-sm sm:text-base">
                {t('studio.editorSubtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="h-[46px] px-4 bg-white border border-[#E5E1DA] rounded-2xl text-[#A8A196] hover:text-[#C5A880] hover:border-[#C5A880] transition-all shadow-sm flex items-center gap-2 group"
              >
                <HugeiconsIcon icon={CogIcon} className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" color="currentColor" strokeWidth={2.25} />
                <span className="text-[10px] uppercase tracking-widest font-bold lg:hidden">{t('studio.settings')}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleGeneratePoem} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-[#A8A196] mb-2">{t('studio.topicLabel')}</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E5E1DA] to-[#C5A880] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                  <div className="relative bg-white border border-[#E5E1DA] rounded-2xl overflow-hidden focus-within:border-[#C5A880] transition-colors shadow-sm">
                    <textarea
                      required
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder={t('studio.topicPlaceholder')}
                      className="w-full bg-transparent p-4 pr-12 text-[#1A1A1A] text-base placeholder-[#A8A196] focus:outline-none resize-none min-h-[120px]"
                    />
                    <div className="absolute bottom-3 right-3 group">
                      <button
                        type="button"
                        disabled={isSuggesting}
                        onClick={handleOpenSuggestions}
                        className="p-2 bg-[#FAF9F7] text-[#A8A196] hover:text-[#C5A880] rounded-xl transition-all shadow-sm border border-[#E5E1DA] disabled:opacity-50"
                        aria-label={t('studio.tooltipSuggest')}
                      >
                        <HugeiconsIcon icon={FeatherIcon} className={`w-4 h-4 ${isSuggesting ? 'animate-pulse' : ''}`} color="currentColor" strokeWidth={2.25} />
                      </button>
                      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-[#1A1A1A] text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                        {t('studio.tooltipSuggest')}
                        <div className="absolute -bottom-1 right-3.5 w-2 h-2 bg-[#1A1A1A] rotate-45 transform"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-[#A8A196] mb-2">{t('studio.styleLabel')}</label>
                <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setImageStyle(preset.prompt)}
                      className="group relative flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all hover:border-[#C5A880] focus:outline-none"
                      style={{
                        borderColor: imageStyle === preset.prompt ? '#C5A880' : '#E5E1DA',
                        backgroundColor: imageStyle === preset.prompt ? '#FDFCFB' : 'white',
                      }}
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden border border-[#E5E1DA]">
                        <img 
                          src={preset.image} 
                          alt={preset.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: imageStyle === preset.prompt ? '#C5A880' : '#7A7570' }}>
                        {preset.label}
                      </span>
                      
                      {imageStyle === preset.prompt && (
                        <div className="absolute top-1 right-1 bg-[#C5A880] text-white p-0.5 rounded-full shadow-sm">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <p className="mt-3 text-[10px] text-[#A8A196] leading-relaxed italic">
                  {t('studio.styleTip')}
                </p>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isGeneratingPoem || !topic}
              className="w-full bg-[#F5F2EE] border border-[#E5E1DA] text-[#1A1A1A] font-bold text-sm py-4 rounded-full flex items-center justify-center space-x-2 transition-transform active:scale-[0.98] disabled:opacity-50 hover:bg-[#E5E1DA] shadow-sm"
            >
              {isGeneratingPoem ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('studio.btnWritingLines')}</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>{t('studio.btnGenerateScript')}</span>
                </>
              )}
            </button>
          </form>

          {scenes.length > 0 && (
            <div className="pt-6 border-t border-[#E5E1DA]">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#C5A880]/10 flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-[#C5A880]" />
                </div>
                <h2 className="text-2xl font-sans font-semibold text-[#1A1A1A]">{t('studio.reviewTitle')}</h2>
              </div>
              
              <div className="space-y-3 mb-8">
                {scenes.map((scene, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="text-[#A8A196] pt-3 relative z-10 w-6 text-right font-mono text-sm font-bold">{(i+1).toString().padStart(2, '0')}</div>
                    <div className="flex-1 bg-white border border-[#E5E1DA] focus-within:border-[#C5A880] shadow-sm rounded-xl overflow-hidden transition-colors relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F5F2EE] group-hover:bg-[#C5A880] transition-colors"></div>
                      <textarea 
                        value={scene.phrase} 
                        onChange={e => handleScenePhraseChange(i, e.target.value)}
                        className="w-full bg-transparent p-3 pl-5 text-[#1A1A1A] font-sans text-base outline-none resize-none h-16"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleGenerateMedia}
                disabled={rightPanelState === 'GENERATING'}
                className="w-full bg-[#1A1A1A] text-white font-bold rounded-full py-4 flex items-center justify-center space-x-2 transition-transform active:scale-[0.98] hover:bg-black shadow-lg disabled:opacity-50"
              >
                  <span>{t('studio.btnStartProduction')}</span>
                  <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          )}
          
        </div>
      </div>

      {/* RIGHT PANEL: Player or Generating */}
      <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center bg-[#FDFCFB] h-auto lg:h-screen lg:overflow-y-auto">
         {rightPanelState === 'IDLE' && !scenes.some(s => s.image) && (
           <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
             <div className="w-64 h-64 mx-auto mb-6">
               <Lottie animationData={loadingAnimation} loop={true} />
             </div>
             <p className="font-sans font-medium text-lg text-[#7A7570] text-balance max-w-xs mx-auto">
               {t('studio.masterpieceWait')}
             </p>
           </div>
         )}

         {rightPanelState === 'GENERATING' && (
           <div className="w-full max-sm mx-auto text-center py-10">
             <div className="relative w-20 h-20 mx-auto mb-8 text-[#C5A880]">
                <Loader2 className="w-20 h-20 animate-spin opacity-20 relative z-10" strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center -space-x-1">
                   <ImageIcon className="w-5 h-5 text-[#A8A196] rotate-[-10deg] animate-pulse" />
                   <Music className="w-5 h-5 text-[#A8A196] rotate-[10deg] animate-pulse delay-150" />
                </div>
             </div>

             <h2 className="text-xl font-sans text-[#1A1A1A] font-semibold mb-3">{t('studio.craftingExperience')}</h2>
             <p className="text-[#7A7570] mb-8 mx-auto leading-relaxed text-sm">
               {t('studio.generatingDescription')}
             </p>

             <div className="h-1 bg-[#E5E1DA] rounded-full overflow-hidden w-full mx-auto shadow-inner">
                <div 
                   className="h-full bg-[#1A1A1A] transition-all duration-300 ease-out"
                   style={{ width: `${generationProgress}%` }}
                />
             </div>
             <div className="mt-4 text-xs font-mono uppercase tracking-widest text-[#A8A196] font-bold">
                {Math.floor(generationProgress)}% {t('studio.complete')}
             </div>
             {videoStatus && (
               <div className="mt-3 text-xs text-[#C5A880] font-medium animate-pulse">
                 {videoStatus}
               </div>
             )}
           </div>
         )}

         {rightPanelState === 'PLAYER' && (
           <div className="w-full h-full max-h-[90vh] flex flex-col items-center justify-center py-4">
             <div className="w-full max-w-[min(380px,75vh)] mx-auto flex flex-col h-full">
               <div className="flex items-center justify-between mb-4 shrink-0 px-2">
                   <div className="flex items-center gap-3">
                     <h3 className="uppercase text-[10px] font-bold tracking-widest text-[#A8A196]">{t('studio.previewMode')}</h3>
                     <button 
                        onClick={() => setIsAssetsModalOpen(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E1DA] rounded-lg text-[9px] font-bold uppercase tracking-tighter text-[#1A1A1A] hover:border-[#C5A880] transition-all shadow-sm"
                     >
                        <Archive className="w-3 h-3 text-[#C5A880]" />
                        Library
                     </button>
                   </div>
                   <div className="text-[10px] font-mono font-bold text-[#C5A880]">{currentSceneIndex + 1} / {scenes.length}</div>
               </div>

               <div className="relative bg-black aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-2xl ring-8 ring-white group flex flex-col justify-center flex-1 min-h-0">
                  {scenes[currentSceneIndex]?.video ? (
                    <div className="absolute inset-0 block bg-black">
                        <video 
                          key={`video-${currentSceneIndex}`}
                          src={scenes[currentSceneIndex].video} 
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                    </div>
                  ) : scenes[currentSceneIndex]?.image ? (
                    <div className="absolute inset-0 block bg-black">
                        <img 
                          src={scenes[currentSceneIndex].image} 
                          alt="scene background" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-[4000ms] ease-linear scale-100"
                          style={{ transform: isPlaying ? 'scale(1.1)' : 'scale(1)' }} 
                        />
                    </div>
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/40 pointer-events-none"></div>
                  
                  <div className="absolute inset-x-0 bottom-0 z-20 p-8 pt-20 flex flex-col items-start justify-end pointer-events-none">
                    <p 
                       key={currentSceneIndex} 
                       className="font-sans text-xl sm:text-2xl font-bold text-white leading-tight tracking-tight drop-shadow-2xl text-balance"
                       style={{
                           animation: isPlaying ? 'fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
                           opacity: isPlaying ? 0 : 1
                       }}
                    >
                       {scenes[currentSceneIndex]?.phrase}
                    </p>
                    
                    <div className="opacity-40 mt-6 w-full h-[3px] bg-white/20 rounded-full overflow-hidden">
                       {isPlaying && <div className="h-full bg-white w-full animate-progress-bar origin-left" />}
                    </div>
                  </div>

                  {!isPlaying && (
                      <button 
                          onClick={playSequence}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all hover:bg-black/30 z-30"
                      >
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 text-[#1A1A1A]">
                              <Play className="w-6 h-6 ml-1 fill-current" />
                          </div>
                      </button>
                  )}
               </div>
               
               <div className="mt-6 flex justify-center items-center gap-2 px-2 shrink-0">
                   {scenes.map((_, i) => (
                       <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentSceneIndex ? 'w-8 bg-[#C5A880]' : 'w-2 bg-[#E5E1DA]'}`}/>
                   ))}
               </div>

               <style>{`
                  @keyframes fadeInUp {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                  }
                  @keyframes progress-bar {
                      0% { transform: scaleX(0); }
                      100% { transform: scaleX(1); }
                  }
                  .animate-progress-bar {
                      animation: progress-bar 4s linear forwards;
                  }
               `}</style>
             </div>
           </div>
         )}
      </div>
      {/* SETTINGS MODAL */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* SUGGESTIONS MODAL */}
      <SuggestionsModal
        isOpen={isSuggestionsModalOpen}
        suggestions={suggestions}
        isSuggesting={isSuggesting}
        onClose={() => setIsSuggestionsModalOpen(false)}
        onSelect={(suggestion) => {
          setTopic(suggestion);
          setIsSuggestionsModalOpen(false);
        }}
        onRefresh={handleRefreshSuggestions}
      />

      {/* ERROR MODAL */}
      <ErrorModal error={error} onClose={() => setError(null)} />

      {/* ASSETS MODAL */}
      {isAssetsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#FAF9F7] w-full max-w-4xl max-h-[85vh] p-8 rounded-[3rem] border border-[#E5E1DA] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-sans font-bold text-[#1A1A1A]">{t('studio.mediaLibrary')}</h2>
                  <p className="text-[#A8A196] text-sm mt-1">{t('studio.librarySubtitle')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex bg-white rounded-full p-1 border border-[#E5E1DA] shadow-sm">
                    <button 
                      onClick={handleExportFast}
                      disabled={isExportingVideo}
                      className="flex items-center gap-2 bg-[#C5A880] text-white px-4 py-2 rounded-full text-xs font-bold tracking-wide hover:bg-[#B3966D] transition-colors disabled:opacity-75 disabled:cursor-wait"
                      title={t('studio.fastExportTitle')}
                    >
                      {isExportingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                      {isExportingVideo ? `Fast ${Math.round(exportProgress)}%` : t('studio.btnFastExport')}
                    </button>
                    <button 
                      onClick={handleExportMP4}
                      disabled={isExportingVideo}
                      className="flex items-center gap-2 bg-transparent text-[#1A1A1A] px-4 py-2 rounded-full border border-transparent text-xs font-bold tracking-wide hover:bg-[#F5F2EE] transition-colors disabled:opacity-50"
                      title={t('studio.hqExportTitle')}
                    >
                      {t('studio.btnHqExport')}
                    </button>
                  </div>
                  <button 
                    onClick={handleDownloadAllZip}
                    disabled={isExportingVideo}
                    className="flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full text-sm font-bold tracking-wide hover:bg-black transition-colors disabled:opacity-50"
                  >
                    <Archive className="w-4 h-4" />
                    {t('studio.btnDownloadAll')}
                  </button>
                  <button onClick={() => setIsAssetsModalOpen(false)} disabled={isExportingVideo} className="bg-white border border-[#E5E1DA] p-2 rounded-full text-[#A8A196] hover:text-[#1A1A1A] transition-colors disabled:opacity-50">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-12 pr-2">
                {/* Images Grid */}
                <div className="space-y-6">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-[#A8A196]">Scenes & Illustrations</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {scenes.map((scene, idx) => (
                      <div key={idx} className="group relative bg-white border border-[#E5E1DA] rounded-3xl overflow-hidden shadow-sm aspect-square">
                        {scene.video ? (
                          <>
                            <video src={scene.video} muted loop autoPlay playsInline className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                              <p className="text-white text-[10px] mb-4 line-clamp-3 leading-relaxed">{scene.phrase}</p>
                              <button 
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = scene.video!;
                                  link.download = `heartlines-scene-${idx+1}-animated.mp4`;
                                  link.click();
                                }}
                                className="bg-white text-[#1A1A1A] px-4 py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform"
                              >
                                Download MP4
                              </button>
                            </div>
                            <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#C5A880] text-white text-[8px] font-bold uppercase tracking-wider rounded-full shadow-md">
                              Animated
                            </div>
                          </>
                        ) : scene.image ? (
                          <>
                            <img src={scene.image} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                              <p className="text-white text-[10px] mb-4 line-clamp-3 leading-relaxed">{scene.phrase}</p>
                              <button 
                                onClick={() => downloadImage(scene.image!, idx)}
                                className="bg-white text-[#1A1A1A] px-4 py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform"
                              >
                                Download PNG
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#A8A196] space-y-2 opacity-50">
                            <ImageIcon className="w-8 h-8" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Pending...</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 w-6 h-6 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white text-[10px] font-mono">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audio Asset */}
                <div className="space-y-6">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-[#A8A196]">Audio Soundtrack</h3>
                  <div className="bg-white border border-[#E5E1DA] rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                    <div className="w-16 h-16 bg-[#F5F2EE] rounded-full flex items-center justify-center flex-shrink-0">
                      <Music className="w-8 h-8 text-[#C5A880]" />
                    </div>
                    <div className="flex-1 text-center md:text-left min-w-0">
                       <h4 className="font-bold text-[#1A1A1A] truncate">Full Narration Stream</h4>
                       <p className="text-sm text-[#7A7570] mt-1">High-fidelity voice synthesis using {selectedVoice}</p>
                    </div>
                    {wavUrl ? (
                      <div className="flex flex-col items-center flex-wrap md:items-end gap-3 w-full md:w-auto z-50 shrink-0 pointer-events-auto">
                        <button 
                          onClick={async () => {
                            if (!fullAudio) return;
                            try {
                               await playPcmAudio(fullAudio.data);
                            } catch(e) {
                               console.error(e);
                            }
                          }}
                          className="flex items-center justify-center gap-2 bg-[#F5F2EE] border border-[#E5E1DA] rounded-full px-6 py-3 text-sm font-bold text-[#1A1A1A] hover:bg-white transition-all w-full md:w-auto shadow-sm"
                        >
                           <Play className="w-4 h-4 ml-1" />
                           Preview Audio
                        </button>
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = wavUrl;
                            link.download = "heartlines-narration.wav";
                            link.click();
                          }}
                          className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-[#A8A196] hover:text-[#C5A880] transition-colors mt-1"
                        >
                          <Download className="w-4 h-4" />
                          Download WAV
                        </button>
                      </div>
                    ) : (
                      <div className="px-8 py-4 bg-[#F5F2EE] text-[#A8A196] rounded-full text-sm font-bold animate-pulse">
                        Waiting for completion...
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Share Section */}
                <div className="space-y-6 pb-8">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-[#A8A196]">Partagez votre chef-d'œuvre</h3>
                  <div className="bg-[#1A1A1A] rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 blur-2xl bg-gradient-to-br from-[#C5A880] to-transparent w-64 h-64 rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
                    
                    <div className="relative z-10 space-y-2 text-center md:text-left">
                       <h4 className="text-2xl font-bold font-sans tracking-tight flex items-center justify-center md:justify-start gap-3">
                          Prêt pour le buzz ?
                          <Sparkles className="w-5 h-5 text-[#C5A880]" />
                       </h4>
                       <p className="text-white/60 text-sm max-w-xs">
                          Partagez votre vidéo directement ou lancez l'application pour l'uploader.
                       </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center justify-center gap-4">
                       {exportedVideoBlob && (
                         <button 
                           onClick={handleShareVideo}
                           className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-xl"
                         >
                            <Share2 className="w-5 h-5" />
                            Partager la Vidéo
                         </button>
                       )}

                       <div className="flex items-center gap-3 bg-white/10 p-2 rounded-full border border-white/10 backdrop-blur-md">
                          <a 
                            href="https://www.tiktok.com/upload" 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors group/link"
                            title="Upload to TikTok"
                          >
                             <svg className="w-5 h-5 fill-white group-hover/link:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.47V15c0 1.53-.45 3.12-1.57 4.21-1.12 1.11-2.73 1.63-4.27 1.78-1.54.15-3.12-.41-4.22-1.52-1.12-1.1-1.63-2.72-1.78-4.26-.15-1.54.4-3.12 1.51-4.22 1.11-1.12 2.72-1.63 4.26-1.78 1.54-.15 3.12.41 4.22 1.52.12.12.24.25.35.38V.02z" />
                             </svg>
                          </a>
                          <a 
                            href="https://www.facebook.com/" 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors group/link"
                            title="Share on Facebook"
                          >
                             <Facebook className="w-5 h-5 text-white group-hover/link:scale-110 transition-transform" />
                          </a>
                          <a 
                            href="https://www.youtube.com/upload" 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors group/link"
                            title="Upload to YouTube"
                          >
                             <Youtube className="w-5 h-5 text-white group-hover/link:scale-110 transition-transform" />
                          </a>
                       </div>
                    </div>
                  </div>
                  {!exportedVideoBlob && (
                     <p className="text-center text-[10px] text-[#A8A196] font-bold uppercase tracking-widest mt-4">
                        💡 Exportez la vidéo d'abord pour activer le partage direct
                     </p>
                  )}
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
