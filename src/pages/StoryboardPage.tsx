import React, { useState, useEffect } from 'react';
import { useStudioSettings } from '../context/StudioSettingsContext';
import { generateStoryboard, StoryboardContinuationContext } from '../services/gemini';
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
import { History, Trash2, X, ArrowUpRight, Clock, Calendar, BookmarkCheck, Clapperboard, Layers, PlusCircle, ArrowRight } from 'lucide-react';

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
  dialogueLanguage?: 'fr' | 'en';
  sceneCount: number;
  sceneDuration: number;
  data: StoryboardData;
  episodeNumber?: number;
  seriesTitle?: string;
  parentStoryboardId?: string;
}

interface ContinuationState {
  active: boolean;
  parentItem: SavedStoryboard;
  episodeNumber: number;
}

const STORAGE_KEY = 'storyboards_history_v1';

export function StoryboardPage() {
  const { apiKey, scriptModel } = useStudioSettings();
  
  const [story, setStory] = useState('');
  const [style, setStyle] = useState('Cinematic Noir');
  const [dialogueLanguage, setDialogueLanguage] = useState<'fr' | 'en'>('fr');
  const [sceneCount, setSceneCount] = useState<number>(8);
  const [sceneDuration, setSceneDuration] = useState<number>(5);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [storyboard, setStoryboard] = useState<StoryboardData | null>(null);
  const [currentSavedItem, setCurrentSavedItem] = useState<SavedStoryboard | null>(null);
  const [continuation, setContinuation] = useState<ContinuationState | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [savedStoryboards, setSavedStoryboards] = useState<SavedStoryboard[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item: any) => ({
        ...item,
        data: {
          characters: Array.isArray(item?.data?.characters) ? item.data.characters : [],
          scenes: Array.isArray(item?.data?.scenes) ? item.data.scenes : []
        }
      }));
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

  const handleStartContinuation = (parentItem: SavedStoryboard) => {
    if (!parentItem) return;
    const nextEp = (parentItem.episodeNumber || 1) + 1;
    const safeParent: SavedStoryboard = {
      ...parentItem,
      data: {
        characters: Array.isArray(parentItem?.data?.characters) ? parentItem.data.characters : [],
        scenes: Array.isArray(parentItem?.data?.scenes) ? parentItem.data.scenes : []
      }
    };
    setContinuation({
      active: true,
      parentItem: safeParent,
      episodeNumber: nextEp
    });
    if (parentItem.style) setStyle(parentItem.style);
    if (parentItem.dialogueLanguage) setDialogueLanguage(parentItem.dialogueLanguage);
    setStory('');
    setIsHistoryOpen(false);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelContinuation = () => {
    setContinuation(null);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Veuillez configurer votre clé API Gemini dans les paramètres.");
      return;
    }
    if (!story.trim()) {
      setError("Veuillez entrer une histoire ou la description du nouvel épisode.");
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      let continuationContext: StoryboardContinuationContext | undefined;

      if (continuation && continuation.active && continuation.parentItem) {
        continuationContext = {
          episodeNumber: continuation.episodeNumber,
          seriesTitle: continuation.parentItem.seriesTitle || continuation.parentItem.story?.slice(0, 30) || 'Série',
          previousStory: continuation.parentItem.story || '',
          previousCharacters: Array.isArray(continuation.parentItem.data?.characters) ? continuation.parentItem.data.characters : [],
          previousScenes: Array.isArray(continuation.parentItem.data?.scenes) ? continuation.parentItem.data.scenes : []
        };
      }

      const rawData = await generateStoryboard(
        apiKey,
        scriptModel,
        story,
        style,
        sceneCount,
        sceneDuration,
        continuationContext,
        dialogueLanguage
      );
      
      const safeData: StoryboardData = {
        characters: Array.isArray(rawData?.characters) ? rawData.characters : [],
        scenes: Array.isArray(rawData?.scenes) ? rawData.scenes : []
      };
      setStoryboard(safeData);

      const nextEpNumber = continuation && continuation.active ? continuation.episodeNumber : 1;
      const seriesTitle = continuation && continuation.active
        ? (continuation.parentItem.seriesTitle || (continuation.parentItem.story ? continuation.parentItem.story.slice(0, 35) + '...' : 'Série'))
        : (story ? story.slice(0, 35) + '...' : 'Storyboard');

      // Auto save to history
      const newEntry: SavedStoryboard = {
        id: `sb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
        story: story.trim(),
        style,
        dialogueLanguage,
        sceneCount,
        sceneDuration,
        data: safeData,
        episodeNumber: nextEpNumber,
        seriesTitle,
        parentStoryboardId: continuation && continuation.active ? continuation.parentItem.id : undefined
      };

      setCurrentSavedItem(newEntry);
      setContinuation(null);

      const updatedList = [newEntry, ...savedStoryboards.filter(item => item.id !== newEntry.id)].slice(0, 50);
      persistStoryboards(updatedList);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la génération du storyboard.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadStoryboard = (item: SavedStoryboard) => {
    if (!item) return;
    setStory(item.story || '');
    setStyle(item.style || 'Cinematic Noir');
    if (item.dialogueLanguage) setDialogueLanguage(item.dialogueLanguage);
    setSceneCount(item.sceneCount || 8);
    setSceneDuration(item.sceneDuration || 5);
    const safeData: StoryboardData = {
      characters: Array.isArray(item?.data?.characters) ? item.data.characters : [],
      scenes: Array.isArray(item?.data?.scenes) ? item.data.scenes : []
    };
    setStoryboard(safeData);
    setCurrentSavedItem(item);
    setContinuation(null);
    setIsHistoryOpen(false);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedStoryboards.filter(item => item.id !== id);
    persistStoryboards(updated);
    if (currentSavedItem?.id === id) {
      setCurrentSavedItem(null);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm("Voulez-vous vraiment effacer tout l'historique des storyboards ?")) {
      persistStoryboards([]);
      setCurrentSavedItem(null);
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
            Générez un storyboard professionnel avec casting, raccord de scènes et création d'épisodes en série (Partie 1, 2, 3).
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

      {/* Input Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E1DA] shadow-sm flex flex-col gap-6">
        
        {/* Continuation Banner */}
        {continuation && continuation.active && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50/60 border border-amber-200 animate-in fade-in slide-in-from-top-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-xs flex items-center gap-1.5">
                  <Clapperboard className="w-3.5 h-3.5" />
                  Suite Narrative — Épisode {continuation.episodeNumber}
                </span>
                <span className="text-xs text-amber-900 font-bold">
                  Raccord direct avec la fin de l'Épisode {continuation.episodeNumber - 1}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCancelContinuation}
                className="text-xs font-semibold text-gray-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
              >
                <X className="w-4 h-4" />
                <span>Quitter le mode suite</span>
              </button>
            </div>

            {/* Cliffhanger reminder card */}
            <div className="bg-white/90 p-3.5 rounded-xl border border-amber-200/70 text-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
                <span>Point d'accroche (Fin de l'Épisode {continuation.episodeNumber - 1}) :</span>
                <span className="font-mono text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  {continuation.parentItem?.data?.scenes && continuation.parentItem.data.scenes.length > 0
                    ? `Scène ${continuation.parentItem.data.scenes.length}`
                    : 'Scène finale'}
                </span>
              </div>
              <p className="text-xs text-[#575047] italic leading-relaxed">
                "{continuation.parentItem?.data?.scenes && continuation.parentItem.data.scenes.length > 0
                  ? (continuation.parentItem.data.scenes[continuation.parentItem.data.scenes.length - 1]?.frenchSummary || continuation.parentItem.story)
                  : (continuation.parentItem?.story || '')}"
              </p>
            </div>

            {/* Preserved Characters Badges */}
            {continuation.parentItem?.data?.characters && continuation.parentItem.data.characters.length > 0 && (
              <div className="flex items-center gap-2 text-[11px] text-[#7A7570] flex-wrap">
                <span className="font-bold text-amber-950">Personnages conservés (continuité visuelle) :</span>
                <div className="flex flex-wrap gap-1.5">
                  {continuation.parentItem.data.characters.map((char, i) => (
                    <span key={i} className="bg-white px-2.5 py-0.5 rounded-md border border-[#E5E1DA] font-semibold text-[#1A1A1A] text-[11px]">
                      {char.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Left: Story Input */}
          <div className="flex-1 flex flex-col gap-3 min-h-[260px]">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[#1A1A1A]">
                {continuation && continuation.active
                  ? `Que se passe-t-il dans l'Épisode ${continuation.episodeNumber} ?`
                  : "L'histoire (Drames, rebondissements, actions)"}
              </label>
              <span className="text-xs text-[#A8A196] font-medium">
                {story.length} caractère{story.length > 1 ? 's' : ''}
              </span>
            </div>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder={
                continuation && continuation.active
                  ? `Décrivez les événements de l'Épisode ${continuation.episodeNumber}... La scène 1 s'enchaînera immédiatement avec la fin de l'épisode précédent. Ex: Le protagoniste franchit la porte, découvre la salle secrète et trouve un coffre sous le plancher...`
                  : "Décrivez votre histoire ici. Ex: Un astronaute se retrouve seul sur Mars, il découvre une ancienne ruine extraterrestre cachée sous les sables..."
              }
              className="w-full flex-1 min-h-[200px] p-4 rounded-xl border border-[#E5E1DA] bg-[#FAF9F7] text-[#1A1A1A] resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow leading-relaxed"
            />
          </div>

          {/* Right: Settings */}
          <div className="w-full lg:w-80 flex flex-col justify-between gap-5">
            <div className="flex flex-col gap-4">
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

              <CustomSelect
                label="Langue des dialogues"
                value={dialogueLanguage}
                onChange={(val) => setDialogueLanguage(val as 'fr' | 'en')}
                options={[
                  { value: "fr", label: "Français", description: "Dialogues & résumés en français" },
                  { value: "en", label: "Anglais", description: "Dialogues & summaries in English" }
                ]}
              />

              <div className="flex gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-sm font-bold text-[#1A1A1A]">Nombre de scènes</label>
                  <input
                    type="number"
                    value={sceneCount}
                    onChange={(e) => setSceneCount(Number(e.target.value))}
                    min={4}
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
              className="w-full mt-2 py-3.5 bg-[#1A1A1A] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Écriture de l'épisode en cours...
                </span>
              ) : (
                <>
                  <HugeiconsIcon icon={SparklesIcon} size={20} className="text-amber-400" />
                  {continuation && continuation.active
                    ? `Générer l'Épisode ${continuation.episodeNumber}`
                    : "Générer le Storyboard"}
                </>
              )}
            </button>
          </div>
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
          
          {/* Episode Banner + Continuation Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 rounded-3xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                {currentSavedItem?.episodeNumber ? `E${currentSavedItem.episodeNumber}` : 'E1'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold uppercase tracking-wider text-amber-950">
                    {currentSavedItem?.episodeNumber && currentSavedItem.episodeNumber > 1 
                      ? `Épisode ${currentSavedItem.episodeNumber}` 
                      : 'Épisode 1 (Pilote)'}
                  </span>
                  {currentSavedItem?.seriesTitle && (
                    <span className="text-[11px] bg-white border border-amber-200 text-amber-800 px-2.5 py-0.5 rounded-full font-semibold">
                      Série : {currentSavedItem.seriesTitle}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#7A7570] mt-0.5">
                  Storyboard complet prêt pour la production Midjourney et Seedance/Kling.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStartContinuation(currentSavedItem || {
                id: `temp_${Date.now()}`,
                createdAt: Date.now(),
                story,
                style,
                dialogueLanguage,
                sceneCount,
                sceneDuration,
                data: storyboard,
                episodeNumber: 1
              })}
              className="px-5 py-3 bg-[#1A1A1A] hover:bg-amber-600 text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
            >
              <Clapperboard className="w-4 h-4 text-amber-400" />
              <span>Créer la suite (Épisode {(currentSavedItem?.episodeNumber || 1) + 1})</span>
            </button>
          </div>

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
                          Prompt Image Complet (Midjourney v6/v7)
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
                          Prompt Vidéo Tout-en-Un (Seedance / Kling / Runway)
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

          {/* Bottom Call-To-Action for next episode */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white border border-[#E5E1DA] rounded-3xl shadow-sm gap-4">
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Envie de poursuivre cette saga ?</h3>
              <p className="text-xs text-[#7A7570] mt-0.5">
                Créez l'Épisode {(currentSavedItem?.episodeNumber || 1) + 1} avec raccord direct sur la Scène {storyboard.scenes?.length || 1}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleStartContinuation(currentSavedItem || {
                id: `temp_${Date.now()}`,
                createdAt: Date.now(),
                story: story || '',
                style: style || 'Cinematic Noir',
                dialogueLanguage,
                sceneCount: sceneCount || 8,
                sceneDuration: sceneDuration || 5,
                data: storyboard,
                episodeNumber: 1
              })}
              className="px-6 py-3 bg-[#1A1A1A] hover:bg-amber-600 text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Clapperboard className="w-4 h-4 text-amber-400" />
              <span>Créer l'Épisode {(currentSavedItem?.episodeNumber || 1) + 1}</span>
            </button>
          </div>

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
                      Vos storyboards générés seront automatiquement sauvegardés ici. Vous pourrez les recharger ou en créer les suites à tout moment.
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
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-[#A8A196]" />
                            {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {item.episodeNumber && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              Épisode {item.episodeNumber}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartContinuation(item);
                            }}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors text-[11px] font-bold flex items-center gap-1"
                            title="Créer la suite de cet épisode"
                          >
                            <Clapperboard className="w-3.5 h-3.5" />
                            <span>+ Suite</span>
                          </button>
                          <button
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer ce storyboard"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
