import React, { useState, useMemo, useEffect } from 'react';
import { generatePoem, generateImageForPhrase, generateFullPoemAudio, playPcmAudio, generateTopicSuggestions, AVAILABLE_VOICES, audioDataToBlob } from '../services/gemini';
import { ApiKeyInput } from './ApiKeyInput';
import { Loader2, Play, CheckCircle2, Wand2, Edit3, Image as ImageIcon, Music, Settings, X, Feather, Sparkles, AlertCircle, Download, Archive } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type Step = 'TOPIC' | 'REVIEW' | 'GENERATING' | 'PLAYER';

interface Scene {
  phrase: string;
  image?: string;
}

export function WorkflowApp() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('GEMINI_API_KEY') || '');
  const [topic, setTopic] = useState('');
  const [imageStyle, setImageStyle] = useState('cinematic soft noir, 35mm film grain, melancholic warm lighting, ultra-detailed textures, ethereal atmosphere');
  const [isGeneratingPoem, setIsGeneratingPoem] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [fullAudio, setFullAudio] = useState<{data: string, mimeType: string} | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<{title: string, message: string} | null>(null);
  const [rightPanelState, setRightPanelState] = useState<'IDLE' | 'GENERATING' | 'PLAYER'>('IDLE');
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [wavUrl, setWavUrl] = useState<string | null>(null);

  useEffect(() => {
    if (fullAudio) {
      try {
        const url = URL.createObjectURL(audioDataToBlob(fullAudio.data, fullAudio.mimeType));
        setWavUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch(e) {
        console.error("Failed to convert audio to Blob", e);
      }
    } else {
      setWavUrl(null);
    }
  }, [fullAudio]);

  // Model Settings
  const [scriptModel, setScriptModel] = useState('gemini-3-flash-preview');
  const [imageModel, setImageModel] = useState('gemini-2.5-flash-image');
  const [ttsModel, setTtsModel] = useState('gemini-3.1-flash-tts-preview');
  const [selectedVoice, setSelectedVoice] = useState('Kore');

  const handleKeySubmit = (key: string) => {
    localStorage.setItem('GEMINI_API_KEY', key);
    setApiKey(key);
  };

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

  const handleGeneratePoem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    try {
      setIsGeneratingPoem(true);
      const phrases = await generatePoem(apiKey, topic, scriptModel);
      setScenes(phrases.map(phrase => ({ phrase })));
      setFullAudio(null);
      setRightPanelState('IDLE');
    } catch (err) {
      setError(parseGeminiError(err));
      setRightPanelState('IDLE');
    } finally {
      setIsGeneratingPoem(false);
    }
  };

  const handleGenerateMedia = async () => {
    setRightPanelState('GENERATING');
    setGenerationProgress(0);
    
    let completedCount = 0;
    const totalTasks = scenes.length + 1; // Images + 1 Full Audio
    
    try {
      let currentScenes = [...scenes];
      
      // 1. Generate Images one by one
      for (let i = 0; i < currentScenes.length; i++) {
        if (currentScenes[i].image) {
          completedCount++;
          setGenerationProgress((completedCount / totalTasks) * 100);
          continue;
        }

        try {
          const image = await generateImageForPhrase(apiKey, currentScenes[i].phrase, imageStyle, imageModel);
          const newScenes = [...currentScenes];
          newScenes[i] = { ...newScenes[i], image };
          currentScenes = newScenes;
          setScenes(newScenes);
          completedCount++;
          setGenerationProgress((completedCount / totalTasks) * 100);
        } catch (e: any) {
          const errorInfo = parseGeminiError(e);
          if (errorInfo.title === "Quota Exceeded") {
            setError(errorInfo);
            // We stay in GENERATING state so the progress bar/images generated stay visible
            return; 
          }
          console.error(`Error scene ${i}:`, e);
          completedCount++;
          setGenerationProgress((completedCount / totalTasks) * 100);
        }
      }

      // 2. Generate Full Audio
      if (!fullAudio) {
        try {
          const fullText = currentScenes.map(s => s.phrase).join(". ");
          const audio = await generateFullPoemAudio(apiKey, fullText, ttsModel, selectedVoice);
          setFullAudio(audio);
        } catch (e: any) {
          setError(parseGeminiError(e));
        }
      }
      
      completedCount++;
      setGenerationProgress(100);
      setRightPanelState('PLAYER');
    } catch (err) {
      setError(parseGeminiError(err));
    }
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

  const handleScenePhraseChange = (index: number, newPhrase: string) => {
    const newScenes = [...scenes];
    newScenes[index].phrase = newPhrase;
    setScenes(newScenes);
  };

  const playSequence = async () => {
    if (isPlaying || !wavUrl) return;
    setIsPlaying(true);
    setCurrentSceneIndex(0);

    const audio = new Audio(wavUrl);
    
    audio.onended = () => {
      setIsPlaying(false);
    };
    
    audio.onerror = (e) => {
      console.error("Audio playback error", e);
      setIsPlaying(false);
    };
    
    audio.ontimeupdate = () => {
      if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        const sceneIndex = Math.min(
            Math.floor((percent / 100) * scenes.length),
            scenes.length - 1
        );
        setCurrentSceneIndex(sceneIndex);
      }
    };

    try {
        await audio.play();
    } catch(e) {
        console.error("Playback error", e);
        setIsPlaying(false);
    }
  };

  if (!apiKey) {
    return <ApiKeyInput onKeySubmit={handleKeySubmit} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#2D2D2D] font-sans flex flex-col lg:flex-row overflow-hidden selection:bg-[#C5A880]/20">
      {/* LEFT PANEL: Editor & Settings */}
      <div className="w-full lg:w-1/2 p-6 lg:p-12 overflow-y-auto border-b lg:border-b-0 lg:border-r border-[#E5E1DA] h-auto lg:h-screen transition-all">
        <div className="max-w-xl mx-auto space-y-12">
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-sans font-bold mb-4 leading-tight tracking-tight text-[#2D2D2D] flex items-center gap-4">
                Heartlines 
                <span className="bg-[#1A1A1A] text-white px-4 py-1 rounded-xl -rotate-2 font-normal text-3xl inline-block shadow-xl border border-[#333]">
                  Editor
                </span>
                <Feather className="w-6 h-6 text-[#C5A880] opacity-60" />
              </h1>
              <p className="text-[#7A7570] text-base">
                Set your topic and visual style, then craft your emotional story.
              </p>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-white border border-[#E5E1DA] rounded-full text-[#A8A196] hover:text-[#1A1A1A] hover:border-[#C5A880] transition-all shadow-sm"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleGeneratePoem} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-[#A8A196] mb-2">Topic / Feeling</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E5E1DA] to-[#C5A880] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                  <div className="relative bg-white border border-[#E5E1DA] rounded-2xl overflow-hidden focus-within:border-[#C5A880] transition-colors shadow-sm">
                    <textarea
                      required
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g. You Inside Me, finding love again..."
                      className="w-full bg-transparent p-4 pr-12 text-[#1A1A1A] text-base placeholder-[#A8A196] focus:outline-none resize-none min-h-[120px]"
                    />
                    <button
                      type="button"
                      disabled={isSuggesting}
                      onClick={async () => {
                        try {
                          setIsSuggesting(true);
                          const suggestionsList = await generateTopicSuggestions(apiKey, scriptModel);
                          setSuggestions(suggestionsList);
                          setIsSuggestionsModalOpen(true);
                        } catch (e) {
                          setError(parseGeminiError(e));
                        } finally {
                          setIsSuggesting(false);
                        }
                      }}
                      className="absolute bottom-3 right-3 p-2 bg-[#FAF9F7] text-[#A8A196] hover:text-[#C5A880] rounded-xl transition-all shadow-sm border border-[#E5E1DA] disabled:opacity-50"
                      title="Suggest a feeling (AI)"
                    >
                      <Feather className={`w-4 h-4 ${isSuggesting ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-[#A8A196] mb-2">Visual Style Settings</label>
                <div className="relative bg-white border border-[#E5E1DA] rounded-xl overflow-hidden focus-within:border-[#C5A880] transition-colors shadow-sm">
                   <input
                    type="text"
                    value={imageStyle}
                    onChange={e => setImageStyle(e.target.value)}
                    placeholder="e.g. cinematic soft noir, 35mm film grain, warm melancholic lighting..."
                    className="w-full bg-transparent p-4 text-[#1A1A1A] text-sm placeholder-[#A8A196] focus:outline-none"
                  />
                </div>
                <p className="mt-2 text-[10px] text-[#A8A196] leading-relaxed italic">
                  Tip: Describe colors (teal and orange), lighting (golden hour), and camera (35mm lens) for best consistency.
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
                  <span>Writing lines...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Script</span>
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
                <h2 className="text-2xl font-sans font-semibold text-[#1A1A1A]">Review Sequence</h2>
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
                  <span>Start Production</span>
                  <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="pt-12 text-center">
             <button 
                onClick={() => {
                    setApiKey('');
                    localStorage.removeItem('GEMINI_API_KEY');
                }}
                className="text-xs font-bold tracking-widest uppercase text-[#A8A196] hover:text-[#1A1A1A] transition-colors"
                title="Sign out / Remove API Key"
             >
                Remove API Key
             </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Player or Generating */}
      <div className="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col items-center justify-center bg-[#FDFCFB] relative h-screen">
         {(rightPanelState !== 'IDLE' || scenes.some(s => s.image)) && (
           <div className="absolute top-8 right-8 z-20 flex gap-2">
             <button 
                onClick={() => setIsAssetsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-[#E5E1DA] rounded-full text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:bg-white hover:border-[#C5A880] transition-all shadow-sm"
             >
                <ImageIcon className="w-4 h-4" />
                Library
             </button>
           </div>
         )}

         {rightPanelState === 'IDLE' && (
           <div className="text-center opacity-40">
             <ImageIcon className="w-16 h-16 mx-auto mb-4 text-[#A8A196]" />
             <p className="font-sans font-medium text-lg text-[#7A7570]">Your masterpiece awaits...</p>
           </div>
         )}

         {rightPanelState === 'GENERATING' && (
           <div className="w-full max-w-sm mx-auto text-center">
             <div className="relative w-24 h-24 mx-auto mb-10 text-[#C5A880]">
               <Loader2 className="w-24 h-24 animate-spin opacity-20 relative z-10" strokeWidth={1} />
               <div className="absolute inset-0 flex items-center justify-center -space-x-1">
                  <ImageIcon className="w-5 h-5 text-[#A8A196] rotate-[-10deg] animate-pulse" />
                  <Music className="w-5 h-5 text-[#A8A196] rotate-[10deg] animate-pulse delay-150" />
               </div>
             </div>

             <h2 className="text-2xl font-sans text-[#1A1A1A] font-semibold mb-3">Crafting the experience...</h2>
             <p className="text-[#7A7570] mb-8 mx-auto leading-relaxed text-sm">
               Generating 4K moody images and rendering high-fidelity AI audio streams for {scenes.length} beautiful scenes.
             </p>

             <div className="h-1 bg-[#E5E1DA] rounded-full overflow-hidden w-full mx-auto shadow-inner">
                <div 
                   className="h-full bg-[#1A1A1A] transition-all duration-300 ease-out"
                   style={{ width: `${generationProgress}%` }}
                />
             </div>
             <div className="mt-4 text-xs font-mono uppercase tracking-widest text-[#A8A196] font-bold">
                {Math.floor(generationProgress)}% complete
             </div>
           </div>
         )}

         {rightPanelState === 'PLAYER' && (
           <div className="w-full max-w-sm mx-auto">
             <div className="flex items-center justify-between mb-6">
                 <h3 className="uppercase text-xs font-bold tracking-widest text-[#A8A196]">Preview</h3>
             </div>

             <div className="relative bg-black aspect-[9/16] rounded-2xl overflow-hidden shadow-xl ring-4 ring-white group flex flex-col justify-center">
                {scenes[currentSceneIndex]?.image && (
                  <div className="absolute inset-0 block bg-black">
                      <img 
                        src={scenes[currentSceneIndex].image} 
                        alt="scene background" 
                        className="w-full h-full object-cover transition-transform duration-[4000ms] ease-linear scale-100 will-change-transform"
                        style={{ transform: isPlaying ? 'scale(1.05)' : 'scale(1)' }} 
                      />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 pointer-events-none"></div>
                
                <div className="absolute inset-x-0 bottom-0 z-20 p-8 pt-20 flex flex-col items-center justify-end pointer-events-none">
                  <p 
                     key={currentSceneIndex} 
                     className="font-sans text-2xl font-bold text-white/90 leading-snug tracking-wide drop-shadow-2xl text-balance"
                     style={{
                         animation: isPlaying ? 'fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
                         opacity: isPlaying ? 0 : 1
                     }}
                  >
                     {scenes[currentSceneIndex]?.phrase}
                  </p>
                  
                  <div className="opacity-70 mt-8 w-12 h-1 bg-white/30 rounded-full overflow-hidden">
                     {isPlaying && <div className="h-full bg-white w-full animate-progress-bar origin-left" />}
                  </div>
                </div>

                {!isPlaying && (
                    <button 
                        onClick={playSequence}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all hover:bg-black/20 group-hover:backdrop-blur-none z-30"
                    >
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl transition-transform hover:scale-110 active:scale-95 text-white">
                            <Play className="w-8 h-8 ml-1" />
                        </div>
                    </button>
                )}
                
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
             
             <div className="mt-6 flex justify-between items-center px-2 text-[#7A7570] text-[10px] font-mono">
                 <div className="flex space-x-1">
                     {scenes.map((_, i) => (
                         <div key={i} className={`h-1 w-6 rounded-full transition-colors duration-500 ${i === currentSceneIndex ? 'bg-[#1A1A1A]' : 'bg-[#E5E1DA]'}`}/>
                     ))}
                 </div>
                 <div className="font-bold">{currentSceneIndex + 1} / {scenes.length}</div>
             </div>
           </div>
         )}
      </div>
      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-[#FAF9F7] w-full max-w-md p-8 rounded-3xl border border-[#E5E1DA] shadow-2xl space-y-8 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-sans font-bold text-[#1A1A1A]">Settings</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="text-[#A8A196] hover:text-[#1A1A1A] transition-colors p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-[#A8A196] mb-3">Generation Model (Text)</label>
                  <select 
                    value={scriptModel} 
                    onChange={e => setScriptModel(e.target.value)}
                    className="w-full bg-white border border-[#E5E1DA] p-4 rounded-xl text-sm focus:outline-none focus:border-[#C5A880] appearance-none"
                  >
                    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Ultra Fast)</option>
                    <option value="gemini-3-flash-preview">Gemini 3 Flash (Fast)</option>
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Advanced)</option>
                    <option value="gemini-2.5-flash-preview">Gemini 2.5 Flash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-[#A8A196] mb-3">Visual Model (Image)</label>
                  <select 
                    value={imageModel} 
                    onChange={e => setImageModel(e.target.value)}
                    className="w-full bg-white border border-[#E5E1DA] p-4 rounded-xl text-sm focus:outline-none focus:border-[#C5A880] appearance-none"
                  >
                    <option value="gemini-2.5-flash-image">Gemini 2.5 Flash Image (Nano Banana)</option>
                    <option value="gemini-3.1-flash-image-preview">Gemini 3.1 Flash Image (High Quality)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-[#A8A196] mb-3">Speech Model (TTS)</label>
                  <select 
                    value={ttsModel} 
                    onChange={e => setTtsModel(e.target.value)}
                    className="w-full bg-white border border-[#E5E1DA] p-4 rounded-xl text-sm focus:outline-none focus:border-[#C5A880] appearance-none"
                  >
                    <option value="gemini-3.1-flash-tts-preview">Gemini 3.1 Flash TTS (Recommended)</option>
                    <option value="gemini-3.1-pro-tts-preview">Gemini 3.1 Pro TTS</option>
                    <option value="gemini-2.5-flash-preview-tts">Gemini 2.5 Flash TTS Preview</option>
                    <option value="gemini-2.5-pro-preview-tts">Gemini 2.5 Pro TTS Preview</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-[#A8A196] mb-3">AI Voice (Tone)</label>
                  <select 
                    value={selectedVoice} 
                    onChange={e => setSelectedVoice(e.target.value)}
                    className="w-full bg-white border border-[#E5E1DA] p-4 rounded-xl text-sm focus:outline-none focus:border-[#C5A880] appearance-none"
                  >
                    {AVAILABLE_VOICES.map(voice => (
                      <option key={voice} value={voice}>{voice}</option>
                    ))}
                  </select>
                  <p className="mt-2 text-[10px] text-[#A8A196] leading-relaxed italic">
                    Available: Puck (M), Charon (M), Kore (F), Fenrir (M), Aoede (F).
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full bg-[#1A1A1A] text-white font-bold py-4 rounded-full transition-transform active:scale-95"
              >
                Save Configuration
              </button>
           </div>
        </div>
      )}
      {/* SUGGESTIONS MODAL */}
      {isSuggestionsModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#FAF9F7] w-full max-w-lg p-8 rounded-3xl border border-[#E5E1DA] shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-sans font-bold text-[#1A1A1A]">AI Suggestions</h2>
                  <p className="text-[#A8A196] text-xs font-bold uppercase tracking-widest mt-1">Pick a theme for your next masterpiece</p>
                </div>
                <button onClick={() => setIsSuggestionsModalOpen(false)} className="text-[#A8A196] hover:text-[#1A1A1A] transition-colors p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid gap-3">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTopic(suggestion);
                      setIsSuggestionsModalOpen(false);
                    }}
                    className="w-full text-left p-5 bg-white border border-[#E5E1DA] rounded-2xl hover:border-[#C5A880] hover:bg-[#FAF9F7] transition-all group relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E5E1DA] group-hover:bg-[#C5A880] transition-colors"></div>
                    <span className="text-[#1A1A1A] font-medium block">{suggestion}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={async () => {
                   setIsSuggesting(true);
                   try {
                     const suggestionsList = await generateTopicSuggestions(apiKey, scriptModel);
                     setSuggestions(suggestionsList);
                   } catch (e) {
                     setError(parseGeminiError(e));
                   } finally {
                     setIsSuggesting(false);
                   }
                }}
                disabled={isSuggesting}
                className="w-full py-4 border border-dashed border-[#C5A880] text-[#C5A880] rounded-2xl font-bold text-sm hover:bg-[#C5A880]/5 transition-colors flex items-center justify-center gap-2"
              >
                {isSuggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Feather className="w-4 h-4" />}
                Generate more ideas
              </button>
           </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {error && (
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
                <p className="text-[11px] font-bold text-[#A8A196] uppercase tracking-wider mb-2">How to solve this?</p>
                <ul className="text-xs text-[#7A7570] space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#C5A880]/10 text-[#C5A880] flex items-center justify-center flex-shrink-0">1</span>
                    Wait 60 seconds before trying again (Free Tier limits).
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#C5A880]/10 text-[#C5A880] flex items-center justify-center flex-shrink-0">2</span>
                    Try a different model (Flash models are faster but have stricter limits).
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#C5A880]/10 text-[#C5A880] flex items-center justify-center flex-shrink-0">3</span>
                    Open the **Library** to download assets already generated!
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => setError(null)}
                className="w-full py-4 bg-[#1A1A1A] text-white rounded-full font-bold text-sm hover:bg-black transition-colors"
              >
                Understood
              </button>
           </div>
        </div>
      )}

      {/* ASSETS MODAL */}
      {isAssetsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#FAF9F7] w-full max-w-4xl max-h-[85vh] p-8 rounded-[3rem] border border-[#E5E1DA] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-sans font-bold text-[#1A1A1A]">Media Library</h2>
                  <p className="text-[#A8A196] text-sm mt-1">All assets generated for this production</p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleDownloadAllZip}
                    className="flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full text-sm font-bold tracking-wide hover:bg-black transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    Download All (ZIP)
                  </button>
                  <button onClick={() => setIsAssetsModalOpen(false)} className="bg-white border border-[#E5E1DA] p-2 rounded-full text-[#A8A196] hover:text-[#1A1A1A] transition-colors">
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
                        {scene.image ? (
                          <>
                            <img src={scene.image} alt="" className="w-full h-full object-cover" />
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
                          onClick={() => {
                            if (!wavUrl) return;
                            try {
                               const a = new Audio(wavUrl);
                               a.play();
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
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
