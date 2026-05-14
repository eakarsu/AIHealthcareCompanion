
// === Batch 04 Gaps & Frontend Mounts ===
const route_gap_no_symptom_analyzer_endpoint = require('./routes/gap-no-symptom-analyzer-endpoint');
const route_gap_no_medication_interaction_checker = require('./routes/gap-no-medication-interaction-checker');
const route_gap_no_therapy_progress_analyzer = require('./routes/gap-no-therapy-progress-analyzer');
const route_gap_no_skin_lesion_vision_ai = require('./routes/gap-no-skin-lesion-vision-ai');
const route_gap_no_vision_test_interpreter = require('./routes/gap-no-vision-test-interpreter');
const route_gap_no_medication_adherence_pattern_model = require('./routes/gap-no-medication-adherence-pattern-model');
const route_gap_no_provider_portal_share_data_with = require('./routes/gap-no-provider-portal-share-data-with');
const route_gap_no_prescription_pharmacy_integration = require('./routes/gap-no-prescription-pharmacy-integration');
const route_gap_no_appointment_scheduling = require('./routes/gap-no-appointment-scheduling');
const route_gap_no_telemedicine = require('./routes/gap-no-telemedicine');
const route_gap_no_insurance_information_module = require('./routes/gap-no-insurance-information-module');
const route_gap_no_lab_result_import = require('./routes/gap-no-lab-result-import');
const route_gap_no_webhook_surface = require('./routes/gap-no-webhook-surface');
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
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import { setupSwagger } from './swagger.js';

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
import('./routes/symptomAnalyzer.js').then(m => app.use('/api/symptom-analyzer', m.default));
import('./routes/medicationAdherence.js').then(m => app.use('/api/medication-adherence', m.default));

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


app.use('/api/gap-no-symptom-analyzer-endpoint', route_gap_no_symptom_analyzer_endpoint);
app.use('/api/gap-no-medication-interaction-checker', route_gap_no_medication_interaction_checker);
app.use('/api/gap-no-therapy-progress-analyzer', route_gap_no_therapy_progress_analyzer);
app.use('/api/gap-no-skin-lesion-vision-ai', route_gap_no_skin_lesion_vision_ai);
app.use('/api/gap-no-vision-test-interpreter', route_gap_no_vision_test_interpreter);
app.use('/api/gap-no-medication-adherence-pattern-model', route_gap_no_medication_adherence_pattern_model);
app.use('/api/gap-no-provider-portal-share-data-with', route_gap_no_provider_portal_share_data_with);
app.use('/api/gap-no-prescription-pharmacy-integration', route_gap_no_prescription_pharmacy_integration);
app.use('/api/gap-no-appointment-scheduling', route_gap_no_appointment_scheduling);
app.use('/api/gap-no-telemedicine', route_gap_no_telemedicine);
app.use('/api/gap-no-insurance-information-module', route_gap_no_insurance_information_module);
app.use('/api/gap-no-lab-result-import', route_gap_no_lab_result_import);
app.use('/api/gap-no-webhook-surface', route_gap_no_webhook_surface);

app.listen(PORT, () => {
  console.log(`🏥 AI Healthcare Companion server running on port ${PORT}`);
});
