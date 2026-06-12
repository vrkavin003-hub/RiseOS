import crypto from 'crypto';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

const DEFAULT_EMAIL = 'admin@riseos.ai';
const DEFAULT_NAME = 'RiseOS Admin';

function getSeedPassword() {
  return process.env.SEED_PASSWORD || crypto.randomBytes(12).toString('base64url');
}

async function seedAdminUser() {
  const email = (process.env.SEED_EMAIL || DEFAULT_EMAIL).trim().toLowerCase();
  const name = (process.env.SEED_NAME || DEFAULT_NAME).trim();
  const password = getSeedPassword();

  if (password.length < 8) {
    throw new Error('SEED_PASSWORD must be at least 8 characters.');
  }

  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB is not connected. Set MONGO_URI, MONGODB_URI, or DATABASE_URL before running this script.');
  }

  const existing = await User.findOne({ email }).select('+password');

  if (existing) {
    existing.name = name;
    existing.password = password;
    existing.role = 'admin';
    existing.emailVerified = true;
    existing.emailVerificationToken = undefined;
    existing.passwordResetToken = undefined;
    existing.passwordResetExpires = undefined;
    existing.refreshTokens = [];
    await existing.save();
  } else {
    await User.create({
      aiPreferences: {
        coachingStyle: 'strategic',
        focusAreas: ['Founder Mode', 'Deep Work', 'Financial Literacy'],
      },
      bio: 'First admin account for RiseOS AI.',
      email,
      emailVerified: true,
      goals: ['Operate RiseOS AI', 'Build daily discipline', 'Improve business decisions'],
      name,
      password,
      profession: 'RiseOS Operator',
      role: 'admin',
    });
  }

  console.log('');
  console.log('RiseOS admin login is ready.');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('');
  console.log('Use this password once, then change it from the app settings.');
}

seedAdminUser()
  .catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
