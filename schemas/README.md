# Validation Schemas

Folder ini berisi Zod validation schemas untuk validasi data.

## Contoh:

- `user.ts` - User validation schema
- `link.ts` - Link validation schema
- `auth.ts` - Authentication validation schema

## Template:

```typescript
import { z } from 'zod';

// Schema untuk login
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Schema untuk membuat user
export const createUserSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```
