# Feature Components

Folder ini berisi komponen yang spesifik untuk fitur tertentu.

## Struktur:

```
features/
├── auth/              # Komponen auth
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── dashboard/         # Komponen dashboard
│   ├── StatsCard.tsx
│   └── ActivityChart.tsx
└── links/             # Komponen links
    ├── LinkList.tsx
    └── LinkForm.tsx
```

## Tips:

- Setiap fitur punya folder sendiri
- Komponen di dalam folder ini hanya dipakai untuk fitur tersebut
- Kalau komponen dipakai di banyak tempat, pindah ke `components/ui/`
