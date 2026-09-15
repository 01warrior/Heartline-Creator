import React, { useState } from 'react';
import { useStudioSettings } from '../context/StudioSettingsContext';
import { generateStoryboard } from '../services/gemini';
import { CustomSelect } from '../components/studio/StudioSettingsPanel';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  SparklesIcon, 
  Copy01Icon, 
  Film02Icon, 
  UserCircleIcon,
  VideoReplayIcon,
  CheckmarkBadge01Icon,
  Alert02Icon
} from '@hugeicons/core-free-icons';

interface Character {
  name: string;
  description: string;
  visualBlock: string;
  imagePrompt: string;
}

interface Scene {
  sceneNumber: number;
  frenchSummary?: string;
  imagePrompt: string;
  videoPrompt: string;
}

interface StoryboardData {
  characters: Character[];
  scenes: Scene[];
}

export function StoryboardPage() {
  const { apiKey, scriptModel } = useStudioSettings();
  
  const [story, setStory] = useState('');
  const [style, setStyle] = useState('Cinematic Noir');
  const [totalDuration, setTotalDuration] = useState<number>(60);
  const [sceneDuration, setSceneDuration] = useState<number>(10);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [storyboard, setStoryboard] = useState<StoryboardData | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Veuillez configurer votre clé API Gemini dans les paramètres.");
      return;
    }
    if (!story.trim()) {
      setError("Veuillez entrer une histoire ou un script.");
      return;
    }
    if (totalDuration < sceneDuration) {
      setError("La durée totale doit être supérieure ou égale à la durée d'une scène.");
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      const data = await generateStoryboard(apiKey, scriptModel, story, style, totalDuration, sceneDuration);
      setStoryboard(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la génération du storyboard.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-[#FAF9F7] px-4 sm:px-8 lg:px-12 py-6 sm:py-8 flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E1DA]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] flex items-center gap-3">
            <HugeiconsIcon icon={Film02Icon} size={32} className="text-amber-500" />
            Directeur IA & Storyboard
          </h1>
          <p className="text-sm text-[#8C8275] mt-1 font-medium max-w-2xl">
            Générez un storyboard professionnel avec vos prompts Midjourney et Runway/Kling pré-découpés pour vos vidéos externes.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E1DA] shadow-sm flex flex-col lg:flex-row gap-8">
        
        {/* Left: Story */}
        <div className="flex-1 flex flex-col gap-3">
          <label className="text-sm font-bold text-[#1A1A1A]">L'histoire (Drames, rebondissements, actions)</label>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Décrivez votre histoire ici. Ex: Un astronaute se retrouve seul sur Mars, il découvre une ancienne ruine..."
            className="w-full h-40 p-4 rounded-xl border border-[#E5E1DA] bg-[#FAF9F7] text-[#1A1A1A] resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
          />
        </div>

        {/* Right: Settings */}
        <div className="w-full lg:w-80 flex flex-col gap-5">
          <CustomSelect
            label="Style Visuel"
            value={style}
            onChange={setStyle}
            options={[
              { value: "Cinematic Noir", label: "Cinematic Noir", description: "Film sombre" },
              { value: "Pixar 3D", label: "Pixar 3D", description: "Animation moderne" },
              { value: "Hyper Realistic", label: "Hyper Réaliste", description: "Photographie" },
              { value: "Vintage Anime", label: "Vintage Anime", description: "Style 90s" },
              { value: "Cyberpunk", label: "Cyberpunk", description: "Néon, futuriste" }
            ]}
          />

          <div className="flex gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-bold text-[#1A1A1A]">Durée totale (s)</label>
              <input
                type="number"
                value={totalDuration}
                onChange={(e) => setTotalDuration(Number(e.target.value))}
                min={10}
                max={300}
                className="w-full p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F7] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-bold text-[#1A1A1A]">Par scène (s)</label>
              <input
                type="number"
                value={sceneDuration}
                onChange={(e) => setSceneDuration(Number(e.target.value))}
                min={2}
                max={20}
                className="w-full p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F7] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full mt-auto py-3.5 bg-[#1A1A1A] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Écriture en cours...
              </span>
            ) : (
              <>
                <HugeiconsIcon icon={SparklesIcon} size={20} className="text-amber-400" />
                Générer le Storyboard
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
          <HugeiconsIcon icon={Alert02Icon} size={18} />
          {error}
        </div>
      )}

      {/* Results */}
      {storyboard && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700 pb-12">
          
          {/* Characters Section */}
          {storyboard.characters && storyboard.characters.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                <HugeiconsIcon icon={UserCircleIcon} size={24} />
                Personnages (Casting)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {storyboard.characters.map((char, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-[#E5E1DA] shadow-sm flex flex-col gap-3">
                  <div>
                    <h3 className="font-bold text-[#1A1A1A] text-lg">{char.name}</h3>
                    <p className="text-sm text-[#8C8275] mb-2">{char.description}</p>
                    <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-1 block">Bloc Visuel (Fixe)</span>
                      <p className="text-xs text-amber-900 font-mono italic">
                        "{char.visualBlock}"
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-1 bg-[#F5F2EE] p-3 rounded-xl border border-[#E5E1DA]/50 relative group">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A196] mb-1 block">Prompt Test Personnage</span>
                    <p className="text-xs text-[#575047] font-mono leading-relaxed pr-8 line-clamp-3">{char.imagePrompt}</p>
                    
                    <button 
                      onClick={() => handleCopy(char.imagePrompt, `char-${idx}`)}
                      className="absolute top-3 right-3 p-1.5 bg-white border border-[#E5E1DA] rounded-lg text-[#1A1A1A] hover:bg-gray-50 transition-colors shadow-sm"
                      title="Copier le prompt image"
                    >
                      {copiedId === `char-${idx}` ? (
                        <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} className="text-green-600" />
                      ) : (
                        <HugeiconsIcon icon={Copy01Icon} size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          <div className="w-full h-px bg-[#E5E1DA]" />

          {/* Scenes Section */}
          {storyboard.scenes && storyboard.scenes.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                <HugeiconsIcon icon={VideoReplayIcon} size={24} />
                Storyboard & Scènes
              </h2>
              
              <div className="flex flex-col gap-6">
                {storyboard.scenes.map((scene, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-[#E5E1DA] shadow-sm overflow-hidden flex flex-col md:flex-row">
                  
                  {/* Left: Scene header & brief French summary */}
                  <div className="w-full md:w-1/4 bg-[#FAF9F7] p-6 border-b md:border-b-0 md:border-r border-[#E5E1DA] flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <span className="bg-[#1A1A1A] text-white text-xs font-bold px-3 py-1 rounded-full">
                        Scène {scene.sceneNumber}
                      </span>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        {sceneDuration}s
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A196] block mb-1.5">Intention de la scène</span>
                      <p className="text-xs text-[#575047] leading-relaxed">
                        {scene.frenchSummary || "Scène générée"}
                      </p>
                    </div>
                  </div>

                  {/* Right: The 2 unified copy-paste blocks */}
                  <div className="w-full md:w-3/4 p-6 flex flex-col gap-4 justify-center">
                    {/* 1. Prompt Image Midjourney Unified */}
                    <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 relative group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                          🎨 Prompt Image Complet (Midjourney v6/v7)
                        </span>
                        <button 
                          onClick={() => handleCopy(scene.imagePrompt, `img-${idx}`)}
                          className="px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-1.5"
                        >
                          {copiedId === `img-${idx}` ? <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} className="text-green-600" /> : <HugeiconsIcon icon={Copy01Icon} size={14} />}
                          {copiedId === `img-${idx}` ? "Copié !" : "Copier"}
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-blue-950 font-mono leading-relaxed select-all">{scene.imagePrompt}</p>
                    </div>

                    {/* 2. Prompt Video All-in-One Unified */}
                    <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 relative group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                          🎬 Prompt Vidéo Tout-en-Un (Seedance / Kling / Runway)
                        </span>
                        <button 
                          onClick={() => handleCopy(scene.videoPrompt, `vid-${idx}`)}
                          className="px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors shadow-sm flex items-center gap-1.5"
                        >
                          {copiedId === `vid-${idx}` ? <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} className="text-green-600" /> : <HugeiconsIcon icon={Copy01Icon} size={14} />}
                          {copiedId === `vid-${idx}` ? "Copié !" : "Copier"}
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-purple-950 font-mono leading-relaxed select-all">{scene.videoPrompt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

        </div>
      )}

    </div>
  );
}
