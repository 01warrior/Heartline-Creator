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
    <div className="p-6 sm:p-10 lg:p-12 h-full overflow-y-auto w-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-10">
          <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A8A196]">Studio</p>
              <h1 className="text-3xl sm:text-4xl font-sans font-bold text-[#1A1A1A] mt-2">{t('studio.settingsTitle')}</h1>
              <p className="text-sm text-[#7A7570] mt-3 max-w-2xl">
                Configurez les modeles, la voix et les preferences cle pour un studio toujours pret a produire.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6">
            <section className="bg-white border border-[#E5E1DA] rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A8A196]">Modeles</p>
                  <h2 className="text-2xl font-sans font-bold text-[#1A1A1A] mt-2">Configuration des modeles</h2>
                  <p className="text-sm text-[#7A7570] mt-2 max-w-xl">
                    Ajustez le modele de script et le moteur d'image pour chaque narration.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <StudioSettingsPanel visibleSections={['models']} showSectionHeaders={false} />
              </div>
            </section>

            <section className="bg-white border border-[#E5E1DA] rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A8A196]">Style visuel</p>
                  <h2 className="text-2xl font-sans font-bold text-[#1A1A1A] mt-2">Direction artistique</h2>
                  <p className="text-sm text-[#7A7570] mt-2 max-w-xl">
                    Definissez la signature visuelle appliquee a toutes les images.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <StudioSettingsPanel visibleSections={['style']} showSectionHeaders={false} />
              </div>
            </section>

            <section className="bg-white border border-[#E5E1DA] rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A8A196]">Voix</p>
                  <h2 className="text-2xl font-sans font-bold text-[#1A1A1A] mt-2">Voix et narration</h2>
                  <p className="text-sm text-[#7A7570] mt-2 max-w-xl">
                    Selectionnez la synthese vocale et la tonalite ideale pour vos scenes.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <StudioSettingsPanel visibleSections={['voice']} showSectionHeaders={false} />
              </div>
            </section>

            <section className="bg-white border border-[#E5E1DA] rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A8A196]">Securite</p>
                  <h2 className="text-2xl font-sans font-bold text-[#1A1A1A] mt-2">Cle API</h2>
                  <p className="text-sm text-[#7A7570] mt-2 max-w-xl">
                    Gardez votre cle a jour pour maintenir l'acces aux services IA.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <StudioSettingsPanel showApiKeyActions visibleSections={['security']} showSectionHeaders={false} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
