import React, { useState } from 'react';
import { generatePoem, generateImageForPhrase, generateFullPoemAudio, playPcmAudio, generateTopicSuggestions } from '../services/gemini';
import { ApiKeyInput } from './ApiKeyInput';
import { Loader2, Play, CheckCircle2, Wand2, Edit3, Image as ImageIcon, Music, Settings, X, Feather, Sparkles } from 'lucide-react';

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
  const [fullAudioPcm, setFullAudioPcm] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [rightPanelState, setRightPanelState] = useState<'IDLE' | 'GENERATING' | 'PLAYER'>('IDLE');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Model Settings
  const [scriptModel, setScriptModel] = useState('gemini-3-flash-preview');
  const [imageModel, setImageModel] = useState('gemini-2.5-flash-image');
  const [ttsModel, setTtsModel] = useState('gemini-2.5-flash-tts');

  const handleKeySubmit = (key: string) => {
    localStorage.setItem('GEMINI_API_KEY', key);
    setApiKey(key);
  };

  const handleGeneratePoem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    try {
      setIsGeneratingPoem(true);
      const phrases = await generatePoem(apiKey, topic, scriptModel);
      setScenes(phrases.map(phrase => ({ phrase })));
      setRightPanelState('IDLE');
    } catch (err) {
      alert("Error generating poem. Check API Key or try again.");
      console.error(err);
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
      // 1. Generate Images
      const updatedScenes = await Promise.all(scenes.map(async (scene) => {
        try {
          const image = await generateImageForPhrase(apiKey, scene.phrase, imageStyle, imageModel);
          completedCount++;
          setGenerationProgress((completedCount / totalTasks) * 100);
          return { ...scene, image };
        } catch (e) {
          console.error("Error generating image:", e);
          completedCount++;
          setGenerationProgress((completedCount / totalTasks) * 100);
          return scene;
        }
      }));
      setScenes(updatedScenes);

      // 2. Generate Full Audio
      const fullText = scenes.map(s => s.phrase).join(". ");
      const audio = await generateFullPoemAudio(apiKey, fullText, ttsModel);
      setFullAudioPcm(audio);
      
      completedCount++;
      setGenerationProgress(100);
      setRightPanelState('PLAYER');
    } catch (err) {
      alert("Error generating production assets.");
      setRightPanelState('IDLE');
    }
  };

  const handleScenePhraseChange = (index: number, newPhrase: string) => {
    const newScenes = [...scenes];
    newScenes[index].phrase = newPhrase;
    setScenes(newScenes);
  };

  const playSequence = async () => {
    if (isPlaying || !fullAudioPcm) return;
    setIsPlaying(true);
    setCurrentSceneIndex(0);

    try {
        await playPcmAudio(fullAudioPcm, (percent) => {
            // Calculate which scene should be visible based on playback percentage
            const sceneIndex = Math.min(
                Math.floor((percent / 100) * scenes.length),
                scenes.length - 1
            );
            setCurrentSceneIndex(sceneIndex);
        });
    } catch(e) {
        console.error("Playback error", e);
    } finally {
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
                          console.error("Suggestions failed", e);
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60 pointer-events-none"></div>
                
                <div className="relative z-10 px-6 text-center flex flex-col items-center justify-center h-full gap-8">
                  <p 
                     key={currentSceneIndex} 
                     className="font-sans text-2xl font-bold text-white/90 leading-snug tracking-wide drop-shadow-2xl"
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
                        className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all hover:bg-black/20 group-hover:backdrop-blur-none"
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
                    <option value="gemini-2.5-flash-tts">Gemini 2.5 Flash TTS</option>
                    <option value="gemini-2.5-pro-tts">Gemini 2.5 Pro TTS</option>
                    <option value="gemini-3.1-flash-tts-preview">Gemini 3.1 Flash TTS</option>
                  </select>
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
    </div>
  );
}
