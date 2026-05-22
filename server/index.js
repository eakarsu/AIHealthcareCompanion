
// === Batch 04 Gaps & Frontend Mounts === (disabled: CommonJS routes incompatible with ESM)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import medicationRoutes from './routes/medications.js';
import physicalTherapyRoutes from './routes/physicalTherapy.js';
import skinScanRoutes from './routes/skinScans.js';
import visionTestRoutes from './routes/visionTests.js';
import medicalHistoryRoutes from './routes/medicalHistory.js';
import uploadRoutes from './routes/upload.js';
import searchRoutes from './routes/search.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import feedbackRoutes from './routes/feedback.js';
import contactRoutes from './routes/contact.js';
import exportRoutes from './routes/export.js';
import gdprRoutes from './routes/gdpr.js';
import settingsRoutes from './routes/settings.js';
import pass5Routes from './routes/pass5Tools.js';
import symptomAnalyzerRoutes from './routes/symptomAnalyzer.js';
import medicationAdherenceRoutes from './routes/medicationAdherence.js';
import labTrendWatchRoutes from './routes/labTrendWatch.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import { setupSwagger } from './swagger.js';

// Gap routes
import gapAppointmentScheduling from './routes/gap-no-appointment-scheduling.js';
import gapInsuranceInformation from './routes/gap-no-insurance-information-module.js';
import gapLabResultImport from './routes/gap-no-lab-result-import.js';
import gapMedicationAdherencePattern from './routes/gap-no-medication-adherence-pattern-model.js';
import gapMedicationInteractionChecker from './routes/gap-no-medication-interaction-checker.js';
import gapPrescriptionPharmacy from './routes/gap-no-prescription-pharmacy-integration.js';
import gapProviderPortal from './routes/gap-no-provider-portal-share-data-with.js';
import gapSkinLesionVisionAi from './routes/gap-no-skin-lesion-vision-ai.js';
import gapSymptomAnalyzerEndpoint from './routes/gap-no-symptom-analyzer-endpoint.js';
import gapTelemedicine from './routes/gap-no-telemedicine.js';
import gapTherapyProgressAnalyzer from './routes/gap-no-therapy-progress-analyzer.js';
import gapVisionTestInterpreter from './routes/gap-no-vision-test-interpreter.js';
import gapWebhookSurface from './routes/gap-no-webhook-surface.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Request logging
app.use(requestLogger);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger API Documentation
setupSwagger(app);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/physical-therapy', physicalTherapyRoutes);
app.use('/api/skin-scans', skinScanRoutes);
app.use('/api/vision-tests', visionTestRoutes);
app.use('/api/medical-history', medicalHistoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pass5', pass5Routes);
app.use('/api/symptom-analyzer', symptomAnalyzerRoutes);
app.use('/api/medication-adherence', medicationAdherenceRoutes);
app.use('/api/lab-trend-watch', labTrendWatchRoutes);

// Gap routes
app.use('/api/gap-no-appointment-scheduling', gapAppointmentScheduling);
app.use('/api/gap-no-insurance-information-module', gapInsuranceInformation);
app.use('/api/gap-no-lab-result-import', gapLabResultImport);
app.use('/api/gap-no-medication-adherence-pattern-model', gapMedicationAdherencePattern);
app.use('/api/gap-no-medication-interaction-checker', gapMedicationInteractionChecker);
app.use('/api/gap-no-prescription-pharmacy-integration', gapPrescriptionPharmacy);
app.use('/api/gap-no-provider-portal-share-data-with', gapProviderPortal);
app.use('/api/gap-no-skin-lesion-vision-ai', gapSkinLesionVisionAi);
app.use('/api/gap-no-symptom-analyzer-endpoint', gapSymptomAnalyzerEndpoint);
app.use('/api/gap-no-telemedicine', gapTelemedicine);
app.use('/api/gap-no-therapy-progress-analyzer', gapTherapyProgressAnalyzer);
app.use('/api/gap-no-vision-test-interpreter', gapVisionTestInterpreter);
app.use('/api/gap-no-webhook-surface', gapWebhookSurface);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), version: '2.0.0' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🏥 AI Healthcare Companion server running on port ${PORT}`);
});
