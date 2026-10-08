import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Jobs } from "./pages/Jobs";
import { Resume } from "./pages/Resume";
import { JdMatcher } from "./pages/JdMatcher";
import { CoverLetters } from "./pages/CoverLetters";
import { Applications } from "./pages/Applications";
import { AiAgents } from "./pages/AiAgents";
import { Analytics } from "./pages/Analytics";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { ProfileProvider } from "./context/ProfileContext";

function AppRoutes() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <Routes location={backgroundLocation || location}>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="resume" element={<Resume />} />
        <Route path="matcher" element={<JdMatcher />} />
        <Route path="cover-letters" element={<CoverLetters />} />
        <Route path="applications" element={<Applications />} />
        <Route path="agents" element={<AiAgents />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <AppRoutes />
      </ProfileProvider>
    </BrowserRouter>
  );
}
