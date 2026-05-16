import React, { createContext, useContext, useMemo, useState } from 'react';

type StudioSettingsContextValue = {
  apiKey: string;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  scriptModel: string;
  setScriptModel: (value: string) => void;
  imageModel: string;
  setImageModel: (value: string) => void;
  ttsModel: string;
  setTtsModel: (value: string) => void;
  selectedVoice: string;
  setSelectedVoice: (value: string) => void;
  imageStyle: string;
  setImageStyle: (value: string) => void;
  sceneCountMin: number;
  setSceneCountMin: (value: number) => void;
  sceneCountMax: number;
  setSceneCountMax: (value: number) => void;
  animateVideo: boolean;
  setAnimateVideo: (value: boolean) => void;
  videoModel: string;
  setVideoModel: (value: string) => void;
  videoQuality: string;
  setVideoQuality: (value: string) => void;
};

const SETTINGS_STORAGE_KEYS = {
  scriptModel: 'STUDIO_SCRIPT_MODEL',
  imageModel: 'STUDIO_IMAGE_MODEL',
  ttsModel: 'STUDIO_TTS_MODEL',
  selectedVoice: 'STUDIO_SELECTED_VOICE',
  imageStyle: 'STUDIO_IMAGE_STYLE',
  sceneCountMin: 'STUDIO_SCENE_COUNT_MIN',
  sceneCountMax: 'STUDIO_SCENE_COUNT_MAX',
  animateVideo: 'STUDIO_ANIMATE_VIDEO',
  videoModel: 'STUDIO_VIDEO_MODEL',
  videoQuality: 'STUDIO_VIDEO_QUALITY'
};

const DEFAULT_SETTINGS = {
  scriptModel: 'gemini-3-flash-preview',
  imageModel: 'gemini-2.5-flash-image',
  ttsModel: 'gemini-3.1-flash-tts-preview',
  selectedVoice: 'Kore',
  imageStyle: 'cinematic soft noir, 35mm film grain, melancholic warm lighting, ultra-detailed textures, ethereal atmosphere',
  sceneCountMin: 6,
  sceneCountMax: 8,
  animateVideo: false,
  videoModel: 'veo-3.1-generate-preview',
  videoQuality: '1080p'
};

const StudioSettingsContext = createContext<StudioSettingsContextValue | null>(null);

export function StudioSettingsProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem('GEMINI_API_KEY') || '');
  const [scriptModel, setScriptModelState] = useState(
    () => localStorage.getItem(SETTINGS_STORAGE_KEYS.scriptModel) || DEFAULT_SETTINGS.scriptModel
  );
  const [imageModel, setImageModelState] = useState(
    () => localStorage.getItem(SETTINGS_STORAGE_KEYS.imageModel) || DEFAULT_SETTINGS.imageModel
  );
  const [ttsModel, setTtsModelState] = useState(
    () => localStorage.getItem(SETTINGS_STORAGE_KEYS.ttsModel) || DEFAULT_SETTINGS.ttsModel
  );
  const [selectedVoice, setSelectedVoiceState] = useState(
    () => localStorage.getItem(SETTINGS_STORAGE_KEYS.selectedVoice) || DEFAULT_SETTINGS.selectedVoice
  );
  const [imageStyle, setImageStyleState] = useState(
    () => localStorage.getItem(SETTINGS_STORAGE_KEYS.imageStyle) || DEFAULT_SETTINGS.imageStyle
  );
  const [sceneCountMin, setSceneCountMinState] = useState(
    () => parseInt(localStorage.getItem(SETTINGS_STORAGE_KEYS.sceneCountMin) || String(DEFAULT_SETTINGS.sceneCountMin), 10)
  );
  const [sceneCountMax, setSceneCountMaxState] = useState(
    () => parseInt(localStorage.getItem(SETTINGS_STORAGE_KEYS.sceneCountMax) || String(DEFAULT_SETTINGS.sceneCountMax), 10)
  );
  const [animateVideo, setAnimateVideoState] = useState(
    () => localStorage.getItem(SETTINGS_STORAGE_KEYS.animateVideo) === 'true'
  );
  const [videoModel, setVideoModelState] = useState(
    () => localStorage.getItem(SETTINGS_STORAGE_KEYS.videoModel) || DEFAULT_SETTINGS.videoModel
  );
  const [videoQuality, setVideoQualityState] = useState(
    () => localStorage.getItem(SETTINGS_STORAGE_KEYS.videoQuality) || DEFAULT_SETTINGS.videoQuality
  );

  const setApiKey = (key: string) => {
    localStorage.setItem('GEMINI_API_KEY', key);
    setApiKeyState(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setApiKeyState('');
  };

  const setScriptModel = (value: string) => {
    localStorage.setItem(SETTINGS_STORAGE_KEYS.scriptModel, value);
    setScriptModelState(value);
  };

  const setImageModel = (value: string) => {
    localStorage.setItem(SETTINGS_STORAGE_KEYS.imageModel, value);
    setImageModelState(value);
  };

  const setTtsModel = (value: string) => {
    localStorage.setItem(SETTINGS_STORAGE_KEYS.ttsModel, value);
    setTtsModelState(value);
  };

  const setSelectedVoice = (value: string) => {
    localStorage.setItem(SETTINGS_STORAGE_KEYS.selectedVoice, value);
    setSelectedVoiceState(value);
  };

  const setImageStyle = (value: string) => {
    localStorage.setItem(SETTINGS_STORAGE_KEYS.imageStyle, value);
    setImageStyleState(value);
  };

  const setSceneCountMin = (value: number) => {
    localStorage.setItem(SETTINGS_STORAGE_KEYS.sceneCountMin, String(value));
    setSceneCountMinState(value);
  };

  const setSceneCountMax = (value: number) => {
    localStorage.setItem(SETTINGS_STORAGE_KEYS.sceneCountMax, String(value));
    setSceneCountMaxState(value);
  };

  const setAnimateVideo = (value: boolean) => {
    localStorage.setItem(SETTINGS_STORAGE_KEYS.animateVideo, String(value));
    setAnimateVideoState(value);
  };

  const setVideoModel = (value: string) => {
    localStorage.setItem(SETTINGS_STORAGE_KEYS.videoModel, value);
    setVideoModelState(value);
  };

  const setVideoQuality = (value: string) => {
    localStorage.setItem(SETTINGS_STORAGE_KEYS.videoQuality, value);
    setVideoQualityState(value);
  };

  const value = useMemo(
    () => ({
      apiKey,
      setApiKey,
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
    }),
    [apiKey, scriptModel, imageModel, ttsModel, selectedVoice, imageStyle, sceneCountMin, sceneCountMax, animateVideo, videoModel, videoQuality]
  );

  return <StudioSettingsContext.Provider value={value}>{children}</StudioSettingsContext.Provider>;
}

export function useStudioSettings() {
  const context = useContext(StudioSettingsContext);
  if (!context) {
    throw new Error('useStudioSettings must be used within StudioSettingsProvider');
  }
  return context;
}
