import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Medications from './pages/Medications';
import PhysicalTherapy from './pages/PhysicalTherapy';
import SkinScans from './pages/SkinScans';
import VisionTests from './pages/VisionTests';
import MedicalHistory from './pages/MedicalHistory';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Feedback from './pages/Feedback';
import Contact from './pages/Contact';
import AdminPanel from './pages/AdminPanel';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Onboarding from './pages/Onboarding';
import Layout from './components/Layout';
import { useState } from 'react';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function OnboardingWrapper({ children }) {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(!user?.onboardingDone);

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <OnboardingWrapper>
              <Layout />
            </OnboardingWrapper>
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="medications" element={<Medications />} />
        <Route path="physical-therapy" element={<PhysicalTherapy />} />
        <Route path="skin-scans" element={<SkinScans />} />
        <Route path="vision-tests" element={<VisionTests />} />
        <Route path="medical-history" element={<MedicalHistory />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="contact" element={<Contact />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-of-service" element={<TermsOfService />} />
      </Route>
    </Routes>
  );
}

export default App;
