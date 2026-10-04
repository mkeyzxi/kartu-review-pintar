# Constants

Folder ini berisi konstanta dan konfigurasi aplikasi.

## Contoh:

- `routes.ts` - Route paths
- `config.ts` - App configuration
- `messages.ts` - Error/success messages
- `api.ts` - API endpoints

## Template:

```typescript
// constants/routes.ts
export const ROUTES = {
  HOME: '/',
  ADMIN: '/admin',
  LOGIN: '/admin/login',
  DASHBOARD: '/admin/dashboard',
} as const;

// constants/messages.ts
export const MESSAGES = {
  ERROR: {
    GENERIC: 'Terjadi kesalahan',
    AUTH: 'Gagal autentikasi',
  },
  SUCCESS: {
    SAVED: 'Data berhasil disimpan',
  },
} as const;
```
