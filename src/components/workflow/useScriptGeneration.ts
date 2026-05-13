import { useState } from 'react';
import { generatePoem, generateTopicSuggestions } from '../../services/gemini';
import type { Scene } from './workflowConfig';

type ErrorState = { title: string; message: string } | null;

type UseScriptGenerationParams = {
  apiKey: string;
  scriptModel: string;
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  setError: React.Dispatch<React.SetStateAction<ErrorState>>;
  setFullAudio: React.Dispatch<React.SetStateAction<{ data: string; mimeType: string } | null>>;
  setRightPanelState: React.Dispatch<React.SetStateAction<'IDLE' | 'GENERATING' | 'PLAYER'>>;
  parseGeminiError: (err: any) => { title: string; message: string };
  sceneCountMin: number;
  sceneCountMax: number;
};

export function useScriptGeneration({
  apiKey,
  scriptModel,
  setScenes,
  setError,
  setFullAudio,
  setRightPanelState,
  parseGeminiError,
  sceneCountMin,
  sceneCountMax
}: UseScriptGenerationParams) {
  const [topic, setTopic] = useState('');
  const [isGeneratingPoem, setIsGeneratingPoem] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleGeneratePoem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    try {
      setIsGeneratingPoem(true);
      const phrases = await generatePoem(apiKey, topic, scriptModel, sceneCountMin, sceneCountMax);
      setScenes(phrases.map((phrase) => ({ phrase })));
      setFullAudio(null);
      setRightPanelState('IDLE');
    } catch (err) {
      setError(parseGeminiError(err));
      setRightPanelState('IDLE');
    } finally {
      setIsGeneratingPoem(false);
    }
  };

  const handleOpenSuggestions = async () => {
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
  };

  const handleRefreshSuggestions = async () => {
    setIsSuggesting(true);
    try {
      const suggestionsList = await generateTopicSuggestions(apiKey, scriptModel);
      setSuggestions(suggestionsList);
    } catch (e) {
      setError(parseGeminiError(e));
    } finally {
      setIsSuggesting(false);
    }
  };

  return {
    handleGeneratePoem,
    handleOpenSuggestions,
    handleRefreshSuggestions,
    isGeneratingPoem,
    isSuggesting,
    isSuggestionsModalOpen,
    setIsSuggestionsModalOpen,
    setTopic,
    setSuggestions,
    suggestions,
    topic
  };
}
