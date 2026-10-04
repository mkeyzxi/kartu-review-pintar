/**
 * Script migrasi data dari MySQL ke Firestore
 * 
 * Cara penggunaan:
 * 1. Install dependencies: npm install
 * 2. Download serviceAccountKey.json dari Firebase Console
 * 3. Simpan di folder scripts/ dengan nama serviceAccountKey.json
 * 4. Jalankan: node scripts/migrate-to-firestore.js
 */

import admin from 'firebase-admin';
import mysql from 'mysql2/promise';
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

const db = admin.firestore();

// MySQL configuration
const mysqlConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'db_kartupintar',
};

async function migrateLinks(connection) {
  console.log('Migrating links...');
  
  const [rows] = await connection.execute('SELECT * FROM links');
  console.log(`Found ${rows.length} links to migrate`);
  
  const batch = db.batch();
  let count = 0;
  
  for (const link of rows) {
    const docRef = db.collection('links').doc(link.slug);
    
    batch.set(docRef, {
      slug: link.slug,
      storeName: link.store_name || null,
      label: link.label || null,
      phoneNumber: link.phone_number || null,
      urlGmb: link.url_gmb || null,
      isClaimed: Boolean(link.is_claimed),
      pinHash: link.pin || null,
      isSuspended: Boolean(link.is_suspended),
      expiredAt: link.expired_at ? admin.firestore.Timestamp.fromDate(new Date(link.expired_at)) : null,
      createdAt: admin.firestore.Timestamp.fromDate(new Date(link.created_at)),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date(link.updated_at)),
    });
    
    count++;
    
    // Firestore batch limit adalah 500 operations
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Migrated ${count} links...`);
    }
  }
  
  await batch.commit();
  console.log(`Total ${count} links migrated!`);
}

async function migrateScanLogs(connection) {
  console.log('Migrating scan logs...');
  
  const [rows] = await connection.execute('SELECT * FROM scan_logs');
  console.log(`Found ${rows.length} scan logs to migrate`);
  
  const batch = db.batch();
  let count = 0;
  
  for (const log of rows) {
    const docRef = db.collection('scanLogs').doc();
    
    batch.set(docRef, {
      linkId: log.link_id.toString(),
      linkSlug: log.link_slug || '',
      ipHash: log.ip_hash || null,
      userAgent: log.user_agent || null,
      deviceType: log.device_type || null,
      browser: log.browser || null,
      referrer: log.referrer || null,
      status: log.status || 'valid',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(log.created_at)),
    });
    
    count++;
    
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Migrated ${count} scan logs...`);
    }
  }
  
  await batch.commit();
  console.log(`Total ${count} scan logs migrated!`);
}

async function migrate() {
  let connection;
  
  try {
    console.log('Connecting to MySQL...');
    connection = await mysql.createConnection(mysqlConfig);
    console.log('Connected to MySQL!');
    
    // Migrate links
    await migrateLinks(connection);
    
    // Migrate scan logs
    await migrateScanLogs(connection);
    
    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrate();
