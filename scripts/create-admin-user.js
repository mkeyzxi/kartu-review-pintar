/**
 * Script untuk membuat user admin di Firebase Auth.
 * 
 * Cara penggunaan:
 *   node scripts/create-admin-user.js <email> <password>
 * 
 * Contoh:
 *   node scripts/create-admin-user.js admin@gmail.com mypassword123
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const auth = getAuth(app);

async function createAdminUser(email, password) {
  try {
    // Check if user already exists
    try {
      const existingUser = await auth.getUserByEmail(email);
      console.log(`User ${email} already exists (UID: ${existingUser.uid})`);
      console.log('Skipping user creation.');
      return existingUser;
    } catch (error) {
      // User doesn't exist, continue to create
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create new user
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: true,
    });

    console.log(`✅ Successfully created user: ${email}`);
    console.log(`   UID: ${userRecord.uid}`);
    
    return userRecord;
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node scripts/create-admin-user.js <email> <password>');
  console.error('Example: node scripts/create-admin-user.js admin@gmail.com mypassword123');
  process.exit(1);
}

createAdminUser(email, password).then(() => {
  console.log('\n📝 Next steps:');
  console.log('   1. Set custom claims: node scripts/set-admin-claims.js ' + email);
  console.log('   2. Login with the email and password');
  process.exit(0);
});
