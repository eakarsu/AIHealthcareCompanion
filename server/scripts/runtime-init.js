import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

const { default: prisma } = await import('../db.js');

try {
  const email = (process.env.ADMIN_EMAIL || 'runtime-admin@example.com').trim().toLowerCase();
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'RuntimeAcceptance123!', 12);
  await prisma.user.upsert({
    where: { email },
    update: { password, name: 'Runtime Administrator', role: 'admin', emailVerified: true },
    create: { email, password, name: 'Runtime Administrator', role: 'admin', emailVerified: true },
  });
} catch (error) {
  console.error(`Runtime initialization failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
