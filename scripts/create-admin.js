/**
 * Script untuk membuat admin user baru
 * 
 * Cara penggunaan:
 * node scripts/create-admin.js <email> <password>
 * 
 * Contoh:
 * node scripts/create-admin.js admin@example.com mypassword123
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: serviceAccountKey.json tidak ditemukan di folder scripts/');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();

async function createAdmin(email, password) {
  try {
    // Create user
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: true,
      displayName: 'Admin',
    });

    console.log(`User created: ${userRecord.uid}`);

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin'
    });

    console.log('Custom claims set');

    // Create admin user document (admins collection, used by login page)
    await db.collection('admins').doc(email).set({
      email: email,
      password: password,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('Admin user document created');
    console.log(`\nAdmin user berhasil dibuat!`);
    console.log(`Email: ${email}`);
    console.log(`UID: ${userRecord.uid}`);

  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

// Get arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node scripts/create-admin.js <email> <password>');
  process.exit(1);
}

const [email, password] = args;

createAdmin(email, password);
