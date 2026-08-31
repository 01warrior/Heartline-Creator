/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Search, Filter, Video, FolderOpen, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { StudioCreatePage } from './pages/StudioCreatePage';
import { LandingPage } from './pages/LandingPage';
import { StudioLayout } from './components/layout/StudioLayout';
import { StudioSettingsProvider } from './context/StudioSettingsContext';
import { StudioSettingsPage } from './pages/StudioSettingsPage';

function StudioEmptyState({
  title,
  subtitle,
  type,
  message,
}: {
  title: string;
  subtitle: string;
  type: 'videos' | 'assets';
  message: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 flex flex-col gap-6">
      {/* Header & Controls Toolbar */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E1DA]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-[#1A1A1A]">
            {title}
          </h1>
          <p className="text-sm text-[#8C8275] mt-1 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A196]" />
            <input
              type="text"
              placeholder="Rechercher..."
              disabled
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E1DA] rounded-xl text-sm text-[#1A1A1A] placeholder-[#A8A196] cursor-not-allowed opacity-75"
            />
          </div>
          <button
            disabled
            className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E1DA] rounded-xl text-sm font-medium text-[#70685C] cursor-not-allowed opacity-75"
          >
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
          </button>
          <button
            onClick={() => navigate('/studio')}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white hover:bg-[#333333] transition-colors rounded-xl text-sm font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau projet</span>
          </button>
        </div>
      </div>

      {/* Main Full-Width Card Container */}
      <div className="w-full flex-1 min-h-[450px] bg-white border border-[#E5E1DA] rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute inset-0 bg-radial from-[#F5F2EE] to-transparent opacity-60 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
          {/* Icon Badge */}
          <div className="w-20 h-20 rounded-3xl bg-[#FAF9F7] border border-[#E5E1DA] flex items-center justify-center mb-6 text-[#1A1A1A] shadow-inner">
            {type === 'videos' ? (
              <Video className="w-10 h-10 text-[#1A1A1A]" />
            ) : (
              <FolderOpen className="w-10 h-10 text-[#1A1A1A]" />
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-3">
            Aucun élément pour le moment
          </h2>

          <p className="text-[#70685C] font-medium text-sm sm:text-base leading-relaxed mb-8">
            {message}
          </p>

          <button
            onClick={() => navigate('/studio')}
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#1A1A1A] text-white hover:bg-[#333333] transition-all rounded-2xl font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            <span>Créer du contenu maintenant</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          {/* Highlights */}
          <div className="mt-12 pt-8 border-t border-[#E5E1DA]/60 w-full flex flex-wrap justify-center gap-6 text-xs text-[#A8A196] font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
              Génération automatique
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
              Sauvegarde sécurisée
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
              Exportation HD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Studio Routes with Sidebar */}
        <Route
          path="/studio"
          element={
            <StudioSettingsProvider>
              <StudioLayout />
            </StudioSettingsProvider>
          }
        >
          <Route index element={<StudioCreatePage />} />
          <Route path="settings" element={<StudioSettingsPage />} />
          <Route path="videos" element={
            <StudioEmptyState
              title="Mes Vidéos"
              subtitle="Gérez, prévisualisez et téléchargez toutes vos vidéos générées"
              type="videos"
              message="Bientôt : La liste de vos vidéos exportées apparaîtra ici."
            />
          } />
          <Route path="assets" element={
            <StudioEmptyState
              title="Mes Assets"
              subtitle="Retrouvez vos musiques, images et éléments médias créés pour vos vidéos"
              type="assets"
              message="Bientôt : Vos musiques et images générées apparaîtront ici."
            />
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
