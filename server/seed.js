import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (order matters for foreign keys)
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.physicalTherapy.deleteMany();
  await prisma.skinScan.deleteMany();
  await prisma.visionTest.deleteMany();
  await prisma.medicalHistory.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleared existing data');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@healthcare.com',
      password: hashedPassword,
      name: 'Demo User',
      role: 'user',
      emailVerified: true,
      darkMode: false,
      language: 'en',
      onboardingDone: true
    }
  });

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@healthcare.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
      emailVerified: true,
      darkMode: false,
      language: 'en',
      onboardingDone: true
    }
  });

  console.log('✓ Created demo user: demo@healthcare.com / demo123');
  console.log('✓ Created admin user: admin@healthcare.com / admin123\n');

  // Seed Medications (15+ items)
  const medications = [
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', timeOfDay: 'Morning', purpose: 'Blood pressure control', sideEffects: 'Dry cough, dizziness', isActive: true },
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', timeOfDay: 'Morning and Evening', purpose: 'Type 2 diabetes management', sideEffects: 'Nausea, stomach upset', isActive: true },
    { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', timeOfDay: 'Evening', purpose: 'Cholesterol management', sideEffects: 'Muscle pain', isActive: true },
    { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', timeOfDay: 'Before breakfast', purpose: 'Acid reflux prevention', sideEffects: 'Headache', isActive: true },
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', timeOfDay: 'Morning', purpose: 'High blood pressure', sideEffects: 'Swelling in ankles', isActive: true },
    { name: 'Levothyroxine', dosage: '50mcg', frequency: 'Once daily', timeOfDay: 'Morning, empty stomach', purpose: 'Thyroid hormone replacement', sideEffects: 'Weight changes', isActive: true },
    { name: 'Gabapentin', dosage: '300mg', frequency: 'Three times daily', timeOfDay: 'Morning, Afternoon, Night', purpose: 'Nerve pain relief', sideEffects: 'Drowsiness, dizziness', isActive: true },
    { name: 'Sertraline', dosage: '50mg', frequency: 'Once daily', timeOfDay: 'Morning', purpose: 'Depression and anxiety', sideEffects: 'Nausea, insomnia', isActive: true },
    { name: 'Losartan', dosage: '50mg', frequency: 'Once daily', timeOfDay: 'Evening', purpose: 'Blood pressure and kidney protection', sideEffects: 'Dizziness', isActive: true },
    { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', timeOfDay: 'Morning with food', purpose: 'Heart attack prevention', sideEffects: 'Stomach irritation', isActive: true },
    { name: 'Vitamin D3', dosage: '2000 IU', frequency: 'Once daily', timeOfDay: 'With meal', purpose: 'Vitamin D deficiency', sideEffects: 'None reported', isActive: true },
    { name: 'Metoprolol', dosage: '25mg', frequency: 'Twice daily', timeOfDay: 'Morning and Evening', purpose: 'Heart rate control', sideEffects: 'Fatigue, cold hands', isActive: true },
    { name: 'Pantoprazole', dosage: '40mg', frequency: 'Once daily', timeOfDay: 'Before breakfast', purpose: 'GERD treatment', sideEffects: 'Headache, diarrhea', isActive: true },
    { name: 'Fluticasone', dosage: '50mcg/spray', frequency: 'Twice daily', timeOfDay: 'Morning and Evening', purpose: 'Allergic rhinitis', sideEffects: 'Nasal irritation', isActive: true },
    { name: 'Montelukast', dosage: '10mg', frequency: 'Once daily', timeOfDay: 'Evening', purpose: 'Asthma prevention', sideEffects: 'Mood changes', isActive: true },
    { name: 'Hydrochlorothiazide', dosage: '25mg', frequency: 'Once daily', timeOfDay: 'Morning', purpose: 'Water retention', sideEffects: 'Increased urination', isActive: false }
  ];

  for (const med of medications) {
    await prisma.medication.create({
      data: {
        ...med,
        userId: user.id,
        startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        interactions: null,
        notes: `Prescribed for ${med.purpose}`
      }
    });
  }
  console.log(`✓ Seeded ${medications.length} medications`);

  // Seed Physical Therapy Exercises (15+ items)
  const exercises = [
    { exerciseName: 'Knee Flexion Stretch', bodyPart: 'Knee', description: 'Gentle knee bending exercise to improve range of motion', duration: 10, repetitions: 15, sets: 3, difficulty: 'Easy', instructions: 'Lie on back, slowly bend knee bringing heel toward buttocks, hold for 5 seconds', precautions: 'Stop if sharp pain occurs' },
    { exerciseName: 'Shoulder Pendulum', bodyPart: 'Shoulder', description: 'Pendulum swings to relieve shoulder stiffness', duration: 5, repetitions: 20, sets: 2, difficulty: 'Easy', instructions: 'Lean forward, let arm hang, make small circles', precautions: 'Keep movements gentle' },
    { exerciseName: 'Hip Bridge', bodyPart: 'Hip/Lower Back', description: 'Strengthen glutes and lower back muscles', duration: 15, repetitions: 12, sets: 3, difficulty: 'Medium', instructions: 'Lie on back with knees bent, lift hips toward ceiling, squeeze glutes', precautions: 'Do not hyperextend lower back' },
    { exerciseName: 'Ankle Alphabet', bodyPart: 'Ankle', description: 'Ankle mobility exercise tracing letters', duration: 5, repetitions: 26, sets: 2, difficulty: 'Easy', instructions: 'Sit with leg extended, trace alphabet letters with big toe', precautions: 'Move slowly and controlled' },
    { exerciseName: 'Wall Push-Ups', bodyPart: 'Upper Body', description: 'Modified push-ups for upper body strength', duration: 10, repetitions: 15, sets: 3, difficulty: 'Easy', instructions: 'Stand arm length from wall, perform push-up motion against wall', precautions: 'Keep core engaged' },
    { exerciseName: 'Cat-Cow Stretch', bodyPart: 'Spine', description: 'Spinal mobility and flexibility exercise', duration: 10, repetitions: 10, sets: 3, difficulty: 'Easy', instructions: 'On hands and knees, alternate between arching and rounding spine', precautions: 'Move with breath' },
    { exerciseName: 'Clamshells', bodyPart: 'Hip', description: 'Hip strengthening for stability', duration: 10, repetitions: 15, sets: 3, difficulty: 'Medium', instructions: 'Lie on side with knees bent, open top knee like a clamshell', precautions: 'Keep hips stacked' },
    { exerciseName: 'Seated Hamstring Stretch', bodyPart: 'Hamstring', description: 'Stretch posterior thigh muscles', duration: 15, repetitions: 3, sets: 2, difficulty: 'Easy', instructions: 'Sit with one leg extended, reach toward toes, hold 30 seconds', precautions: 'Do not bounce' },
    { exerciseName: 'Quadriceps Stretch', bodyPart: 'Quadriceps', description: 'Standing quad stretch for thigh flexibility', duration: 10, repetitions: 3, sets: 2, difficulty: 'Easy', instructions: 'Stand on one leg, pull other heel toward buttocks', precautions: 'Hold onto support if needed' },
    { exerciseName: 'Bird Dog', bodyPart: 'Core/Back', description: 'Core stability and back strengthening', duration: 15, repetitions: 10, sets: 3, difficulty: 'Medium', instructions: 'On hands and knees, extend opposite arm and leg, hold 5 seconds', precautions: 'Keep spine neutral' },
    { exerciseName: 'Wrist Flexor Stretch', bodyPart: 'Wrist/Forearm', description: 'Stretch for carpal tunnel prevention', duration: 5, repetitions: 5, sets: 3, difficulty: 'Easy', instructions: 'Extend arm, pull fingers back with other hand', precautions: 'Gentle pressure only' },
    { exerciseName: 'Neck Rotation', bodyPart: 'Neck', description: 'Cervical mobility exercise', duration: 5, repetitions: 10, sets: 2, difficulty: 'Easy', instructions: 'Slowly turn head to look over each shoulder', precautions: 'No jerky movements' },
    { exerciseName: 'Heel Raises', bodyPart: 'Calf', description: 'Strengthen calf muscles and improve balance', duration: 10, repetitions: 15, sets: 3, difficulty: 'Easy', instructions: 'Stand near wall, raise up on toes, lower slowly', precautions: 'Use support if unsteady' },
    { exerciseName: 'Side Leg Raises', bodyPart: 'Hip Abductors', description: 'Strengthen outer hip muscles', duration: 15, repetitions: 12, sets: 3, difficulty: 'Medium', instructions: 'Lie on side, lift top leg 45 degrees, lower slowly', precautions: 'Keep body aligned' },
    { exerciseName: 'Thoracic Extension', bodyPart: 'Upper Back', description: 'Improve upper back mobility', duration: 10, repetitions: 10, sets: 2, difficulty: 'Medium', instructions: 'Sit in chair, place hands behind head, gently arch upper back over chair', precautions: 'Support lower back' },
    { exerciseName: 'Plank Hold', bodyPart: 'Core', description: 'Core strengthening isometric exercise', duration: 5, repetitions: 3, sets: 3, difficulty: 'Hard', instructions: 'Hold push-up position with straight body for 30-60 seconds', precautions: 'Do not let hips sag' }
  ];

  for (const exercise of exercises) {
    await prisma.physicalTherapy.create({
      data: {
        ...exercise,
        userId: user.id,
        status: Math.random() > 0.7 ? 'completed' : 'pending',
        completedAt: Math.random() > 0.7 ? new Date() : null
      }
    });
  }
  console.log(`✓ Seeded ${exercises.length} physical therapy exercises`);

  // Seed Skin Scans (15+ items)
  const skinScans = [
    { bodyLocation: 'Left forearm', symptomDescription: 'Red, itchy patch that appeared last week', duration: '1 week', severity: 'Mild' },
    { bodyLocation: 'Back of neck', symptomDescription: 'Dark, rough patch of skin', duration: '3 months', severity: 'Moderate' },
    { bodyLocation: 'Right cheek', symptomDescription: 'Small, raised bump that is flesh-colored', duration: '2 weeks', severity: 'Mild' },
    { bodyLocation: 'Chest', symptomDescription: 'Multiple small red dots appeared suddenly', duration: '3 days', severity: 'Moderate' },
    { bodyLocation: 'Left ankle', symptomDescription: 'Dry, scaly patch that cracks sometimes', duration: '2 months', severity: 'Moderate' },
    { bodyLocation: 'Face - forehead', symptomDescription: 'Acne breakout with some cystic spots', duration: '2 weeks', severity: 'Moderate' },
    { bodyLocation: 'Right hand', symptomDescription: 'Small blister-like bumps between fingers', duration: '5 days', severity: 'Mild' },
    { bodyLocation: 'Lower back', symptomDescription: 'Large, irregular mole that seems to have grown', duration: '6 months', severity: 'High' },
    { bodyLocation: 'Scalp', symptomDescription: 'Flaky, itchy patches with some hair loss', duration: '1 month', severity: 'Moderate' },
    { bodyLocation: 'Left shin', symptomDescription: 'Purple-red marks that appeared after minor injury', duration: '2 weeks', severity: 'Mild' },
    { bodyLocation: 'Underarm', symptomDescription: 'Dark discoloration in skin folds', duration: '4 months', severity: 'Mild' },
    { bodyLocation: 'Right foot sole', symptomDescription: 'Hard, callused area that is painful when walking', duration: '3 months', severity: 'Moderate' },
    { bodyLocation: 'Upper arm', symptomDescription: 'Small, rough bumps that look like goosebumps', duration: '1 year', severity: 'Mild' },
    { bodyLocation: 'Behind ear', symptomDescription: 'Crusty, weeping patch that keeps returning', duration: '2 months', severity: 'Moderate' },
    { bodyLocation: 'Nose', symptomDescription: 'Persistent red, bumpy area with visible blood vessels', duration: '6 months', severity: 'Moderate' },
    { bodyLocation: 'Groin area', symptomDescription: 'Red, itchy rash in skin folds', duration: '1 week', severity: 'Moderate' }
  ];

  for (const scan of skinScans) {
    await prisma.skinScan.create({
      data: {
        ...scan,
        userId: user.id,
        riskLevel: scan.severity === 'High' ? 'high' : scan.severity === 'Moderate' ? 'moderate' : 'low',
        followUpNeeded: scan.severity !== 'Mild'
      }
    });
  }
  console.log(`✓ Seeded ${skinScans.length} skin scans`);

  // Seed Vision Tests (15+ items)
  const visionTests = [
    { testType: 'Comprehensive', leftEyeResult: '20/25', rightEyeResult: '20/20', colorVision: 'Normal', nearVision: 'Normal', distanceVision: 'Slightly reduced left eye' },
    { testType: 'Distance Vision', leftEyeResult: '20/30', rightEyeResult: '20/25', distanceVision: 'Mild myopia detected' },
    { testType: 'Near Vision', leftEyeResult: '20/20', rightEyeResult: '20/20', nearVision: 'Normal for age' },
    { testType: 'Color Vision', colorVision: 'Mild red-green deficiency', leftEyeResult: 'N/A', rightEyeResult: 'N/A' },
    { testType: 'Comprehensive', leftEyeResult: '20/40', rightEyeResult: '20/30', colorVision: 'Normal', contrastSensitivity: 'Reduced', nearVision: 'Presbyopia symptoms' },
    { testType: 'Distance Vision', leftEyeResult: '20/20', rightEyeResult: '20/20', distanceVision: 'Perfect distance vision' },
    { testType: 'Contrast Sensitivity', contrastSensitivity: 'Normal range', leftEyeResult: 'Good', rightEyeResult: 'Good' },
    { testType: 'Comprehensive', leftEyeResult: '20/50', rightEyeResult: '20/40', colorVision: 'Normal', nearVision: 'Reduced', distanceVision: 'Moderate reduction' },
    { testType: 'Near Vision', leftEyeResult: '20/25', rightEyeResult: '20/25', nearVision: 'Reading glasses recommended' },
    { testType: 'Follow-up', leftEyeResult: '20/30', rightEyeResult: '20/25', distanceVision: 'Improved with new prescription' },
    { testType: 'Distance Vision', leftEyeResult: '20/70', rightEyeResult: '20/60', distanceVision: 'Significant myopia - glasses required' },
    { testType: 'Comprehensive', leftEyeResult: '20/20', rightEyeResult: '20/25', colorVision: 'Normal', contrastSensitivity: 'Normal', nearVision: 'Normal', distanceVision: 'Excellent' },
    { testType: 'Color Vision', colorVision: 'Normal - all plates identified', leftEyeResult: 'N/A', rightEyeResult: 'N/A' },
    { testType: 'Near Vision', leftEyeResult: '20/30', rightEyeResult: '20/30', nearVision: 'Age-related changes noted' },
    { testType: 'Comprehensive', leftEyeResult: '20/25', rightEyeResult: '20/30', colorVision: 'Normal', nearVision: 'Slightly reduced', distanceVision: 'Normal' },
    { testType: 'Screening', leftEyeResult: '20/20', rightEyeResult: '20/20', colorVision: 'Pass', distanceVision: 'Pass' }
  ];

  for (let i = 0; i < visionTests.length; i++) {
    await prisma.visionTest.create({
      data: {
        ...visionTests[i],
        userId: user.id,
        testDate: new Date(Date.now() - (i * 30 * 24 * 60 * 60 * 1000)) // Each test 30 days apart
      }
    });
  }
  console.log(`✓ Seeded ${visionTests.length} vision tests`);

  // Seed Medical History (15+ items)
  const medicalHistory = [
    { condition: 'Type 2 Diabetes', status: 'Managed', treatingDoctor: 'Dr. Sarah Johnson', hospital: 'City General Hospital', medications: 'Metformin 500mg', allergies: 'None', familyHistory: 'Father had diabetes' },
    { condition: 'Hypertension', status: 'Controlled', treatingDoctor: 'Dr. Michael Chen', hospital: 'Heart Care Clinic', medications: 'Lisinopril 10mg, Amlodipine 5mg', allergies: 'Penicillin', familyHistory: 'Mother has hypertension' },
    { condition: 'Appendectomy', status: 'Resolved', treatingDoctor: 'Dr. Robert Williams', hospital: 'Memorial Hospital', surgeries: 'Laparoscopic appendectomy 2019', allergies: 'None' },
    { condition: 'Asthma', status: 'Managed', treatingDoctor: 'Dr. Emily Davis', hospital: 'Respiratory Care Center', medications: 'Fluticasone, Montelukast', allergies: 'Dust mites, pollen', familyHistory: 'Brother has asthma' },
    { condition: 'GERD', status: 'Managed', treatingDoctor: 'Dr. James Wilson', hospital: 'GI Specialists', medications: 'Omeprazole 20mg', allergies: 'None' },
    { condition: 'Hypothyroidism', status: 'Controlled', treatingDoctor: 'Dr. Lisa Brown', hospital: 'Endocrine Center', medications: 'Levothyroxine 50mcg', familyHistory: 'Aunt has thyroid issues' },
    { condition: 'Knee Injury - ACL Tear', status: 'Recovered', treatingDoctor: 'Dr. David Martinez', hospital: 'Sports Medicine Clinic', surgeries: 'ACL reconstruction 2020', notes: 'Full recovery after 9 months of physical therapy' },
    { condition: 'Anxiety Disorder', status: 'Managed', treatingDoctor: 'Dr. Jennifer Taylor', hospital: 'Mental Health Associates', medications: 'Sertraline 50mg', notes: 'Weekly therapy sessions' },
    { condition: 'Migraine', status: 'Intermittent', treatingDoctor: 'Dr. Patricia Anderson', hospital: 'Neurology Partners', medications: 'Sumatriptan as needed', familyHistory: 'Mother has migraines' },
    { condition: 'Vitamin D Deficiency', status: 'Improving', treatingDoctor: 'Dr. Sarah Johnson', hospital: 'City General Hospital', medications: 'Vitamin D3 2000 IU daily' },
    { condition: 'Seasonal Allergies', status: 'Managed', treatingDoctor: 'Dr. Emily Davis', hospital: 'Allergy & Asthma Center', medications: 'Fluticasone nasal spray', allergies: 'Pollen, ragweed, grass' },
    { condition: 'Carpal Tunnel Syndrome', status: 'Mild', treatingDoctor: 'Dr. Mark Thompson', hospital: 'Hand & Wrist Center', notes: 'Night splint prescribed, ergonomic adjustments recommended' },
    { condition: 'High Cholesterol', status: 'Controlled', treatingDoctor: 'Dr. Michael Chen', hospital: 'Heart Care Clinic', medications: 'Atorvastatin 20mg', familyHistory: 'Father had heart disease' },
    { condition: 'Wisdom Teeth Removal', status: 'Resolved', treatingDoctor: 'Dr. Kevin Lee, DDS', hospital: 'Oral Surgery Associates', surgeries: 'All four wisdom teeth extracted 2018' },
    { condition: 'Iron Deficiency Anemia', status: 'Resolved', treatingDoctor: 'Dr. Sarah Johnson', hospital: 'City General Hospital', medications: 'Iron supplements (completed)', notes: 'Levels normalized after 3 months' },
    { condition: 'Lower Back Pain', status: 'Chronic', treatingDoctor: 'Dr. David Martinez', hospital: 'Spine & Pain Center', medications: 'Gabapentin 300mg', notes: 'Physical therapy ongoing' }
  ];

  for (let i = 0; i < medicalHistory.length; i++) {
    await prisma.medicalHistory.create({
      data: {
        ...medicalHistory[i],
        userId: user.id,
        diagnosisDate: new Date(Date.now() - (Math.random() * 5 * 365 * 24 * 60 * 60 * 1000)) // Random date within last 5 years
      }
    });
  }
  console.log(`✓ Seeded ${medicalHistory.length} medical history records`);

  // Seed Notifications (15+ items)
  const notifications = [
    { type: 'medication', title: 'Medication Reminder: Lisinopril', message: 'Time to take your Lisinopril 10mg - morning dose', read: false },
    { type: 'medication', title: 'Medication Reminder: Metformin', message: 'Time to take your Metformin 500mg - evening dose', read: false },
    { type: 'medication', title: 'Refill Needed: Atorvastatin', message: 'Your Atorvastatin prescription is running low. Only 5 days supply remaining.', read: false },
    { type: 'exercise', title: 'Physical Therapy Session', message: 'You have 3 pending exercises for today: Knee Flexion, Hip Bridge, and Bird Dog', read: false },
    { type: 'exercise', title: 'Great Progress!', message: 'You completed all your physical therapy exercises yesterday. Keep it up!', read: true },
    { type: 'skin', title: 'Skin Scan Follow-up', message: 'Your skin scan from last week flagged for follow-up. Please consult a dermatologist.', read: false },
    { type: 'vision', title: 'Vision Test Due', message: 'It has been 6 months since your last comprehensive vision test. Schedule one soon.', read: true },
    { type: 'medical', title: 'Lab Results Available', message: 'Your recent blood work results are now available for review.', read: true },
    { type: 'medication', title: 'Drug Interaction Alert', message: 'Potential interaction detected between Lisinopril and the new supplement you added.', read: false },
    { type: 'exercise', title: 'New Exercise Added', message: 'Dr. Martinez added Thoracic Extension to your therapy plan. Check it out!', read: true },
    { type: 'medical', title: 'Appointment Reminder', message: 'You have an appointment with Dr. Sarah Johnson tomorrow at 10:00 AM.', read: false },
    { type: 'medication', title: 'Medication Reminder: Gabapentin', message: 'Time for your afternoon Gabapentin 300mg dose', read: true },
    { type: 'skin', title: 'Monthly Skin Check', message: 'Reminder: Perform your monthly skin self-examination and log any changes.', read: true },
    { type: 'vision', title: 'Vision Test Results', message: 'Your recent distance vision test shows improvement. Left eye now 20/25.', read: true },
    { type: 'medical', title: 'Health Summary Ready', message: 'Your monthly health summary report has been generated. View it in your dashboard.', read: false },
    { type: 'medication', title: 'Medication Updated', message: 'Dr. Chen updated your Amlodipine dosage from 5mg to 10mg. Please review.', read: false }
  ];

  for (let i = 0; i < notifications.length; i++) {
    await prisma.notification.create({
      data: {
        ...notifications[i],
        userId: user.id,
        createdAt: new Date(Date.now() - i * 4 * 60 * 60 * 1000) // Each 4 hours apart
      }
    });
  }
  console.log(`✓ Seeded ${notifications.length} notifications`);

  // Seed Audit Logs (15+ items)
  const auditActions = [
    { action: 'LOGIN', resource: 'auth', details: 'User logged in successfully' },
    { action: 'CREATE', resource: 'medication', resourceId: '1', details: 'Created medication: Lisinopril 10mg' },
    { action: 'UPDATE', resource: 'medication', resourceId: '2', details: 'Updated Metformin dosage from 250mg to 500mg' },
    { action: 'CREATE', resource: 'skin-scan', resourceId: '1', details: 'New skin scan uploaded for left forearm' },
    { action: 'VIEW', resource: 'medical-history', details: 'Viewed medical history records' },
    { action: 'CREATE', resource: 'vision-test', resourceId: '1', details: 'Completed comprehensive vision test' },
    { action: 'UPDATE', resource: 'settings', details: 'Updated display name' },
    { action: 'EXPORT', resource: 'gdpr', details: 'Exported all personal data (GDPR)' },
    { action: 'CREATE', resource: 'physical-therapy', resourceId: '5', details: 'Added new exercise: Wall Push-Ups' },
    { action: 'DELETE', resource: 'notification', resourceId: '3', details: 'Deleted notification' },
    { action: 'UPDATE', resource: 'physical-therapy', resourceId: '1', details: 'Marked Knee Flexion Stretch as completed' },
    { action: 'CREATE', resource: 'feedback', resourceId: '1', details: 'Submitted feedback: Feature suggestion' },
    { action: 'LOGIN', resource: 'auth', details: 'User logged in from new device' },
    { action: 'UPDATE', resource: 'settings', details: 'Changed language to English' },
    { action: 'VIEW', resource: 'medications', details: 'Viewed medication list with AI analysis' },
    { action: 'PASSWORD_CHANGE', resource: 'auth', details: 'Password changed successfully' }
  ];

  for (let i = 0; i < auditActions.length; i++) {
    await prisma.auditLog.create({
      data: {
        ...auditActions[i],
        userId: user.id,
        ipAddress: '192.168.1.' + (100 + i),
        createdAt: new Date(Date.now() - i * 6 * 60 * 60 * 1000) // Each 6 hours apart
      }
    });
  }
  console.log(`✓ Seeded ${auditActions.length} audit logs`);

  // Seed Feedbacks (15+ items)
  const feedbacks = [
    { type: 'suggestion', subject: 'Add medication photo feature', message: 'It would be great to take photos of my medications so I can easily identify them.', status: 'open' },
    { type: 'bug', subject: 'Vision test chart not loading', message: 'The Snellen chart on the vision test page sometimes fails to load on mobile devices.', status: 'open' },
    { type: 'suggestion', subject: 'Integration with Apple Health', message: 'Please add integration with Apple Health to sync exercise and activity data.', status: 'open' },
    { type: 'praise', subject: 'Great medication tracker', message: 'The medication tracking feature with reminders has been incredibly helpful. Thank you!', status: 'resolved' },
    { type: 'bug', subject: 'Dark mode text visibility', message: 'Some text in the skin scan results is hard to read when dark mode is enabled.', status: 'open' },
    { type: 'suggestion', subject: 'Export to PDF', message: 'Add ability to export medical history as a PDF to share with new doctors.', status: 'open' },
    { type: 'bug', subject: 'Notification sound not working', message: 'Medication reminder notifications play no sound on Android Chrome.', status: 'resolved' },
    { type: 'suggestion', subject: 'Family member profiles', message: 'Allow managing health records for family members under one account.', status: 'open' },
    { type: 'praise', subject: 'AI skin analysis is impressive', message: 'The AI analysis for my skin scan was very accurate and gave helpful recommendations.', status: 'resolved' },
    { type: 'suggestion', subject: 'Wearable device sync', message: 'Support for Fitbit and Garmin to automatically log exercise completion.', status: 'open' },
    { type: 'bug', subject: 'Date format inconsistency', message: 'Some pages show dates in MM/DD/YYYY and others in DD/MM/YYYY format.', status: 'open' },
    { type: 'suggestion', subject: 'Appointment scheduling', message: 'Add a feature to schedule and track doctor appointments directly in the app.', status: 'open' },
    { type: 'praise', subject: 'Physical therapy exercises helped', message: 'Following the PT exercises in the app helped me recover from my knee surgery faster.', status: 'resolved' },
    { type: 'bug', subject: 'Search not finding medications', message: 'Global search does not return results when searching by medication purpose.', status: 'open' },
    { type: 'suggestion', subject: 'Medication interaction checker', message: 'Add a feature that automatically checks for drug interactions when adding new medications.', status: 'open' },
    { type: 'suggestion', subject: 'Voice input for symptoms', message: 'Allow voice-to-text input when describing skin scan symptoms for accessibility.', status: 'open' }
  ];

  for (let i = 0; i < feedbacks.length; i++) {
    await prisma.feedback.create({
      data: {
        ...feedbacks[i],
        userId: i % 3 === 0 ? admin.id : user.id,
        createdAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000) // Each 2 days apart
      }
    });
  }
  console.log(`✓ Seeded ${feedbacks.length} feedbacks`);

  // Seed Contact Messages (15+ items)
  const contactMessages = [
    { name: 'John Smith', email: 'john.smith@email.com', subject: 'Account access issue', message: 'I cannot log into my account after the recent update. I have tried resetting my password but the email never arrives.', status: 'new' },
    { name: 'Maria Garcia', email: 'maria.g@email.com', subject: 'Data privacy question', message: 'I would like to understand what data you collect and how it is stored. Can you provide your data processing agreement?', status: 'replied' },
    { name: 'David Lee', email: 'david.lee@email.com', subject: 'Feature request: Blood pressure tracking', message: 'Would it be possible to add blood pressure tracking? I need to monitor it daily for my cardiologist.', status: 'new' },
    { name: 'Sarah Wilson', email: 'sarah.w@email.com', subject: 'Bug report: Export not working', message: 'When I try to export my data as JSON, the download starts but the file is empty. I am using Safari on macOS.', status: 'replied' },
    { name: 'James Brown', email: 'j.brown@email.com', subject: 'Partnership inquiry', message: 'I am a physical therapist and would like to discuss a potential partnership to provide exercise content for your platform.', status: 'new' },
    { name: 'Emily Chen', email: 'emily.chen@email.com', subject: 'Accessibility concerns', message: 'Some of the color combinations used in the charts are difficult for me to distinguish as I have color blindness. Can you add patterns?', status: 'new' },
    { name: 'Robert Taylor', email: 'r.taylor@email.com', subject: 'HIPAA compliance question', message: 'Is your platform HIPAA compliant? I am a healthcare provider and need to verify before recommending it to patients.', status: 'replied' },
    { name: 'Lisa Anderson', email: 'lisa.a@email.com', subject: 'Delete my account', message: 'I would like to permanently delete my account and all associated data. Please confirm once this is done.', status: 'replied' },
    { name: 'Michael Johnson', email: 'mjohnson@email.com', subject: 'Billing question', message: 'I was charged twice for the premium subscription last month. Can you please look into this and issue a refund?', status: 'new' },
    { name: 'Jennifer Martinez', email: 'jen.m@email.com', subject: 'Thank you note', message: 'Just wanted to say thank you for building this app. It has made managing my chronic conditions so much easier.', status: 'replied' },
    { name: 'William Davis', email: 'w.davis@email.com', subject: 'API access request', message: 'I am a developer building a health dashboard. Do you offer an API that I could integrate with?', status: 'new' },
    { name: 'Amanda Thomas', email: 'amanda.t@email.com', subject: 'Medication reminder not working', message: 'My medication reminders stopped working after the latest app update. I rely on these for my daily medications.', status: 'new' },
    { name: 'Christopher White', email: 'c.white@email.com', subject: 'Multi-language support', message: 'Is there a plan to add Spanish language support? Many of my elderly family members would benefit from using this app.', status: 'replied' },
    { name: 'Patricia Harris', email: 'p.harris@email.com', subject: 'Data portability request', message: 'I am switching to another health platform. Can I export all my data in a format that can be imported elsewhere?', status: 'new' },
    { name: 'Daniel Clark', email: 'd.clark@email.com', subject: 'Skin scan accuracy question', message: 'How accurate is the AI skin analysis? I want to know if I can rely on it or if I should always see a dermatologist.', status: 'new' },
    { name: 'Karen Robinson', email: 'k.robinson@email.com', subject: 'Suggest: Calendar integration', message: 'It would be amazing if medication reminders and PT sessions could sync with Google Calendar or Apple Calendar.', status: 'new' }
  ];

  for (let i = 0; i < contactMessages.length; i++) {
    await prisma.contactMessage.create({
      data: {
        ...contactMessages[i],
        createdAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000) // Each 3 days apart
      }
    });
  }
  console.log(`✓ Seeded ${contactMessages.length} contact messages`);

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   - 1 demo user + 1 admin user`);
  console.log(`   - ${medications.length} medications`);
  console.log(`   - ${exercises.length} physical therapy exercises`);
  console.log(`   - ${skinScans.length} skin scans`);
  console.log(`   - ${visionTests.length} vision tests`);
  console.log(`   - ${medicalHistory.length} medical history records`);
  console.log(`   - ${notifications.length} notifications`);
  console.log(`   - ${auditActions.length} audit logs`);
  console.log(`   - ${feedbacks.length} feedbacks`);
  console.log(`   - ${contactMessages.length} contact messages`);
  console.log('\n🔐 Login credentials:');
  console.log('   Demo: demo@healthcare.com / demo123');
  console.log('   Admin: admin@healthcare.com / admin123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
