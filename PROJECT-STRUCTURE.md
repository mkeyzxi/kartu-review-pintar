# Struktur Project Next.js - Kartu Review Pintar

## 📁 Struktur Folder Utama

```
kartu-review-pintar/
├── app/                      # Next.js App Router (routing & pages)
│   ├── (public)/            # Public routes (tanpa auth)
│   │   └── [slug]/          # Dynamic route untuk public links
│   ├── admin/               # Admin dashboard routes
│   │   ├── analytics/       # Halaman analytics
│   │   ├── dashboard/       # Halaman dashboard utama
│   │   ├── login/           # Halaman login admin
│   │   └── layout.tsx       # Layout khusus admin
│   ├── api/                 # API routes (backend endpoints)
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   ├── error.tsx            # Error page
│   ├── loading.tsx          # Loading state
│   ├── not-found.tsx        # 404 page
│   └── globals.css          # Global styles
│
├── components/              # React components
│   ├── ui/                  # UI components (buttons, cards, etc)
│   └── index.ts             # Component exports
│
├── lib/                     # Library & utilities
│   ├── auth/                # Authentication logic
│   ├── firebase/            # Firebase configuration
│   ├── firestore/           # Firestore database operations
│   └── utils/               # Utility functions
│
├── types/                   # TypeScript type definitions
│   ├── api.ts               # API types
│   ├── link.ts              # Link types
│   └── scan-log.ts          # Scan log types
│
├── public/                  # Static assets
│   ├── images/              # Image files
│   ├── icons/               # Icon files
│   └── fonts/               # Font files (optional)
│
├── scripts/                 # Utility scripts
│   └── migrate-to-firestore.js
│
├── hooks/                   # Custom React hooks (recommended)
├── constants/               # Constants & config (recommended)
└── config files             # Configuration files
```

## 🎯 Konvensi Penamaan

### Files
- **Components**: PascalCase (e.g., `UserCard.tsx`, `LoginForm.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `validateEmail.ts`)
- **Types**: PascalCase with descriptive names (e.g., `UserType.ts`, `ApiResponse.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`, `useFirestore.ts`)

### Folders
- **Route folders**: lowercase with hyphens (e.g., `user-profile/`, `scan-history/`)
- **Component folders**: PascalCase (e.g., `UserCard/`, `LoginForm/`)
- **Utility folders**: lowercase (e.g., `auth/`, `utils/`)

## 📋 Best Practices

### 1. App Router Structure
```
app/
├── (public)/              # Route group tanpa auth
├── (auth)/                # Route group dengan auth (optional)
├── admin/                 # Admin section
└── api/                   # API endpoints
```

### 2. Component Organization
```
components/
├── ui/                    # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
├── features/              # Feature-specific components (recommended)
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── dashboard/
│       ├── StatsCard.tsx
│       └── ActivityChart.tsx
└── layout/                # Layout components (recommended)
    ├── Header.tsx
    ├── Footer.tsx
    └── Sidebar.tsx
```

### 3. Library Organization
```
lib/
├── auth/
│   ├── index.ts           # Main auth functions
│   └── middleware.ts      # Auth middleware
├── firebase/
│   ├── config.ts          # Firebase config
│   ├── admin.ts           # Firebase Admin SDK
│   └── client.ts          # Firebase Client SDK
├── firestore/
│   ├── users.ts           # User operations
│   ├── links.ts           # Link operations
│   └── scan-logs.ts       # Scan log operations
└── utils/
    ├── date.ts            # Date utilities
    ├── validation.ts      # Validation functions
    └── format.ts          # Format functions
```

### 4. Type Definitions
```
types/
├── models/                # Data models (recommended)
│   ├── User.ts
│   ├── Link.ts
│   └── ScanLog.ts
├── api.ts                 # API request/response types
└── common.ts              # Common types (recommended)
```

## 🚀 Rekomendasi Tambahan

### Buat Folder Baru (Optional tapi Recommended):

1. **`hooks/`** - Custom React hooks
   ```typescript
   // hooks/useAuth.ts
   // hooks/useFirestore.ts
   // hooks/useLocalStorage.ts
   ```

2. **`constants/`** - Constants dan konfigurasi
   ```typescript
   // constants/routes.ts
   // constants/config.ts
   // constants/messages.ts
   ```

3. **`middleware/`** - Next.js middleware (sudah ada middleware.ts di root)

4. **`schemas/`** - Zod validation schemas
   ```typescript
   // schemas/user.ts
   // schemas/link.ts
   ```

## 📦 Import Path Aliases

Gunakan path aliases di `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/constants/*": ["./constants/*"]
    }
  }
}
```

## 🔥 Stack Teknologi

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore)
- **Auth**: Firebase Auth
- **UI Components**: Lucide React (icons)
- **Charts**: Chart.js, Recharts
- **Data Fetching**: SWR

## 📝 Catatan

- Route groups `(public)` dan `(auth)` tidak mempengaruhi URL
- File `layout.tsx` di setiap folder membuat layout khusus untuk route tersebut
- File `loading.tsx` otomatis menangani loading state
- File `error.tsx` otomatis menangani error boundary
- API routes di `app/api/` otomatis menjadi endpoints
