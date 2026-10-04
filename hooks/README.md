# Custom Hooks

Folder ini berisi custom React hooks yang bisa digunakan di seluruh aplikasi.

## Contoh:

- `useAuth.ts` - Hook untuk authentication
- `useFirestore.ts` - Hook untuk Firestore operations
- `useLocalStorage.ts` - Hook untuk local storage
- `useDebounce.ts` - Hook untuk debouncing

## Template Hook:

```typescript
import { useState, useEffect } from 'react';

export function useCustomHook() {
  const [state, setState] = useState();

  useEffect(() => {
    // Logic here
  }, []);

  return { state };
}
```
