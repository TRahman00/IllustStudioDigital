import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DigitalImagePlatform from './pages/DigitalImagePlatform.jsx';
import Pricing from './pages/Pricing.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AuthPage from './pages/AuthPage.jsx'; // <--- Import the new page

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      {/* Unified Auth Page */}
      <Route path="/login" element={<AuthPage initialMode="login" />} />
      <Route path="/register" element={<AuthPage initialMode="signup" />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/studio/:projectId?" element={<ProtectedRoute><DigitalImagePlatform /></ProtectedRoute>} />
      <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
    </Routes>
  );
}