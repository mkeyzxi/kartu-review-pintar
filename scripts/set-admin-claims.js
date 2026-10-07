/**
 * Script untuk set custom claims admin ke user Firebase Auth specific email.
 * 
 * Cara penggunaan:
 * 1. Pastikan FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, dan PROJECT_ID sudah di-set di environment
 * 2. Jalankan: node scripts/set-admin-claims.js <email>
 * 
 * Contoh:
 *   node scripts/set-admin-claims.js admin@gmail.com
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const auth = getAuth(app);

async function setAdminClaims(email) {
  try {
    // Get user by email
    const user = await auth.getUserByEmail(email);
    
    console.log(`Found user: ${user.email} (UID: ${user.uid})`);
    
    // Set custom claims
    await auth.setCustomUserClaims(user.uid, {
      admin: true,
    });
    
    console.log(`✅ Successfully set admin claims for ${email}`);
    console.log(`   Custom claims: { admin: true }`);
    
    // Verify the claims were set
    const updatedUser = await auth.getUser(user.uid);
    console.log(`   Verified claims: ${JSON.stringify(updatedUser.customClaims)}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting admin claims:', error.message);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/set-admin-claims.js <email>');
  console.error('Example: node scripts/set-admin-claims.js admin@gmail.com');
  process.exit(1);
}

setAdminClaims(email);
