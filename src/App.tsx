/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorkflowApp } from './components/WorkflowApp';
import { LandingPage } from './components/LandingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/studio" element={<WorkflowApp />} />
      </Routes>
    </BrowserRouter>
  );
}
