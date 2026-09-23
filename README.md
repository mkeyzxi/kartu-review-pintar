# 🃏 Kartu Review Pintar — NFC & QR Google Maps Review System

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=flat-square&logo=php&logoColor=white)](https://php.net)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)
[![Deploy on Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)](https://railway.app)

> **Satu sentuhan kartu → pelanggan langsung ke halaman ulasan Google Maps bisnis Anda.**
> Tanpa app, tanpa login, tanpa ribet. Dilengkapi dengan **Sistem Tracking & Analitik** canggih.

---

## 📖 Deskripsi

**Kartu Review Pintar** adalah sistem backend berbasis Laravel yang menghubungkan kartu fisik (NFC / QR Code) ke halaman ulasan Google Maps (Google My Business) milik suatu bisnis.

Setiap kartu memiliki **slug unik** yang di-encode ke dalam chip NFC atau QR Code. Saat pelanggan mengetuk / men-scan kartu, sistem mencatat data analitik di balik layar, lalu mereka langsung diarahkan ke halaman ulasan Google Maps — tanpa perlu mengunduh aplikasi apapun.

Sistem juga dilengkapi dengan **Admin Dashboard** & **Halaman Analytics** yang memungkinkan pemilik bisnis untuk memantau penggunaan kartu, melacak traffic berdasarkan hari/bulan/tahun, mendeteksi scan berulang (duplicate), serta melihat device yang paling sering digunakan pelanggan.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| ⚡ **Instant Redirect** | Scan kartu → sistem mendata log dalam *background* → langsung ke Google Maps |
| 📊 **Advanced Analytics** | Pantau jumlah scan per kartu, filter data per tahun/bulan/hari, dan lihat grafik dinamis (*Chart.js*) |
| 🛡️ **Duplicate Detection** | Fitur anti-spam yang mampu membedakan *scan valid* dan *duplicate scan* (tap berulang kali dalam jeda singkat) |
| 📱 **Device Tracking** | Pencatatan jenis perangkat (Mobile, Desktop, Tablet) dan browser tanpa mengumpulkan data pribadi (*Privacy First*) |
| 🔐 **PIN Terenkripsi** | Setiap kartu dilindungi PIN (4–6 digit) yang di-hash dengan Bcrypt |
| 👤 **Tanpa Akun** | Aktivasi langsung dari kartu, pelanggan tidak perlu mendaftar |
| 🏭 **Mass Generation** | Admin dapat generate puluhan slug kartu sekaligus untuk cetak massal (optimal untuk 50+ kartu) |
| ✏️ **Card Management** | Admin dan pemilik bisnis dapat mengubah link Google Maps, nama toko, hingga memberi *Label* khusus pada kartu (Misal: "Kasir", "Meja 1") |

---

## 🔄 Alur Kerja (User Flow)

### Customer Flow (Saat Scan)
```
Pelanggan tap kartu NFC / scan QR
         │
         ▼
  ┌─────────────┐
  │ GET /{slug} │
  └──────┬──────┘
         │
   Kartu diklaim?
    /          \
  YA           TIDAK
   │             │
   ▼             ▼
 Cek          Tampilkan
 Duplicate    Form Aktivasi
   │             │
   ▼             ▼
 Simpan Log   Pemilik isi:
 (device,     - Nama Toko & Telepon
  ip_hash)    - Link Google Maps
   │          - PIN Rahasia
   ▼             │
Redirect         ▼
ke GMB       Kartu Aktif ✓
```

---

## 🗂️ Struktur Project Utama

```
sistem-review-google-maps/
├── app/
│   ├── Http/Controllers/
│   │   ├── AdminDashboardController.php # Dashboard UI, Analytics, Label
│   │   ├── AdminController.php          # API / Endpoint untuk Mass generate
│   │   └── LinkEngineController.php     # Aktivasi, redirect, tracking logic
│   └── Models/
│       ├── Link.php                     # Model kartu (slug, gmb_url, pin, label)
│       └── ScanLog.php                  # Model log (ip_hash, device, browser, status)
├── database/migrations/                 # Skema tabel
├── resources/views/
│   ├── admin/
│   │   ├── dashboard.blade.php          # Admin panel & Card management
│   │   └── analytics.blade.php          # Grafik dan filter analitik
│   ├── welcome.blade.php                # Landing page
│   ├── activate.blade.php               # Form aktivasi kartu (untuk user)
│   └── ...                              # View lainnya
└── routes/web.php                       # Definisi route
```

---

## 🗄️ Skema Database (MySQL)

Sistem ini dioptimalkan menggunakan database **MySQL**.

### Tabel `links` (Kartu)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint (PK) | Auto increment |
| `slug` | varchar(12) | Slug unik kartu (terindex) |
| `store_name` | varchar | Nama bisnis |
| `label` | varchar | Penanda lokasi kartu (Misal: Kasir) |
| `phone_number` | varchar | Kontak bisnis |
| `url_gmb` | varchar | URL Google Maps tujuan |
| `is_claimed` | boolean | Status aktivasi kartu |
| `pin` | varchar | PIN terenkripsi Bcrypt |
| `is_suspended` | boolean | Status blokir kartu |
| `expired_at` | timestamp | Masa tenggang berlangganan |

### Tabel `scan_logs` (Data Tracking)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint (PK) | Auto increment |
| `link_id` | bigint (FK) | Relasi ke tabel `links` |
| `ip_address` | varchar | (Telah dinonaktifkan demi privasi) |
| `ip_hash` | varchar | IP address yang telah di-hash |
| `user_agent` | varchar | User-Agent mentah |
| `device_type` | varchar | Tipe device (mobile/tablet/desktop) |
| `browser` | varchar | Nama browser yang digunakan |
| `referrer` | varchar | URL sumber (jika ada) |
| `status` | varchar | `valid` atau `duplicate` |
| `created_at` | timestamp | Waktu scan |

---

## 🛣️ Daftar Route

### Route Customer / Publik
| Method | URI | Controller | Keterangan |
|---|---|---|---|
| `GET` | `/{slug}` | `LinkEngineController@show` | Redirect Tracking / Form aktivasi |
| `POST` | `/{slug}` | `LinkEngineController@activate` | Proses aktivasi kartu pertama kali |
| `GET` | `/{slug}/edit` | `LinkEngineController@editVerify` | Form verifikasi PIN |
| `POST` | `/{slug}/edit` | `LinkEngineController@editUpdate` | Verifikasi PIN & update URL |

### Route Admin Dashboard
| Method | URI | Controller | Keterangan |
|---|---|---|---|
| `GET` | `/admin/login` | `AdminDashboardController@login` | Form login dashboard |
| `GET` | `/admin/dashboard` | `AdminDashboardController@index` | Manajemen semua kartu |
| `GET` | `/admin/analytics` | `AdminDashboardController@analytics` | Dashboard grafik & filter waktu |
| `POST` | `/admin/dashboard/generate` | `AdminDashboardController@generate` | Generate kartu langsung dari UI |
| `POST` | `/admin/dashboard/update-label/{id}`| `AdminDashboardController@updateLabel` | Update label/lokasi kartu |
| `GET` | `/admin/dashboard/qr/{id}` | `AdminDashboardController@downloadQr` | Download QR code kartu format PNG |

---

## ⚙️ Instalasi & Menjalankan Lokal

### Prasyarat
- PHP >= 8.2
- Composer
- Node.js & NPM
- MySQL Server 8.0+ / MariaDB

### Langkah Instalasi

```bash
# 1. Clone repository
git clone <url-repo>
cd "kartu-review-pintar"

# 2. Install dependencies PHP
composer install

# 3. Salin file environment
cp .env.example .env

# 4. Generate application key
php artisan key:generate

# 5. Konfigurasi MySQL
# Buat database bernama `kartu_review` di server MySQL Anda, lalu sesuaikan file .env:
# DB_CONNECTION=mysql
# DB_DATABASE=kartu_review
# DB_USERNAME=root
# DB_PASSWORD=

# 6. Jalankan migrasi database
php artisan migrate

# 7. Install dependencies Node.js
npm install

# 8. Jalankan development server (jika menggunakan Pail & Vite)
composer dev

# Atau jalankan standar:
php artisan serve
```

---

## 🔧 Konfigurasi Environment (`.env`)

| Variabel | Default | Keterangan |
|---|---|---|
| `APP_ADMIN_SECRET` | — | **Password/Secret key untuk login Admin Dashboard** |
| `DB_CONNECTION` | `mysql` | Driver database |

> **⚠️ Penting:** Variabel `APP_ADMIN_SECRET` harus diisi dengan string acak yang kuat (karena ini akan menjadi password login Admin).

---

## 🚀 Deployment (VPS / Shared Hosting / Railway)

Aplikasi ini ringan dan dioptimalkan dengan Laravel 11. Anda dapat men-deploy ke cPanel (Shared Hosting), VPS (Nginx), atau Railway.

### Deployment Railway
1. Push repository ke GitHub
2. Buat project baru di [Railway](https://railway.app) → Tambahkan **MySQL Database**
3. Deploy dari GitHub repo Anda
4. Tambahkan environment variables:
   - `APP_KEY`
   - `APP_URL`
   - `APP_ENV=production`
   - `APP_ADMIN_SECRET=PASSWORD_RAHASIA_ANDA`
   - Konfigurasi `DB_*` menggunakan variabel koneksi dari MySQL add-on Railway.

---

## 🛡️ Privasi & Keamanan (Privacy-First Tracking)

- Sistem **TIDAK** menyimpan alamat IP pelanggan secara telanjang di database. IP di-hash menjadi `ip_hash` (`sha256`) sesaat sebelum masuk ke database untuk menjamin anonimitas, namun tetap mampu mendeteksi aktivitas berulang (*duplicate/spam scan*).
- Kami menggunakan plugin `jenssegers/agent` yang hanya membaca headers HTTP, bukan data GPS, email, atau personal identity.

---

<div align="center">
  <p>© 2026 Kartu Review Pintar NFC & QR · Powered by Laravel</p>
</div>
