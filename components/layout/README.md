# Layout Components

Folder ini berisi komponen layout seperti Header, Footer, Sidebar, dll.

## Contoh:

- `Header.tsx` - Header/navbar
- `Footer.tsx` - Footer
- `Sidebar.tsx` - Sidebar untuk admin
- `Container.tsx` - Container wrapper

## Template:

```typescript
// components/layout/Header.tsx
export function Header() {
  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        {/* Navigation content */}
      </nav>
    </header>
  );
}

// components/layout/Container.tsx
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`container mx-auto px-4 ${className}`}>
      {children}
    </div>
  );
}
```
