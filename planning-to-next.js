/**
 * ============================================================================
 * PLANNING: MIGRASI LARAVEL → NEXT.JS APP ROUTER + FIREBASE
 * ============================================================================
 * 
 * File ini berisi perencanaan lengkap untuk migrasi aplikasi Kartu Review Pintar
 * dari Laravel (PHP/MySQL) ke Next.js App Router dengan Firebase sebagai backend.
 * 
 * Aplikasi saat ini:
 * - Laravel dengan MySQL
 * - Link Engine (NFC/QR card activation system)
 * - Admin Dashboard dengan analytics
 * - Scan logging dengan device detection
 * 
 * Target arsitektur:
 * - Next.js 14+ dengan App Router
 * - Firebase Firestore (database)
 * - Firebase Authentication (admin auth)
 * - Firebase Hosting (deployment)
 * - Vercel (alternative deployment)
 * 
 * ============================================================================
 */

const migrationPlan = {
  // ==========================================================================
  // BAGIAN 1: ANALISIS ARSITEKTUR LARAVEL SAAT INI
  // ==========================================================================
  
  currentArchitecture: {
    framework: 'Laravel 11',
    database: 'MySQL',
    sessionDriver: 'database',
    authSystem: 'Session-based (admin secret)',
    
    models: {
      Link: {
        table: 'links',
        fields: {
          id: 'bigint (auto increment)',
          slug: 'string(12) - unique, indexed',
          store_name: 'string(255) - nullable',
          label: 'string(100) - nullable',
          phone_number: 'string(20) - nullable',
          url_gmb: 'string(2048) - nullable',
          is_claimed: 'boolean (default: false)',
          pin: 'string (hashed) - nullable',
          is_suspended: 'boolean (default: false)',
          expired_at: 'datetime - nullable',
          created_at: 'timestamp',
          updated_at: 'timestamp'
        },
        relationships: ['hasMany ScanLog']
      },
      
      ScanLog: {
        table: 'scan_logs',
        fields: {
          id: 'bigint (auto increment)',
          link_id: 'foreignId (links.id)',
          ip_address: 'string(45) - nullable',
          ip_hash: 'string(64) - nullable',
          user_agent: 'string(500) - nullable',
          device_type: 'string - nullable',
          browser: 'string - nullable',
          referrer: 'string - nullable',
          status: 'string (default: valid)',
          created_at: 'timestamp',
          updated_at: 'timestamp'
        },
        relationships: ['belongsTo Link']
      },
      
      User: {
        table: 'users',
        fields: {
          id: 'bigint (auto increment)',
          name: 'string',
          email: 'string - unique',
          password: 'string (hashed)',
          email_verified_at: 'timestamp - nullable',
          remember_token: 'string - nullable',
          created_at: 'timestamp',
          updated_at: 'timestamp'
        }
      }
    },
    
    routes: {
      public: [
        'GET / - Landing page',
        'GET /{slug} - Show activation form or redirect to GMB',
        'POST /{slug} - Process card activation',
        'GET /{slug}/edit - Show PIN verification form',
        'POST /{slug}/edit - Process PIN verification & update URL'
      ],
      admin: [
        'GET /admin/login - Login form',
        'POST /admin/login - Authenticate admin',
        'POST /admin/logout - Logout admin',
        'GET /admin/dashboard - Dashboard with link management',
        'POST /admin/dashboard/update/{id} - Update store name',
        'POST /admin/dashboard/update-gmb/{id} - Update GMB URL',
        'POST /admin/dashboard/suspend/{id} - Toggle suspend status',
        'POST /admin/dashboard/expiry/{id} - Update expiry date',
        'POST /admin/dashboard/generate - Generate new cards',
        'GET /admin/dashboard/qr/{id} - Download QR code',
        'POST /admin/dashboard/update-label/{id} - Update card label',
        'GET /admin/analytics - Analytics dashboard'
      ],
      api: [
        'POST /admin/generate - Mass generation API (with bearer token)'
      ]
    },
    
    features: [
      'NFC/QR card activation system',
      'PIN-based card editing',
      'Admin dashboard with CRUD operations',
      'Scan analytics (device, browser, location)',
      'Duplicate scan detection (10-second window)',
      'Card suspension system',
      'Expiry date management',
      'QR code generation',
      'Mass card generation (up to 500)',
      'Search and filter functionality'
    ]
  },

  // ==========================================================================
  // BAGIAN 2: ARSITEKTUR TARGET - NEXT.JS APP ROUTER + FIREBASE
  // ==========================================================================
  
  targetArchitecture: {
    framework: 'Next.js 14+ (App Router)',
    language: 'TypeScript',
    database: 'Cloud Firestore',
    authentication: 'Firebase Authentication + Custom Claims',
    hosting: 'Firebase Hosting / Vercel',
    caching: 'Firestore offline persistence + SWR',
    
    services: {
      firestore: {
        description: 'NoSQL document database untuk menyimpan links dan scan logs',
        collections: {
          links: {
            documentId: 'auto-generated atau slug',
            fields: {
              slug: 'string (unique)',
              storeName: 'string',
              label: 'string',
              phoneNumber: 'string',
              urlGmb: 'string',
              isClaimed: 'boolean',
              pinHash: 'string (hashed)',
              isSuspended: 'boolean',
              expiredAt: 'timestamp | null',
              createdAt: 'timestamp',
              updatedAt: 'timestamp'
            },
            indexes: [
              'slug (unique)',
              'isClaimed + isSuspended + expiredAt (compound)',
              'storeName (for search)',
              'createdAt (for sorting)'
            ]
          },
          
          scanLogs: {
            documentId: 'auto-generated',
            fields: {
              linkId: 'string (reference to links)',
              linkSlug: 'string (denormalized for queries)',
              ipHash: 'string',
              userAgent: 'string',
              deviceType: 'string',
              browser: 'string',
              referrer: 'string',
              status: 'string (valid | duplicate)',
              createdAt: 'timestamp'
            },
            indexes: [
              'linkId + createdAt (compound)',
              'ipHash + createdAt (for duplicate detection)',
              'status + createdAt (for analytics)',
              'createdAt (for time-based queries)'
            ]
          },
          
          adminUsers: {
            documentId: 'user UID',
            fields: {
              email: 'string',
              role: 'string (admin | superadmin)',
              createdAt: 'timestamp',
              lastLoginAt: 'timestamp'
            }
          }
        }
      },
      
      firebaseAuth: {
        description: 'Authentication untuk admin dashboard',
        providers: ['Email/Password'],
        customClaims: {
          admin: true,
          role: 'admin'
        },
        sessionManagement: 'Firebase Auth tokens dengan refresh'
      },
      
      firebaseStorage: {
        description: 'Penyimpanan file (jika diperlukan)',
        usage: ['QR code images', 'Export files', 'Backup data']
      },
      
      cloudFunctions: {
        description: 'Serverless functions untuk operasi kompleks',
        functions: {
          generateCards: {
            trigger: 'HTTPS callable atau Firestore trigger',
            purpose: 'Generate mass cards dengan validasi'
          },
          processScanLog: {
            trigger: 'Firestore onCreate trigger',
            purpose: 'Process dan enrich scan log data'
          },
          cleanupExpiredCards: {
            trigger: 'Scheduled (daily)',
            purpose: 'Update status expired cards'
          },
          exportAnalytics: {
            trigger: 'HTTPS callable',
            purpose: 'Export analytics data ke CSV/JSON'
          }
        }
      }
    }
  },

  // ==========================================================================
  // BAGIAN 3: STRUKTUR PROYEK NEXT.JS
  // ==========================================================================
  
  projectStructure: {
    description: 'Struktur folder Next.js App Router',
    
    folders: {
      'app/': {
        'layout.tsx': 'Root layout dengan providers',
        'page.tsx': 'Landing page (welcome)',
        'globals.css': 'Global styles',
        
        '(public)/': {
          '[slug]/': {
            'page.tsx': 'Halaman aktivasi kartu (GET /{slug})',
            'edit/': {
              'page.tsx': 'Form verifikasi PIN (GET /{slug}/edit)'
            }
          }
        },
        
        'admin/': {
          'layout.tsx': 'Admin layout dengan auth guard',
          'login/': {
            'page.tsx': 'Halaman login admin'
          },
          'dashboard/': {
            'page.tsx': 'Dashboard utama dengan tabel links',
            'analytics/': {
              'page.tsx': 'Halaman analytics'
            }
          }
        },
        
        'api/': {
          'links/': {
            '[slug]/': {
              'route.ts': 'GET - Get link by slug',
              'activate/': {
                'route.ts': 'POST - Activate card'
              },
              'edit/': {
                'route.ts': 'POST - Verify PIN & update URL'
              }
            }
          },
          'admin/': {
            'generate/': {
              'route.ts': 'POST - Generate new cards'
            },
            'links/': {
              '[id]/': {
                'route.ts': 'PATCH - Update link',
                'suspend/': {
                  'route.ts': 'POST - Toggle suspend'
                },
                'expiry/': {
                  'route.ts': 'POST - Update expiry'
                },
                'label/': {
                  'route.ts': 'POST - Update label'
                }
              }
            },
            'analytics/': {
              'route.ts': 'GET - Get analytics data'
            }
          }
        }
      },
      
      'components/': {
        'ui/': 'Reusable UI components (Button, Input, Card, dll)',
        'forms/': 'Form components (ActivationForm, EditForm, dll)',
        'admin/': 'Admin-specific components (Dashboard, Analytics, dll)',
        'layout/': 'Layout components (Header, Footer, Sidebar)'
      },
      
      'lib/': {
        'firebase/': {
          'config.ts': 'Firebase initialization',
          'auth.ts': 'Authentication helpers',
          'firestore.ts': 'Firestore helpers'
        },
        'utils/': {
          'validation.ts': 'Form validation (zod schemas)',
          'device.ts': 'Device detection utilities',
          'hashing.ts': 'PIN hashing utilities',
          'slug.ts': 'Slug generation utilities'
        },
        'constants/': 'App constants dan configuration'
      },
      
      'hooks/': {
        'useAuth.ts': 'Authentication hook',
        'useLinks.ts': 'Links data fetching hook',
        'useAnalytics.ts': 'Analytics data hook'
      },
      
      'types/': {
        'link.ts': 'Link type definitions',
        'scan-log.ts': 'ScanLog type definitions',
        'api.ts': 'API response types'
      }
    }
  },

  // ==========================================================================
  // BAGIAN 4: MAPPING ROUTES LARAVEL → NEXT.JS
  // ==========================================================================
  
  routeMapping: {
    description: 'Mapping dari Laravel routes ke Next.js App Router',
    
    mappings: [
      {
        laravel: 'GET /',
        nextjs: 'app/page.tsx',
        type: 'Server Component',
        description: 'Landing page - static atau dynamic'
      },
      {
        laravel: 'GET /{slug}',
        nextjs: 'app/(public)/[slug]/page.tsx',
        type: 'Server Component',
        description: 'Halaman aktivasi - fetch link dari Firestore'
      },
      {
        laravel: 'POST /{slug}',
        nextjs: 'app/api/links/[slug]/activate/route.ts',
        type: 'API Route Handler',
        description: 'Proses aktivasi kartu'
      },
      {
        laravel: 'GET /{slug}/edit',
        nextjs: 'app/(public)/[slug]/edit/page.tsx',
        type: 'Server Component',
        description: 'Form verifikasi PIN'
      },
      {
        laravel: 'POST /{slug}/edit',
        nextjs: 'app/api/links/[slug]/edit/route.ts',
        type: 'API Route Handler',
        description: 'Verifikasi PIN & update URL'
      },
      {
        laravel: 'GET /admin/login',
        nextjs: 'app/admin/login/page.tsx',
        type: 'Client Component',
        description: 'Form login admin'
      },
      {
        laravel: 'POST /admin/login',
        nextjs: 'app/api/admin/auth/login/route.ts',
        type: 'API Route Handler',
        description: 'Authenticate admin'
      },
      {
        laravel: 'POST /admin/logout',
        nextjs: 'app/api/admin/auth/logout/route.ts',
        type: 'API Route Handler',
        description: 'Logout admin'
      },
      {
        laravel: 'GET /admin/dashboard',
        nextjs: 'app/admin/dashboard/page.tsx',
        type: 'Server Component + Client',
        description: 'Dashboard dengan tabel links'
      },
      {
        laravel: 'POST /admin/dashboard/generate',
        nextjs: 'app/api/admin/generate/route.ts',
        type: 'API Route Handler',
        description: 'Generate kartu baru'
      },
      {
        laravel: 'POST /admin/dashboard/update/{id}',
        nextjs: 'app/api/admin/links/[id]/route.ts',
        type: 'API Route Handler (PATCH)',
        description: 'Update link (store name, GMB URL)'
      },
      {
        laravel: 'POST /admin/dashboard/suspend/{id}',
        nextjs: 'app/api/admin/links/[id]/suspend/route.ts',
        type: 'API Route Handler',
        description: 'Toggle suspend status'
      },
      {
        laravel: 'POST /admin/dashboard/expiry/{id}',
        nextjs: 'app/api/admin/links/[id]/expiry/route.ts',
        type: 'API Route Handler',
        description: 'Update expiry date'
      },
      {
        laravel: 'POST /admin/dashboard/update-label/{id}',
        nextjs: 'app/api/admin/links/[id]/label/route.ts',
        type: 'API Route Handler',
        description: 'Update label kartu'
      },
      {
        laravel: 'GET /admin/dashboard/qr/{id}',
        nextjs: 'app/api/admin/links/[id]/qr/route.ts',
        type: 'API Route Handler',
        description: 'Generate & download QR code'
      },
      {
        laravel: 'GET /admin/analytics',
        nextjs: 'app/admin/dashboard/analytics/page.tsx',
        type: 'Server Component + Client',
        description: 'Halaman analytics'
      },
      {
        laravel: 'POST /admin/generate (API)',
        nextjs: 'app/api/admin/generate/route.ts',
        type: 'API Route Handler',
        description: 'Mass generation API'
      }
    ]
  },

  // ==========================================================================
  // BAGIAN 5: SKEMA FIRESTORE DETAIL
  // ==========================================================================
  
  firestoreSchema: {
    description: 'Detail skema Firestore collections',
    
    links: {
      collectionName: 'links',
      documentId: 'slug (recommended) atau auto-generated',
      
      fields: {
        slug: {
          type: 'string',
          required: true,
          unique: true,
          description: 'Unique identifier untuk kartu (8 karakter random)'
        },
        storeName: {
          type: 'string',
          required: false,
          maxLength: 255,
          description: 'Nama toko/merchant'
        },
        label: {
          type: 'string',
          required: false,
          maxLength: 100,
          description: 'Label lokasi/penempatan kartu'
        },
        phoneNumber: {
          type: 'string',
          required: false,
          maxLength: 20,
          description: 'Nomor telepon toko'
        },
        urlGmb: {
          type: 'string',
          required: false,
          maxLength: 2048,
          description: 'URL Google Maps'
        },
        isClaimed: {
          type: 'boolean',
          required: true,
          default: false,
          description: 'Status klaim kartu'
        },
        pinHash: {
          type: 'string',
          required: false,
          description: 'Hashed PIN (4-6 digit)'
        },
        isSuspended: {
          type: 'boolean',
          required: true,
          default: false,
          description: 'Status suspend'
        },
        expiredAt: {
          type: 'timestamp',
          required: false,
          description: 'Tanggal kedaluwarsa'
        },
        createdAt: {
          type: 'timestamp',
          required: true,
          description: 'Waktu pembuatan'
        },
        updatedAt: {
          type: 'timestamp',
          required: true,
          description: 'Waktu update terakhir'
        }
      },
      
      securityRules: {
        read: 'public - siapa bisa read untuk aktivasi',
        create: 'admin only - hanya admin bisa buat',
        update: 'admin only - hanya admin bisa update',
        delete: 'admin only - hanya admin bisa delete'
      }
    },
    
    scanLogs: {
      collectionName: 'scanLogs',
      documentId: 'auto-generated',
      
      fields: {
        linkId: {
          type: 'string',
          required: true,
          description: 'Reference ke document ID di links collection'
        },
        linkSlug: {
          type: 'string',
          required: true,
          description: 'Denormalized slug untuk query'
        },
        ipHash: {
          type: 'string',
          required: false,
          description: 'SHA-256 hash dari IP address'
        },
        userAgent: {
          type: 'string',
          required: false,
          maxLength: 500,
          description: 'User agent string'
        },
        deviceType: {
          type: 'string',
          required: false,
          enum: ['desktop', 'mobile', 'tablet'],
          description: 'Tipe device'
        },
        browser: {
          type: 'string',
          required: false,
          description: 'Browser name'
        },
        referrer: {
          type: 'string',
          required: false,
          description: 'Referrer URL'
        },
        status: {
          type: 'string',
          required: true,
          enum: ['valid', 'duplicate'],
          default: 'valid',
          description: 'Status scan'
        },
        createdAt: {
          type: 'timestamp',
          required: true,
          description: 'Waktu scan'
        }
      },
      
      securityRules: {
        read: 'admin only - hanya admin bisa read',
        create: 'public - siapa bisa create (scan logging)',
        update: 'deny - tidak bisa diupdate',
        delete: 'admin only - hanya admin bisa delete'
      }
    }
  },

  // ==========================================================================
  // BAGIAN 6: STRATEGI MIGRASI DATA
  // ==========================================================================
  
  dataMigration: {
    description: 'Strategi migrasi data dari MySQL ke Firestore',
    
    steps: [
      {
        step: 1,
        title: 'Export Data dari MySQL',
        description: 'Export data links dan scan_logs dari MySQL ke JSON/CSV',
        commands: [
          '# Export links table',
          'mysql -u root -p db_kartupintar -e "SELECT * FROM links" > links_export.json',
          '',
          '# Export scan_logs table',
          'mysql -u root -p db_kartupintar -e "SELECT * FROM scan_logs" > scan_logs_export.json'
        ]
      },
      {
        step: 2,
        title: 'Transform Data',
        description: 'Transform data dari format MySQL ke format Firestore',
        transformations: [
          'Ubah snake_case ke camelCase (store_name → storeName)',
          'Ubah datetime string ke Firestore Timestamp',
          'Ubah tinyint(1) ke boolean',
          'Generate document ID dari slug untuk links collection',
          'Tambahkan field linkSlug di scanLogs (denormalized)'
        ]
      },
      {
        step: 3,
        title: 'Import ke Firestore',
        description: 'Import data yang sudah ditransform ke Firestore',
        methods: [
          'Gunakan Firebase Admin SDK untuk bulk import',
          'Atau gunakan Firestore Import/Export feature',
          'Atau gunakan Cloud Function untuk migration'
        ],
        codeExample: `
// scripts/migrate-to-firestore.js
const admin = require('firebase-admin');
const mysql = require('mysql2/promise');
const fs = require('fs');

admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json')
});

const db = admin.firestore();

async function migrateLinks() {
  const linksData = JSON.parse(fs.readFileSync('./links_export.json', 'utf8'));
  
  const batch = db.batch();
  let count = 0;
  
  for (const link of linksData) {
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
      updatedAt: admin.firestore.Timestamp.fromDate(new Date(link.updated_at))
    });
    
    count++;
    
    // Firestore batch limit adalah 500 operations
    if (count % 500 === 0) {
      await batch.commit();
      console.log(\`Migrated \${count} links...\`);
    }
  }
  
  await batch.commit();
  console.log(\`Total \${count} links migrated!\`);
}

migrateLinks().catch(console.error);
        `
      },
      {
        step: 4,
        title: 'Verify Migration',
        description: 'Verifikasi data sudah benar ter-migrasi',
        checks: [
          'Cek jumlah document di Firestore sama dengan MySQL',
          'Cek sample data untuk memastikan format benar',
          'Cek index sudah terbuat dengan benar',
          'Cek security rules sudah aktif'
        ]
      }
    ]
  },

  // ==========================================================================
  // BAGIAN 7: AUTHENTICATION MIGRATION
  // ==========================================================================
  
  authMigration: {
    description: 'Migrasi dari session-based auth ke Firebase Authentication',
    
    currentSystem: {
      type: 'Session-based dengan admin secret',
      flow: [
        'Admin memasukkan secret key',
        'Secret disimpan di session',
        'Middleware cek session untuk proteksi route'
      ]
    },
    
    newSystem: {
      type: 'Firebase Authentication',
      flow: [
        'Admin login dengan email/password',
        'Firebase mengembalikan ID token',
        'Token disimpan di httpOnly cookie',
        'Middleware verifikasi token di server',
        'Custom claims untuk role-based access'
      ],
      
      implementation: `
// lib/firebase/auth.ts
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './config';

export async function loginAdmin(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    
    // Set token di httpOnly cookie
    await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function logoutAdmin() {
  await signOut(auth);
  await fetch('/api/admin/auth/logout', { method: 'POST' });
}

// Middleware untuk proteksi admin routes
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Cek custom claims
    if (!decodedToken.admin) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
      `
    }
  },

  // ==========================================================================
  // BAGIAN 8: LANGKAH-LANGKAH IMPLEMENTASI
  // ==========================================================================
  
  implementationSteps: {
    description: 'Langkah-langkah implementasi migrasi',
    
    phases: [
      {
        phase: 1,
        title: 'Setup Firebase Project',
        tasks: [
          'Buat project baru di Firebase Console',
          'Enable Firestore Database',
          'Enable Authentication (Email/Password)',
          'Buat service account key untuk Admin SDK',
          'Setup Firestore security rules',
          'Setup Firestore indexes'
        ],
        estimatedTime: '2-3 jam'
      },
      {
        phase: 2,
        title: 'Setup Next.js Project',
        tasks: [
          'Create Next.js project dengan TypeScript',
          'Install dependencies (firebase, firebase-admin, zod, dll)',
          'Setup Firebase configuration',
          'Setup environment variables',
          'Setup Tailwind CSS (jika belum ada)',
          'Setup project structure'
        ],
        estimatedTime: '3-4 jam'
      },
      {
        phase: 3,
        title: 'Implementasi Core Features',
        tasks: [
          'Buat Firestore helpers dan utilities',
          'Implementasi slug generation',
          'Implementasi PIN hashing',
          'Implementasi device detection',
          'Buat API routes untuk link engine',
          'Buat halaman aktivasi kartu'
        ],
        estimatedTime: '8-10 jam'
      },
      {
        phase: 4,
        title: 'Implementasi Admin Dashboard',
        tasks: [
          'Setup Firebase Authentication',
          'Buat login/logout functionality',
          'Buat dashboard layout dengan auth guard',
          'Implementasi links table dengan pagination',
          'Implementasi search dan filter',
          'Implementasi CRUD operations',
          'Implementasi QR code generation'
        ],
        estimatedTime: '10-12 jam'
      },
      {
        phase: 5,
        title: 'Implementasi Analytics',
        tasks: [
          'Buat scan logging system',
          'Implementasi duplicate detection',
          'Buat analytics dashboard',
          'Implementasi chart components',
          'Implementasi date filtering',
          'Implementasi export functionality'
        ],
        estimatedTime: '8-10 jam'
      },
      {
        phase: 6,
        title: 'Data Migration',
        tasks: [
          'Export data dari MySQL',
          'Transform data ke format Firestore',
          'Import data ke Firestore',
          'Verify data integrity',
          'Setup backup strategy'
        ],
        estimatedTime: '4-6 jam'
      },
      {
        phase: 7,
        title: 'Testing & Optimization',
        tasks: [
          'Unit testing untuk utilities',
          'Integration testing untuk API',
          'E2E testing untuk critical flows',
          'Performance optimization',
          'Security audit',
          'Load testing'
        ],
        estimatedTime: '6-8 jam'
      },
      {
        phase: 8,
        title: 'Deployment',
        tasks: [
          'Setup CI/CD pipeline',
          'Deploy ke Firebase Hosting / Vercel',
          'Setup custom domain',
          'Setup SSL certificate',
          'Setup monitoring dan logging',
          'Setup error tracking (Sentry)'
        ],
        estimatedTime: '3-4 jam'
      }
    ],
    
    totalEstimatedTime: '44-57 jam (sekitar 1-2 minggu)'
  },

  // ==========================================================================
  // BAGIAN 9: ENVIRONMENT VARIABLES
  // ==========================================================================
  
  environmentVariables: {
    description: 'Environment variables yang diperlukan',
    
    firebase: {
      NEXT_PUBLIC_FIREBASE_API_KEY: 'Firebase API Key',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'Firebase Auth Domain',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'Firebase Project ID',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'Firebase Storage Bucket',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'Firebase Messaging Sender ID',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'Firebase App ID'
    },
    
    admin: {
      FIREBASE_PROJECT_ID: 'Firebase Project ID (untuk Admin SDK)',
      FIREBASE_CLIENT_EMAIL: 'Service Account Client Email',
      FIREBASE_PRIVATE_KEY: 'Service Account Private Key'
    },
    
    app: {
      NEXT_PUBLIC_APP_URL: 'URL aplikasi (https://yourdomain.com)',
      ADMIN_EMAIL: 'Email admin untuk login',
      ADMIN_PASSWORD: 'Password admin (hanya untuk setup awal)'
    }
  },

  // ==========================================================================
  // BAGIAN 10: SECURITY RULES
  // ==========================================================================
  
  firestoreSecurityRules: {
    description: 'Firestore security rules untuk proteksi data',
    
    rules: `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             request.auth.token.admin == true;
    }
    
    // Links collection
    match /links/{slug} {
      // Public read untuk aktivasi kartu
      allow read: if true;
      
      // Only admin can create/update/delete
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Scan Logs collection
    match /scanLogs/{logId} {
      // Public create untuk scan logging
      allow create: if true;
      
      // Only admin can read/update/delete
      allow read: if isAdmin();
      allow update: if false; // Scan logs immutable
      allow delete: if isAdmin();
    }
    
    // Admin Users collection
    match /adminUsers/{userId} {
      // Only admin can read/write
      allow read, write: if isAdmin();
    }
  }
}
    `
  },

  // ==========================================================================
  // BAGIAN 11: DEPENDENCIES
  // ==========================================================================
  
  dependencies: {
    description: 'NPM packages yang diperlukan',
    
    production: {
      'firebase': '^10.0.0', // Firebase Client SDK
      'firebase-admin': '^12.0.0', // Firebase Admin SDK (server-side)
      'next': '^14.0.0', // Next.js
      'react': '^18.0.0', // React
      'react-dom': '^18.0.0', // React DOM
      'zod': '^3.22.0', // Schema validation
      'bcryptjs': '^2.4.3', // PIN hashing
      'qrcode': '^1.5.3', // QR code generation
      'ua-parser-js': '^1.0.36', // User agent parsing
      'date-fns': '^3.0.0', // Date utilities
      'swr': '^2.2.0', // Data fetching
      'recharts': '^2.10.0', // Charts untuk analytics
      'tailwindcss': '^3.4.0', // CSS framework
      'lucide-react': '^0.300.0' // Icons
    },
    
    development: {
      'typescript': '^5.3.0', // TypeScript
      '@types/node': '^20.0.0', // Node types
      '@types/react': '^18.0.0', // React types
      '@types/react-dom': '^18.0.0', // React DOM types
      'eslint': '^8.56.0', // Linter
      'prettier': '^3.2.0', // Code formatter
      'jest': '^29.7.0', // Testing
      '@testing-library/react': '^14.1.0' // React testing
    }
  },

  // ==========================================================================
  // BAGIAN 12: TROUBLESHOOTING & TIPS
  // ==========================================================================
  
  troubleshooting: {
    description: 'Common issues dan solusi',
    
    issues: [
      {
        issue: 'Firestore query tidak return data',
        solution: 'Cek apakah index sudah dibuat. Firestore memerlukan composite index untuk query dengan multiple fields.'
      },
      {
        issue: 'PIN hash tidak match',
        solution: 'Pastikan menggunakan algoritma hashing yang sama. Laravel menggunakan bcrypt, jadi gunakan bcryptjs di Node.js.'
      },
      {
        issue: 'Device detection tidak akurat',
        solution: 'Gunakan library ua-parser-js yang lebih reliable daripada regex manual.'
      },
      {
        issue: 'CORS error saat fetch API',
        solution: 'Pastikan API route handler mengembalikan header CORS yang benar.'
      },
      {
        issue: 'Firebase Auth token expired',
        solution: 'Implementasi token refresh mechanism. Firebase SDK handle ini secara otomatis.'
      },
      {
        issue: 'Batch import gagal di tengah jalan',
        solution: 'Gunakan batch size yang lebih kecil (max 500 operations per batch) dan implementasi retry logic.'
      }
    ],
    
    tips: [
      'Gunakan Firebase Emulator Suite untuk development dan testing',
      'Setup Firestore backup berkala menggunakan Cloud Scheduler',
      'Gunakan SWR untuk caching dan revalidation data',
      'Implementasi rate limiting untuk API routes',
      'Gunakan Next.js Image component untuk optimasi gambar',
      'Setup monitoring dengan Firebase Performance Monitoring',
      'Gunakan environment-specific configurations (dev, staging, prod)'
    ]
  }
};

// ============================================================================
// EXPORT DAN UTILITIES
// ============================================================================

/**
 * Generate migration checklist
 */
function generateChecklist() {
  const checklist = [];
  
  migrationPlan.implementationSteps.phases.forEach(phase => {
    checklist.push(`## Phase ${phase.phase}: ${phase.title}`);
    checklist.push(`Estimated Time: ${phase.estimatedTime}`);
    checklist.push('');
    
    phase.tasks.forEach(task => {
      checklist.push(`- [ ] ${task}`);
    });
    
    checklist.push('');
  });
  
  return checklist.join('\n');
}

/**
 * Generate Firestore setup script
 */
function generateFirestoreSetupScript() {
  return `
// scripts/setup-firestore.js
const admin = require('firebase-admin');
const fs = require('fs');

admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json')
});

const db = admin.firestore();

async function setupFirestore() {
  console.log('Setting up Firestore...');
  
  // Create indexes (harus dilakukan via Firebase Console atau gcloud CLI)
  // Firestore indexes tidak bisa dibuat via Admin SDK
  
  // Setup security rules
  const rules = \`
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
  \`;
  
  console.log('Security rules:');
  console.log(rules);
  console.log('\\nPlease apply these rules in Firebase Console > Firestore > Rules');
  
  // Create admin user
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (adminEmail && adminPassword) {
      const userRecord = await admin.auth().createUser({
        email: adminEmail,
        password: adminPassword,
        emailVerified: true
      });
      
      // Set custom claims
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        admin: true,
        role: 'admin'
      });
      
      console.log(\`Admin user created: \${userRecord.uid}\`);
    }
  } catch (error) {
    console.log('Admin user might already exist or error:', error.message);
  }
  
  console.log('Firestore setup complete!');
}

setupFirestore().catch(console.error);
  `;
}

/**
 * Generate Next.js configuration
 */
function generateNextConfig() {
  return `
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
  `;
}

/**
 * Print migration plan summary
 */
function printSummary() {
  console.log('='.repeat(80));
  console.log('MIGRATION PLAN: LARAVEL > NEXT.JS APP ROUTER + FIREBASE');
  console.log('='.repeat(80));
  console.log('');
  console.log('Current Architecture:');
  console.log('  Framework: ' + migrationPlan.currentArchitecture.framework);
  console.log('  Database: ' + migrationPlan.currentArchitecture.database);
  console.log('  Auth: ' + migrationPlan.currentArchitecture.authSystem);
  console.log('');
  console.log('Target Architecture:');
  console.log('  Framework: ' + migrationPlan.targetArchitecture.framework);
  console.log('  Database: ' + migrationPlan.targetArchitecture.database);
  console.log('  Auth: ' + migrationPlan.targetArchitecture.authentication);
  console.log('');
  console.log('Implementation Phases:');
  migrationPlan.implementationSteps.phases.forEach(phase => {
    console.log('  Phase ' + phase.phase + ': ' + phase.title + ' (' + phase.estimatedTime + ')');
  });
  console.log('');
  console.log('Total Estimated Time: ' + migrationPlan.implementationSteps.totalEstimatedTime);
  console.log('');
  console.log('='.repeat(80));
  console.log('MIGRATION CHECKLIST');
  console.log('='.repeat(80));
  console.log('');
  console.log(generateChecklist());
  console.log('');
  console.log('='.repeat(80));
  console.log('FIRESTORE SETUP SCRIPT');
  console.log('='.repeat(80));
  console.log('');
  console.log(generateFirestoreSetupScript());
  console.log('');
  console.log('='.repeat(80));
  console.log('NEXT.JS CONFIGURATION');
  console.log('='.repeat(80));
  console.log('');
  console.log(generateNextConfig());
  console.log('');
  console.log('='.repeat(80));
  console.log('For detailed information, see the migrationPlan object in this file.');
  console.log('='.repeat(80));
}

// Export untuk digunakan di file lain
export {
  migrationPlan,
  generateChecklist,
  generateFirestoreSetupScript,
  generateNextConfig,
  printSummary
};
