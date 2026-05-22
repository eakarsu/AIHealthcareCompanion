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
import LabTrendWatch from './pages/LabTrendWatch';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Feedback from './pages/Feedback';
import Contact from './pages/Contact';
import AdminPanel from './pages/AdminPanel';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Onboarding from './pages/Onboarding';
import AdvancedAdvisors from './pages/AdvancedAdvisors';
import Layout from './components/Layout';
import { useState } from 'react';

// === Batch 04 Gaps & Frontend Mounts ===
import CfAgenticHealthAssistantMonitoringTren from './pages/CfAgenticHealthAssistantMonitoringTren';
import CfPersonalizedHealthCoachingGenerating from './pages/CfPersonalizedHealthCoachingGenerating';
import CfMedicationAdherenceAiPredictingMisse from './pages/CfMedicationAdherenceAiPredictingMisse';
import CfSymptomToSpecialistRoutingWithLikel from './pages/CfSymptomToSpecialistRoutingWithLikel';
import CfPreventiveHealthRoadmapByAgeFamily from './pages/CfPreventiveHealthRoadmapByAgeFamily';
import CfMultimodalHealthDashboardFusingWeara from './pages/CfMultimodalHealthDashboardFusingWeara';
import GapNoSymptomAnalyzerEndpoint from './pages/GapNoSymptomAnalyzerEndpoint';
import GapNoMedicationInteractionChecker from './pages/GapNoMedicationInteractionChecker';
import GapNoTherapyProgressAnalyzer from './pages/GapNoTherapyProgressAnalyzer';
import GapNoSkinLesionVisionAi from './pages/GapNoSkinLesionVisionAi';
import GapNoVisionTestInterpreter from './pages/GapNoVisionTestInterpreter';
import GapNoMedicationAdherencePatternModel from './pages/GapNoMedicationAdherencePatternModel';
import GapNoProviderPortalShareDataWith from './pages/GapNoProviderPortalShareDataWith';
import GapNoPrescriptionPharmacyIntegration from './pages/GapNoPrescriptionPharmacyIntegration';
import GapNoAppointmentScheduling from './pages/GapNoAppointmentScheduling';
import GapNoTelemedicine from './pages/GapNoTelemedicine';
import GapNoInsuranceInformationModule from './pages/GapNoInsuranceInformationModule';
import GapNoLabResultImport from './pages/GapNoLabResultImport';
import GapNoWebhookSurface from './pages/GapNoWebhookSurface';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

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
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

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
        <Route path="lab-trend-watch" element={<LabTrendWatch />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="contact" element={<Contact />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-of-service" element={<TermsOfService />} />
        <Route path="advanced-advisors" element={<AdvancedAdvisors />} />
      </Route>
    
          {/* // === Batch 04 Gaps & Frontend Mounts === */}
          <Route path="/cf-agentic-health-assistant-monitoring-tren" element={<CfAgenticHealthAssistantMonitoringTren />} />
          <Route path="/cf-personalized-health-coaching-generating-" element={<CfPersonalizedHealthCoachingGenerating />} />
          <Route path="/cf-medication-adherence-ai-predicting-misse" element={<CfMedicationAdherenceAiPredictingMisse />} />
          <Route path="/cf-symptom-to-specialist-routing-with-likel" element={<CfSymptomToSpecialistRoutingWithLikel />} />
          <Route path="/cf-preventive-health-roadmap-by-age-family" element={<CfPreventiveHealthRoadmapByAgeFamily />} />
          <Route path="/cf-multimodal-health-dashboard-fusing-weara" element={<CfMultimodalHealthDashboardFusingWeara />} />
          <Route path="/gap-no-symptom-analyzer-endpoint" element={<GapNoSymptomAnalyzerEndpoint />} />
          <Route path="/gap-no-medication-interaction-checker" element={<GapNoMedicationInteractionChecker />} />
          <Route path="/gap-no-therapy-progress-analyzer" element={<GapNoTherapyProgressAnalyzer />} />
          <Route path="/gap-no-skin-lesion-vision-ai" element={<GapNoSkinLesionVisionAi />} />
          <Route path="/gap-no-vision-test-interpreter" element={<GapNoVisionTestInterpreter />} />
          <Route path="/gap-no-medication-adherence-pattern-model" element={<GapNoMedicationAdherencePatternModel />} />
          <Route path="/gap-no-provider-portal-share-data-with" element={<GapNoProviderPortalShareDataWith />} />
          <Route path="/gap-no-prescription-pharmacy-integration" element={<GapNoPrescriptionPharmacyIntegration />} />
          <Route path="/gap-no-appointment-scheduling" element={<GapNoAppointmentScheduling />} />
          <Route path="/gap-no-telemedicine" element={<GapNoTelemedicine />} />
          <Route path="/gap-no-insurance-information-module" element={<GapNoInsuranceInformationModule />} />
          <Route path="/gap-no-lab-result-import" element={<GapNoLabResultImport />} />
          <Route path="/gap-no-webhook-surface" element={<GapNoWebhookSurface />} />
</Routes>
  );
}

export default App;
