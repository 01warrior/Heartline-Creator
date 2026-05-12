/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorkflowApp } from './components/WorkflowApp';
import { LandingPage } from './components/LandingPage';
import { StudioLayout } from './components/layout/StudioLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Studio Routes with Sidebar */}
        <Route path="/studio" element={<StudioLayout />}>
          <Route index element={<WorkflowApp />} />
          <Route path="videos" element={
            <div className="p-12 h-full overflow-y-auto w-full">
              <h1 className="text-3xl font-sans font-bold text-[#1A1A1A] mb-8">Mes Vidéos</h1>
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-[#E5E1DA] rounded-3xl">
                <p className="text-[#A8A196] font-medium">Bientôt : La liste de vos vidéos exportées apparaîtra ici.</p>
              </div>
            </div>
          } />
          <Route path="assets" element={
            <div className="p-12 h-full overflow-y-auto w-full">
              <h1 className="text-3xl font-sans font-bold text-[#1A1A1A] mb-8">Mes Assets</h1>
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-[#E5E1DA] rounded-3xl">
                <p className="text-[#A8A196] font-medium">Bientôt : Vos musiques et images générées apparaîtront ici.</p>
              </div>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
