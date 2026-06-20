import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { StorageHelper } from './utils/engine';

import PortalPage from './pages/PortalPage';
import Dashboard from './pages/Dashboard';
import CheckInPage from './pages/CheckInPage';
import AnalysisPage from './pages/AnalysisPage';
import ExercisesPage from './pages/ExercisesPage';
import ChatPage from './pages/ChatPage';
import SupportPage from './pages/SupportPage';
import HistoryPage from './pages/HistoryPage';
import AlertsPage from './pages/AlertsPage';

function RequireProfile({ children }) {
  const profile = StorageHelper.getProfile();
  return profile ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Portal: always accessible */}
        <Route path="/" element={<PortalPage />} />

        {/* All app routes share the Layout shell */}
        <Route element={<Layout />}>
          <Route path="/dashboard"
            element={<RequireProfile><Dashboard /></RequireProfile>}
          />
          <Route path="/checkin"
            element={<RequireProfile><CheckInPage /></RequireProfile>}
          />
          <Route path="/analysis"
            element={<RequireProfile><AnalysisPage /></RequireProfile>}
          />
          <Route path="/exercises"
            element={<RequireProfile><ExercisesPage /></RequireProfile>}
          />
          <Route path="/chat"
            element={<RequireProfile><ChatPage /></RequireProfile>}
          />
          <Route path="/support"
            element={<RequireProfile><SupportPage /></RequireProfile>}
          />
          <Route path="/history"
            element={<RequireProfile><HistoryPage /></RequireProfile>}
          />
          <Route path="/alerts"
            element={<RequireProfile><AlertsPage /></RequireProfile>}
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
