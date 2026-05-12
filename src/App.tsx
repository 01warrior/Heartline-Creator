/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorkflowApp } from './components/WorkflowApp';
import { LandingPage } from './components/LandingPage';
import { StudioLayout } from './components/layout/StudioLayout';
import { StudioSettingsProvider } from './components/StudioSettingsContext';
import { StudioSettingsPage } from './components/StudioSettingsPage';

function StudioEmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="w-full h-full overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 lg:py-12">
      <div className="max-w-3xl mx-auto flex min-h-[calc(100vh-9rem)] md:min-h-0 flex-col">
        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-[#1A1A1A] text-center md:text-left mb-6 sm:mb-8">
          {title}
        </h1>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl min-h-[42vh] sm:min-h-64 flex items-center justify-center border-2 border-dashed border-[#E5E1DA] rounded-3xl bg-white/60 px-6 sm:px-10 py-10 text-center shadow-sm">
            <p className="text-[#A8A196] font-medium text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              {message}
            </p>
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
          <Route index element={<WorkflowApp />} />
          <Route path="settings" element={<StudioSettingsPage />} />
          <Route path="videos" element={
            <StudioEmptyState
              title="Mes Vidéos"
              message="Bientôt : La liste de vos vidéos exportées apparaîtra ici."
            />
          } />
          <Route path="assets" element={
            <StudioEmptyState
              title="Mes Assets"
              message="Bientôt : Vos musiques et images générées apparaîtront ici."
            />
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
