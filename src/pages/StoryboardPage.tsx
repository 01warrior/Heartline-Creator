import React, { useState, useEffect } from 'react';
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
import { History, Trash2, X, ArrowUpRight, Clock, Calendar, BookmarkCheck } from 'lucide-react';

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

interface SavedStoryboard {
  id: string;
  createdAt: number;
  story: string;
  style: string;
  sceneCount: number;
  sceneDuration: number;
  data: StoryboardData;
}

const STORAGE_KEY = 'storyboards_history_v1';

export function StoryboardPage() {
  const { apiKey, scriptModel } = useStudioSettings();
  
  const [story, setStory] = useState('');
  const [style, setStyle] = useState('Cinematic Noir');
  const [sceneCount, setSceneCount] = useState<number>(8);
  const [sceneDuration, setSceneDuration] = useState<number>(5);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [storyboard, setStoryboard] = useState<StoryboardData | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [savedStoryboards, setSavedStoryboards] = useState<SavedStoryboard[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage helper
  const persistStoryboards = (list: SavedStoryboard[]) => {
    setSavedStoryboards(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Erreur lors de la sauvegarde dans le localStorage:", e);
    }
  };

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

    setIsGenerating(true);
    setError('');
    
    try {
      const data = await generateStoryboard(apiKey, scriptModel, story, style, sceneCount, sceneDuration);
      setStoryboard(data);

      // Auto save to history
      const newEntry: SavedStoryboard = {
        id: `sb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
        story: story.trim(),
        style,
        sceneCount,
        sceneDuration,
        data
      };
      const updatedList = [newEntry, ...savedStoryboards.filter(item => item.story !== story.trim())].slice(0, 50);
      persistStoryboards(updatedList);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la génération du storyboard.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadStoryboard = (item: SavedStoryboard) => {
    setStory(item.story);
    setStyle(item.style);
    setSceneCount(item.sceneCount);
    setSceneDuration(item.sceneDuration);
    setStoryboard(item.data);
    setIsHistoryOpen(false);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedStoryboards.filter(item => item.id !== id);
    persistStoryboards(updated);
  };

  const handleClearAllHistory = () => {
    if (window.confirm("Voulez-vous vraiment effacer tout l'historique des storyboards ?")) {
      persistStoryboards([]);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-[#FAF9F7] px-4 sm:px-8 lg:px-12 py-6 sm:py-8 flex flex-col gap-6 font-sans relative">
      
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E1DA]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] flex items-center gap-3">
            <HugeiconsIcon icon={Film02Icon} size={32} className="text-amber-500" />
            Directeur IA & Storyboard
          </h1>
          <p className="text-sm text-[#8C8275] mt-1 font-medium max-w-2xl">
            Générez un storyboard professionnel avec vos prompts Midjourney et Runway/Kling pré-découpés pour vos vidéos externes.
          </p>
        </div>

        {/* History Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-4 py-2.5 bg-white border border-[#E5E1DA] hover:border-amber-400 hover:bg-amber-50/50 text-[#1A1A1A] text-sm font-semibold rounded-2xl flex items-center gap-2.5 transition-all shadow-xs cursor-pointer group"
            title="Ouvrir l'historique des storyboards sauvegardés"
          >
            <History className="w-4 h-4 text-amber-600 group-hover:rotate-[-25deg] transition-transform" />
            <span>Historique</span>
            {savedStoryboards.length > 0 && (
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                {savedStoryboards.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Input Form with unified full-height textarea */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E1DA] shadow-sm flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* Left: Story (Takes full available height) */}
        <div className="flex-1 flex flex-col gap-3 min-h-[280px]">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-[#1A1A1A]">L'histoire (Drames, rebondissements, actions)</label>
            <span className="text-xs text-[#A8A196] font-medium">
              {story.length} caractère{story.length > 1 ? 's' : ''}
            </span>
          </div>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Décrivez votre histoire ici. Ex: Un astronaute se retrouve seul sur Mars, il découvre une ancienne ruine extraterrestre cachée sous les sables..."
            className="w-full flex-1 min-h-[220px] p-4 rounded-xl border border-[#E5E1DA] bg-[#FAF9F7] text-[#1A1A1A] resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow leading-relaxed"
          />
        </div>

        {/* Right: Settings */}
        <div className="w-full lg:w-80 flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-5">
            <CustomSelect
              label="Style Visuel"
              value={style}
              onChange={setStyle}
              options={[
                { value: "Cinematic Noir", label: "Cinematic Noir", description: "Film sombre" },
                { value: "Pixar 3D", label: "Pixar 3D", description: "Animation moderne" },
                { value: "Hyper Realistic", label: "Hyper Réaliste", description: "Photographie" },
                { value: "TikTok Fruit/Veggie", label: "Personnage Fruit/Légume", description: "Trend TikTok, Anthropomorphe" },
                { value: "Anthropomorphic Animal", label: "Animal Anthropomorphe", description: "Animaux humanisés (ex: Zootopie)" },
                { value: "Food Commercial", label: "Food Commercial", description: "Macro, slow-motion, appétissant" },
                { value: "Nature Documentary", label: "Documentaire Nature", description: "Animaux, macro, National Geographic" },
                { value: "Vintage Anime", label: "Vintage Anime", description: "Style 90s" },
                { value: "Cyberpunk", label: "Cyberpunk", description: "Néon, futuriste" }
              ]}
            />

            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-bold text-[#1A1A1A]">Nombre de scènes</label>
                <input
                  type="number"
                  value={sceneCount}
                  onChange={(e) => setSceneCount(Number(e.target.value))}
                  min={8}
                  max={15}
                  className="w-full p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F7] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-bold text-[#1A1A1A]">Durée / scène (s)</label>
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
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full mt-4 py-3.5 bg-[#1A1A1A] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
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
                      className="absolute top-3 right-3 p-1.5 bg-white border border-[#E5E1DA] rounded-lg text-[#1A1A1A] hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
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
                          className="px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
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
                          className="px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
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

      {/* Right Slide-Over History Sidebar */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsHistoryOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#FAF9F7] shadow-2xl border-l border-[#E5E1DA] flex flex-col">
              
              {/* Sidebar Header */}
              <div className="p-6 bg-white border-b border-[#E5E1DA] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-500" />
                    Historique des Storyboards
                  </h3>
                  <p className="text-xs text-[#8C8275] mt-0.5">
                    {savedStoryboards.length} scénario{savedStoryboards.length > 1 ? 's' : ''} enregistré{savedStoryboards.length > 1 ? 's' : ''} localement
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {savedStoryboards.length > 0 && (
                    <button
                      onClick={handleClearAllHistory}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Tout effacer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                    title="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
                {savedStoryboards.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#8C8275]">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4">
                      <BookmarkCheck className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#1A1A1A] text-base mb-1">Aucun storyboard</h4>
                    <p className="text-xs leading-relaxed max-w-xs">
                      Vos storyboards générés seront automatiquement sauvegardés ici. Vous pourrez les recharger à tout moment.
                    </p>
                  </div>
                ) : (
                  savedStoryboards.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLoadStoryboard(item)}
                      className="bg-white p-4 rounded-2xl border border-[#E5E1DA] hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 group relative"
                    >
                      {/* Meta top */}
                      <div className="flex items-center justify-between text-xs text-[#8C8275]">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#A8A196]" />
                          {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        
                        <button
                          onClick={(e) => handleDeleteItem(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Supprimer ce storyboard"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Excerpt */}
                      <p className="text-xs text-[#1A1A1A] font-medium line-clamp-3 leading-relaxed">
                        "{item.story}"
                      </p>

                      {/* Tags & Action */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#F2EFE9]">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-100">
                            {item.style}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                            {item.sceneCount} scènes ({item.sceneDuration}s)
                          </span>
                        </div>

                        <span className="text-xs font-bold text-amber-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Charger
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Sidebar Footer info */}
              {savedStoryboards.length > 0 && (
                <div className="p-4 bg-white border-t border-[#E5E1DA] text-[11px] text-[#A8A196] text-center">
                  Stocké en toute sécurité dans votre navigateur (localStorage).
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
