# Kartu Review Pintar - Next.js + Firebase

Sistem kartu review pintar dengan NFC & QR Code, dimigrasi dari Laravel ke Next.js App Router dengan Firebase sebagai backend.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Cloud Firestore
- **Authentication**: Firebase Authentication
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Deployment**: Firebase Hosting / Vercel

## Fitur

- [x] Aktivasi kartu NFC/QR
- [x] Edit URL Google Maps dengan verifikasi PIN
- [x] Admin dashboard untuk manajemen kartu
- [x] Analytics scan (device, browser, waktu)
- [x] Generate kartu massal (hingga 500)
- [x] QR code generation
- [x] Sistem suspend/aktifkan kartu
- [x] Manajemen masa berlangganan

## Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd kartu-review-pintar
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Firebase

1. Buat project baru di [Firebase Console](https://console.firebase.google.com/)
2. Enable **Firestore Database**
3. Enable **Authentication** (Email/Password)
4. Buat service account key:
   - Project Settings > Service Accounts > Generate New Private Key
   - Simpan sebagai `scripts/serviceAccountKey.json`
5. Setup Firestore Security Rules (lihat di bawah)

### 4. Setup Environment Variables

Copy `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Isi dengan konfigurasi Firebase Anda:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (Server-side only)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Migrasi Data dari MySQL

Jika Anda memiliki data dari sistem Laravel sebelumnya:

1. Pastikan `serviceAccountKey.json` sudah ada di folder `scripts/`
2. Jalankan script migrasi:

```bash
npm run migrate
```

Script ini akan:
- Export data dari MySQL
- Transform ke format Firestore
- Import ke Firestore dengan batch operations

## Firestore Security Rules

```javascript
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
    
    // Links collection
    match /links/{slug} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Scan Logs collection
    match /scanLogs/{logId} {
      allow create: if true;
      allow read, delete: if isAdmin();
      allow update: if false;
    }
    
    // Admin Users collection
    match /adminUsers/{userId} {
      allow read, write: if isAdmin();
    }
  }
}
```

## Struktur Proyek

```
app/
├── (public)/[slug]/          # Halaman aktivasi kartu
│   ├── page.tsx
│   ├── ActivationForm.tsx
│   └── edit/
│       ├── page.tsx
│       └── EditForm.tsx
├── admin/                     # Admin dashboard
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   └── dashboard/
│       ├── page.tsx
│       └── analytics/
│           └── page.tsx
├── api/                       # API routes
│   ├── links/[slug]/
│   │   ├── route.ts
│   │   ├── activate/
│   │   └── edit/
│   ├── admin/
│   │   ├── auth/
│   │   ├── links/
│   │   ├── generate/
│   │   └── analytics/
│   └── scan/
│       └── log/
├── layout.tsx
├── page.tsx
└── globals.css

components/
└── ui/                        # Reusable UI components

hooks/                         # Custom React hooks

lib/
├── firebase/                  # Firebase configuration
├── firestore/                 # Firestore helpers
└── utils/                     # Utility functions

scripts/
└── migrate-to-firestore.js    # Data migration script

types/                         # TypeScript type definitions
```

## API Endpoints

### Public API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/links/{slug}` | Get link by slug |
| POST | `/api/links/{slug}/activate` | Activate card |
| POST | `/api/links/{slug}/edit` | Edit URL (with PIN) |
| POST | `/api/scan/log/{slug}` | Log scan event |

### Admin API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/auth/login` | Admin login |
| POST | `/api/admin/auth/logout` | Admin logout |
| GET | `/api/admin/links` | Get all links (paginated) |
| GET | `/api/admin/links/stats` | Get links statistics |
| PATCH | `/api/admin/links/{id}` | Update link |
| POST | `/api/admin/links/{id}/suspend` | Toggle suspend |
| POST | `/api/admin/links/{id}/expiry` | Update expiry |
| POST | `/api/admin/links/{id}/label` | Update label |
| GET | `/api/admin/links/{id}/qr` | Generate QR code |
| POST | `/api/admin/generate` | Generate new cards |
| GET | `/api/admin/analytics` | Get analytics data |

## Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy
```

### Vercel

1. Push ke GitHub
2. Import project di [Vercel](https://vercel.com/)
3. Setup environment variables
4. Deploy

## License

MIT
