import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

/**
 * Create a test user in the database with a hashed password.
 * Returns the created user record.
 */
export const createTestUser = async () => {
  const hashedPassword = await bcrypt.hash('testpass1234', 10);
  return prisma.user.create({
    data: {
      email: `test-${Date.now()}@test.com`,
      password: hashedPassword,
      name: 'Test User',
      emailVerified: true
    }
  });
};

/**
 * Generate a JWT token matching the format used in the auth routes.
 * The token payload includes { id, email, role } to match server/routes/auth.js.
 */
export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

/**
 * Clean up a test user and all related data.
 * Deletes related records first to respect foreign key constraints.
 */
export const cleanupTestUser = async (userId) => {
  // Clean related data first (respecting foreign key constraints)
  await prisma.notification.deleteMany({ where: { userId } });
  await prisma.auditLog.deleteMany({ where: { userId } });
  await prisma.feedback.deleteMany({ where: { userId } });
  await prisma.medication.deleteMany({ where: { userId } });
  await prisma.physicalTherapy.deleteMany({ where: { userId } });
  await prisma.skinScan.deleteMany({ where: { userId } });
  await prisma.visionTest.deleteMany({ where: { userId } });
  await prisma.medicalHistory.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
};

/**
 * Create a minimal Express app wired with the auth routes.
 * This avoids importing server/index.js which auto-starts the server.
 */
export const createAuthApp = async () => {
  const { default: authRoutes } = await import('../server/routes/auth.js');
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
};

/**
 * Create a minimal Express app wired with the medication routes.
 * Includes JSON body parsing and the authenticateToken middleware
 * is already applied within the medication router.
 */
export const createMedicationsApp = async () => {
  const { default: medicationRoutes } = await import('../server/routes/medications.js');
  const app = express();
  app.use(express.json());
  app.use('/api/medications', medicationRoutes);
  return app;
};

export { prisma };
