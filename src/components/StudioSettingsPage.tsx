import React from 'react';
import { useTranslation } from 'react-i18next';
import { ApiKeyInput } from './ApiKeyInput';
import { StudioSettingsPanel } from './StudioSettingsPanel';
import { useStudioSettings } from './StudioSettingsContext';

export function StudioSettingsPage() {
  const { t } = useTranslation();
  const { apiKey, setApiKey } = useStudioSettings();

  if (!apiKey) {
    return <ApiKeyInput onKeySubmit={setApiKey} />;
  }

  return (
    <div className="p-12 h-full overflow-y-auto w-full">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-sans font-bold text-[#1A1A1A] mb-8">{t('studio.settingsTitle')}</h1>
        <StudioSettingsPanel showApiKeyActions />
      </div>
    </div>
  );
}
