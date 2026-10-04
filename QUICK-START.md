# 🚀 Quick Start Guide - Kartu Review Pintar

## Setup Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📂 Di Mana Letakkan File?

### ✅ Membuat Page Baru
```
app/
└── nama-page/
    ├── page.tsx          # Halaman utama
    ├── loading.tsx       # Loading state (optional)
    └── error.tsx         # Error handler (optional)
```

### ✅ Membuat API Endpoint
```
app/api/
└── nama-endpoint/
    └── route.ts          # GET, POST, PUT, DELETE handlers
```

### ✅ Membuat Component
**UI Component (reusable):**
```
components/ui/
└── Button.tsx
```

**Feature Component (specific):**
```
components/features/
└── auth/
    └── LoginForm.tsx
```

**Layout Component:**
```
components/layout/
└── Header.tsx
```

### ✅ Membuat Custom Hook
```
hooks/
└── useAuth.ts
```

### ✅ Membuat Type Definition
```
types/
└── user.ts
```

### ✅ Membuat Utility Function
```
lib/utils/
└── formatDate.ts
```

### ✅ Membuat Validation Schema
```
schemas/
└── user.ts
```

### ✅ Membuat Constant
```
constants/
└── routes.ts
```

## 🎯 Import Patterns

```typescript
// Components
import { Button } from '@/components/ui/Button';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { Header } from '@/components/layout/Header';

// Hooks
import { useAuth } from '@/hooks/useAuth';

// Types
import type { User } from '@/types/user';

// Utils
import { formatDate } from '@/lib/utils/formatDate';

// Constants
import { ROUTES } from '@/constants/routes';

// Schemas
import { loginSchema } from '@/schemas/auth';
```

## 📝 Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Component | PascalCase | `UserCard.tsx` |
| Hook | camelCase + use prefix | `useAuth.ts` |
| Utility | camelCase | `formatDate.ts` |
| Type | PascalCase | `UserType.ts` |
| Constant | UPPER_SNAKE_CASE | `API_URL` |
| Route folder | kebab-case | `user-profile/` |

## 🔥 Common Tasks

### Membuat Halaman Baru dengan Layout
```typescript
// app/products/layout.tsx
export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="products-layout">
      <aside>Sidebar</aside>
      <main>{children}</main>
    </div>
  );
}

// app/products/page.tsx
export default function ProductsPage() {
  return <div>Products List</div>;
}
```

### Membuat API Route
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const users = await getUsers();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await createUser(body);
  return NextResponse.json(user, { status: 201 });
}
```

### Membuat Protected Route
```typescript
// app/admin/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await getAuth();
  
  if (!user) {
    redirect('/admin/login');
  }

  return <div>Dashboard</div>;
}
```

### Menggunakan Client Component
```typescript
'use client'; // Tambahkan di baris pertama

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## 🎨 Styling dengan Tailwind

```typescript
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
      {children}
    </div>
  );
}
```

## 🔐 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_ADMIN_KEY=your-admin-key
```

**Usage:**
```typescript
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
```

> **Note:** Variables dengan prefix `NEXT_PUBLIC_` bisa diakses di client side.

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
