import { useEffect, useState } from 'react';
import { audioDataToBlob, generateFullPoemAudio, generateImageForPhrase, generateVideoForScene, playPcmAudio } from '../../services/gemini';
import type { Scene } from './workflowConfig';

type RightPanelState = 'IDLE' | 'GENERATING' | 'PLAYER';

type ErrorState = { title: string; message: string } | null;

type UseMediaGenerationParams = {
  apiKey: string;
  scenes: Scene[];
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  imageStyle: string;
  imageModel: string;
  ttsModel: string;
  selectedVoice: string;
  animateVideo: boolean;
  videoModel: string;
  parseGeminiError: (err: any) => { title: string; message: string };
  setError: React.Dispatch<React.SetStateAction<ErrorState>>;
};

export function useMediaGeneration({
  apiKey,
  scenes,
  setScenes,
  imageStyle,
  imageModel,
  ttsModel,
  selectedVoice,
  animateVideo,
  videoModel,
  parseGeminiError,
  setError
}: UseMediaGenerationParams) {
  const [fullAudio, setFullAudio] = useState<{ data: string; mimeType: string } | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [rightPanelState, setRightPanelState] = useState<RightPanelState>('IDLE');
  const [wavUrl, setWavUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [videoStatus, setVideoStatus] = useState<string>('');

  useEffect(() => {
    if (fullAudio) {
      try {
        const url = URL.createObjectURL(audioDataToBlob(fullAudio.data, fullAudio.mimeType));
        setWavUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Failed to convert audio to Blob', e);
      }
    } else {
      setWavUrl(null);
    }
  }, [fullAudio]);

  const handleGenerateMedia = async () => {
    setRightPanelState('GENERATING');
    setGenerationProgress(0);
    setVideoStatus('');

    let completedCount = 0;
    // Total tasks: images + (optional videos) + 1 audio
    const videoTasks = animateVideo ? scenes.length : 0;
    const totalTasks = scenes.length + videoTasks + 1;

    try {
      let currentScenes = [...scenes];

      // ── Phase 1: Generate Images ──────────────────────────────────
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
          if (errorInfo.title === 'Quota Exceeded') {
            setError(errorInfo);
            return;
          }
          console.error(`Error scene ${i}:`, e);
          completedCount++;
          setGenerationProgress((completedCount / totalTasks) * 100);
        }
      }

      // ── Phase 2: Animate Images to Video (if enabled) ─────────────
      if (animateVideo) {
        for (let i = 0; i < currentScenes.length; i++) {
          // Skip if no image or already has video
          if (!currentScenes[i].image || currentScenes[i].video) {
            completedCount++;
            setGenerationProgress((completedCount / totalTasks) * 100);
            continue;
          }

          try {
            setVideoStatus(`Animation scène ${i + 1}/${currentScenes.length}...`);
            
            const videoDataUrl = await generateVideoForScene(
              apiKey,
              currentScenes[i].image!,
              currentScenes[i].phrase,
              videoModel,
              (status) => setVideoStatus(`Scène ${i + 1}: ${status}`)
            );

            const newScenes = [...currentScenes];
            newScenes[i] = { ...newScenes[i], video: videoDataUrl };
            currentScenes = newScenes;
            setScenes(newScenes);
            completedCount++;
            setGenerationProgress((completedCount / totalTasks) * 100);
          } catch (e: any) {
            const errorInfo = parseGeminiError(e);
            console.error(`Error animating scene ${i}:`, e);
            // Don't block the rest — continue without video for this scene
            if (errorInfo.title === 'Quota Exceeded') {
              setError(errorInfo);
              // Still continue to audio generation
              break;
            }
            completedCount++;
            setGenerationProgress((completedCount / totalTasks) * 100);
          }
        }
        setVideoStatus('');
      }

      // ── Phase 3: Generate Audio TTS ───────────────────────────────
      if (!fullAudio) {
        try {
          const fullText = currentScenes.map((scene) => scene.phrase).join('. ');
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

  const playSequence = async () => {
    if (isPlaying || !fullAudio) return;
    setIsPlaying(true);
    setCurrentSceneIndex(0);

    try {
      await playPcmAudio(fullAudio.data, (percent) => {
        const sceneIndex = Math.min(
          Math.floor((percent / 100) * scenes.length),
          scenes.length - 1
        );
        setCurrentSceneIndex(sceneIndex);
      });
    } catch (e) {
      console.error('Playback error', e);
    } finally {
      setIsPlaying(false);
    }
  };

  return {
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
  };
}
