/**
 * Script untuk verifikasi konfigurasi Firebase Admin SDK dan Auth.
 * 
 * Cara penggunaan:
 *   node scripts/verify-firebase.js [email]
 * 
 * Script ini akan:
 * 1. Cek environment variables
 * 2. Cek koneksi ke Firebase Auth
 * 3. Cek apakah user admin exists
 * 4. Cek custom claims
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

console.log('=== Firebase Configuration Verification ===\n');

// 1. Check environment variables
console.log('1. Checking environment variables...');
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

let allEnvVarsSet = true;
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (!value) {
    console.error(`   ❌ ${envVar} is not set`);
    allEnvVarsSet = false;
  } else {
    console.log(`   ✅ ${envVar} is set`);
  }
}

if (!allEnvVarsSet) {
  console.error('\n❌ Some environment variables are missing. Please check your .env.local file.');
  process.exit(1);
}

// 2. Initialize Firebase Admin SDK
console.log('\n2. Initializing Firebase Admin SDK...');
try {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }
  console.log('   ✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('   ❌ Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1);
}

// 3. Check Firebase Auth connection
console.log('\n3. Checking Firebase Auth connection...');
const auth = getAuth();
console.log('   ✅ Firebase Auth is ready');

// 4. Check if admin user exists
const adminEmail = process.argv[2] || process.env.ADMIN_EMAIL;
if (adminEmail) {
  console.log(`\n4. Checking if admin user exists: ${adminEmail}`);
  try {
    const user = await auth.getUserByEmail(adminEmail);
    console.log(`   ✅ User exists: ${user.email} (UID: ${user.uid})`);
    
    // 5. Check custom claims
    console.log('\n5. Checking custom claims...');
    const customClaims = user.customClaims || {};
    console.log(`   Custom claims: ${JSON.stringify(customClaims)}`);
    
    if (customClaims.admin === true) {
      console.log('   ✅ User has admin claim');
    } else {
      console.log('   ⚠️  User does NOT have admin claim');
      console.log('   Run: node scripts/set-admin-claims.js ' + adminEmail);
    }
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`   ❌ User not found: ${adminEmail}`);
      console.log('   Run: node scripts/create-admin-user.js ' + adminEmail + ' <password>');
    } else {
      console.error('   ❌ Error checking user:', error.message);
    }
  }
} else {
  console.log('\n4. Skipping user check (no ADMIN_EMAIL provided)');
}

console.log('\n=== Verification Complete ===');
