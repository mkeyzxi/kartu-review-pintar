/**
 * Script setup Firestore - membuat admin user dan setup initial configuration
 * 
 * Cara penggunaan:
 * 1. Download serviceAccountKey.json dari Firebase Console
 * 2. Simpan di folder scripts/ dengan nama serviceAccountKey.json
 * 3. Set environment variables ADMIN_EMAIL dan ADMIN_PASSWORD
 * 4. Jalankan: node scripts/setup-firestore.js
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
  console.error('Silakan download dari Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();

async function setupFirestore() {
  console.log('Setting up Firestore...\n');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@kartupintar.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

  try {
    // Check if user already exists
    try {
      const existingUser = await auth.getUserByEmail(adminEmail);
      console.log(`Admin user sudah ada: ${existingUser.uid}`);
      
      // Update custom claims
      await auth.setCustomUserClaims(existingUser.uid, {
        admin: true,
        role: 'admin'
      });
      console.log('Custom claims updated');
    } catch (error) {
      // User doesn't exist, create new one
      if (error.code === 'auth/user-not-found') {
        const userRecord = await auth.createUser({
          email: adminEmail,
          password: adminPassword,
          emailVerified: true,
          displayName: 'Admin',
        });

        // Set custom claims
        await auth.setCustomUserClaims(userRecord.uid, {
          admin: true,
          role: 'admin'
        });

        console.log(`Admin user created: ${userRecord.uid}`);
        console.log(`Email: ${adminEmail}`);
      } else {
        throw error;
      }
    }

    // Create admin user document in Firestore (admins collection, used by login page)
    const adminUserRef = db.collection('admins').doc(adminEmail);
    await adminUserRef.set({
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log('Admin user document created in Firestore');

    // Print security rules
    console.log('\n' + '='.repeat(60));
    console.log('FIRESTORE SECURITY RULES');
    console.log('='.repeat(60));
    console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             request.auth.token.admin == true;
    }
    
    match /links/{slug} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    match /scanLogs/{logId} {
      allow create: if true;
      allow read, delete: if isAdmin();
      allow update: if false;
    }
    
    match /adminUsers/{userId} {
      allow read, write: if isAdmin();
    }
  }
}
    `);
    console.log('Silakan copy rules di atas ke Firebase Console > Firestore > Rules\n');

    // Print Firestore indexes needed
    console.log('='.repeat(60));
    console.log('FIRESTORE INDEXES YANG DIPERLUKAN');
    console.log('='.repeat(60));
    console.log(`
Buat composite indexes berikut di Firebase Console > Firestore > Indexes:

1. Links Collection:
   - Fields: isClaimed (Ascending), isSuspended (Ascending), expiredAt (Ascending)
   - Query scope: Collection

2. Links Collection:
   - Fields: storeName (Ascending), createdAt (Descending)
   - Query scope: Collection

3. Scan Logs Collection:
   - Fields: linkId (Ascending), createdAt (Descending)
   - Query scope: Collection

4. Scan Logs Collection:
   - Fields: ipHash (Ascending), createdAt (Descending)
   - Query scope: Collection

5. Scan Logs Collection:
   - Fields: status (Ascending), createdAt (Descending)
   - Query scope: Collection
    `);

    console.log('='.repeat(60));
    console.log('SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Apply security rules di Firebase Console');
    console.log('2. Create composite indexes');
    console.log('3. Test login dengan email dan password yang sudah dibuat');
    console.log('4. Jalankan migrasi data jika diperlukan: npm run migrate');

  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupFirestore();
