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
};

const SETTINGS_STORAGE_KEYS = {
  scriptModel: 'STUDIO_SCRIPT_MODEL',
  imageModel: 'STUDIO_IMAGE_MODEL',
  ttsModel: 'STUDIO_TTS_MODEL',
  selectedVoice: 'STUDIO_SELECTED_VOICE',
  imageStyle: 'STUDIO_IMAGE_STYLE'
};

const DEFAULT_SETTINGS = {
  scriptModel: 'gemini-3-flash-preview',
  imageModel: 'gemini-2.5-flash-image',
  ttsModel: 'gemini-3.1-flash-tts-preview',
  selectedVoice: 'Kore',
  imageStyle: 'cinematic soft noir, 35mm film grain, melancholic warm lighting, ultra-detailed textures, ethereal atmosphere'
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
      setImageStyle
    }),
    [apiKey, scriptModel, imageModel, ttsModel, selectedVoice, imageStyle]
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
