# 🃏 Kartu Review Pintar — NFC & QR Google Maps Review System

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=flat-square&logo=php&logoColor=white)](https://php.net)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)
[![Deploy on Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)](https://railway.app)

> **Satu sentuhan kartu → pelanggan langsung ke halaman ulasan Google Maps bisnis Anda.**
> Tanpa app, tanpa login, tanpa ribet. Dirancang khusus untuk efisiensi tinggi (skala 50 kartu).

---

## 📖 Deskripsi

**Kartu Review Pintar** adalah sistem backend berbasis Laravel yang menghubungkan kartu fisik (NFC / QR Code) ke halaman ulasan Google Maps (Google My Business) milik suatu bisnis.

Setiap kartu memiliki **slug unik** yang di-encode ke dalam chip NFC atau QR Code. Saat pelanggan mengetuk / men-scan kartu, mereka langsung diarahkan ke halaman ulasan Google Maps — tanpa perlu mengunduh aplikasi apapun.

Pemilik bisnis cukup **mengaktifkan** kartunya sekali dengan memasukkan link Google Maps dan membuat PIN rahasia. Setelahnya, setiap scan akan langsung redirect ke halaman ulasan tersebut.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| ⚡ **Instant Redirect** | Scan kartu → langsung diarahkan ke Google Maps tanpa friction |
| 🔐 **PIN Terenkripsi** | Setiap kartu dilindungi PIN (4–6 digit) yang di-hash dengan Bcrypt |
| 👤 **Tanpa Akun** | Aktivasi langsung dari kartu, tidak perlu mendaftar |
| 📋 **Scan Logging** | Setiap scan tercatat (IP address + User-Agent) untuk analitik |
| 🏭 **Mass Generation** | Admin dapat generate puluhan slug kartu sekaligus untuk cetak massal (optimal untuk 50 kartu) |
| ✏️ **Editable Link** | Pemilik bisnis dapat mengubah link Google Maps kapan saja via PIN |

---

## 🔄 Alur Kerja (User Flow)

```
Pelanggan scan kartu NFC / QR
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
Catat        Tampilkan
ScanLog      Form Aktivasi
   │             │
   ▼             ▼
Redirect     Pemilik isi:
ke GMB       - Nama Toko
             - Nomor Telepon
             - Link Google Maps
             - PIN 4–6 digit
                  │
                  ▼
             Kartu Aktif ✓
```

### Edit Link (oleh Pemilik Bisnis)
```
GET  /{slug}/edit  → Form verifikasi PIN
POST /{slug}/edit  → (Step 1) Verifikasi PIN → Form edit URL
POST /{slug}/edit  → (Step 2) Submit URL baru + re-verifikasi PIN → Simpan
```

---

## 🗂️ Struktur Project

```
sistem-review-google-maps/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── AdminController.php        # Mass generate slug kartu
│   │       └── LinkEngineController.php   # Aktivasi, redirect, edit kartu
│   └── Models/
│       ├── Link.php                       # Model kartu (slug, url_gmb, pin, is_claimed)
│       └── ScanLog.php                    # Model log scan (ip, user_agent)
├── database/
│   └── migrations/
│       ├── ..._create_links_table.php     # Tabel kartu
│       └── ..._create_scan_logs_table.php # Tabel log scan
├── resources/
│   └── views/
│       ├── welcome.blade.php              # Landing page
│       ├── activate.blade.php             # Form aktivasi kartu
│       ├── edit-verify.blade.php          # Form verifikasi PIN untuk edit
│       ├── edit-form.blade.php            # Form ganti URL Google Maps
│       └── success.blade.php             # Halaman sukses aktivasi
├── routes/
│   └── web.php                            # Definisi semua route
├── nixpacks.toml                          # Konfigurasi build untuk Railway
└── railway.toml                           # Konfigurasi deploy Railway
```

---

## 🗄️ Skema Database (MySQL)

Sistem ini dioptimalkan menggunakan database **MySQL**. Karena volume data untuk 50 kartu sangat kecil, penggunaan penyimpanan database juga sangat minim.

### Tabel `links`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint (PK) | Auto increment |
| `slug` | varchar(12) | Slug unik kartu (terindex) |
| `url_gmb` | varchar | URL Google Maps tujuan (nullable) |
| `is_claimed` | boolean | Status aktivasi kartu (default: false) |
| `pin` | varchar | PIN terenkripsi Bcrypt (nullable) |
| `created_at` | timestamp | Waktu dibuat |
| `updated_at` | timestamp | Waktu diperbarui |

### Tabel `scan_logs`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint (PK) | Auto increment |
| `link_id` | bigint (FK) | Relasi ke tabel `links` (cascade delete) |
| `ip_address` | varchar(45) | IP address scanner |
| `user_agent` | varchar(500) | User-Agent browser/device scanner |
| `created_at` | timestamp | Waktu scan |

---

## 🛣️ Daftar Route

| Method | URI | Controller@Method | Nama Route | Keterangan |
|---|---|---|---|---|
| `GET` | `/` | Closure | — | Landing page |
| `GET` | `/admin/generate` | `AdminController@generate` | `admin.generate` | Generate slug massal |
| `GET` | `/{slug}` | `LinkEngineController@show` | `link.show` | Redirect / form aktivasi |
| `POST` | `/{slug}` | `LinkEngineController@activate` | `link.activate` | Proses aktivasi kartu |
| `GET` | `/{slug}/edit` | `LinkEngineController@editVerify` | `link.edit.verify` | Form verifikasi PIN |
| `POST` | `/{slug}/edit` | `LinkEngineController@editUpdate` | `link.edit.update` | Verifikasi PIN & update URL |

> Semua route `/{slug}` dibatasi hanya menerima karakter alphanumerik (`[a-zA-Z0-9]+`).

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
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=kartu_review
# DB_USERNAME=root
# DB_PASSWORD=

# 6. Jalankan migrasi database
php artisan migrate

# 7. Install dependencies Node.js
npm install

# 8. Jalankan development server
composer dev
```

> Perintah `composer dev` akan menjalankan Laravel server, queue worker, log watcher (Pail), dan Vite dev server secara bersamaan.

### One-Command Setup (Opsional)
```bash
composer setup
```
Perintah ini otomatis menjalankan setup awal, pastikan kredensial MySQL di `.env` sudah dikonfigurasi dengan benar sebelum memanggil command ini agar migrasi database berhasil berjalan.

---

## 🔧 Konfigurasi Environment (`.env`)

| Variabel | Default | Keterangan |
|---|---|---|
| `APP_NAME` | `Laravel` | Nama aplikasi |
| `APP_ENV` | `local` | Environment (`local` / `production`) |
| `APP_KEY` | — | Application key (wajib di-generate) |
| `APP_URL` | `http://localhost` | URL dasar aplikasi |
| `APP_ADMIN_SECRET` | — | **Secret key untuk akses `/admin/generate`** |
| `DB_CONNECTION` | `mysql` | Driver database |
| `SESSION_DRIVER` | `database` | Driver session |
| `QUEUE_CONNECTION` | `database` | Driver queue |

> **⚠️ Penting:** Variabel `APP_ADMIN_SECRET` harus diisi dengan string acak yang kuat sebelum deploy ke production.

---

## 🏭 Admin: Generate Kartu Massal

Endpoint admin digunakan untuk meng-generate slug kartu dalam jumlah besar (sangat pas untuk batch skala kecil seperti 50 kartu).

**Endpoint:**
```
GET /admin/generate?secret=<SECRET>&count=<JUMLAH>
```

**Parameter:**

| Parameter | Tipe | Wajib | Default | Batas |
|---|---|---|---|---|
| `secret` | string | ✅ | — | Harus cocok dengan `APP_ADMIN_SECRET` |
| `count` | integer | ❌ | `50` | Maks. `500` per request |

**Contoh Response:**
```json
{
  "status": "success",
  "generated": 50,
  "slugs": ["abc123xy", "def456gh", "..."],
  "links": [
    "https://yourdomain.com/abc123xy",
    "https://yourdomain.com/def456gh"
  ],
  "message": "50 kartu baru berhasil di-generate. Siap cetak!"
}
```

Slug yang dihasilkan adalah string acak **8 karakter** (huruf kecil + angka). Daftar link yang dikembalikan siap di-encode ke chip NFC atau dicetak sebagai QR Code.

---

## 🚀 Deployment (VPS / Shared Hosting / Railway)

Aplikasi ini sangat ringan dan fleksibel. Anda dapat mendeploynya ke Shared Hosting standar (cPanel), VPS, maupun PaaS seperti Railway.

### Deployment VPS / Shared Hosting
Jika Anda menggunakan VPS (seperti DigitalOcean) atau Shared Hosting, silakan merujuk pada dokumen panduan lengkap terkait analisis kebutuhannya:
**[Analisis Kebutuhan Server & Resource](./analisis-project.md)**

### Deployment Railway

Project ini juga sudah dikonfigurasi untuk deploy instan ke [Railway](https://railway.app).
Pastikan menambahkan add-on **MySQL** pada project Railway Anda.

1. Push repository ke GitHub
2. Buat project baru di Railway → Tambahkan layanan **MySQL Database**
3. Deploy dari GitHub repo Anda
4. Set environment variables di Railway dashboard:
   - `APP_KEY` (jalankan `php artisan key:generate --show`)
   - `APP_URL`
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_ADMIN_SECRET=<secret-key-yang-kuat>`
   - Konfigurasi `DB_*` menggunakan variabel koneksi dari MySQL add-on Railway.

---

## 🛡️ Keamanan

- **PIN Terenkripsi:** PIN yang dimasukkan pengguna di-hash menggunakan `Hash::make()` (Bcrypt) sebelum disimpan ke database. Verifikasi menggunakan `Hash::check()`.
- **Admin Secret:** Endpoint `/admin/generate` dilindungi oleh secret key yang dikonfigurasi melalui environment variable `APP_ADMIN_SECRET`.
- **Validasi Input:** Semua input divalidasi di controller sebelum diproses (URL format, panjang PIN, dll).
- **Slug Constraint:** Route slug dibatasi hanya karakter alphanumerik untuk mencegah path traversal.

---

## 🧰 Tech Stack

| Komponen | Teknologi |
|---|---|
| Backend Framework | [Laravel 12](https://laravel.com) |
| Bahasa | PHP 8.2+ |
| Database | **MySQL 8.0+** / MariaDB |
| Frontend Styling | Tailwind CSS (via CDN) |
| Font | Inter (Google Fonts) |
| Build Tool | Vite |
| Testing | PHPUnit |

---

## 🧪 Menjalankan Test

```bash
composer test
```

---

## 📄 Lisensi

Project ini dilisensikan di bawah [MIT License](LICENSE).

---

<div align="center">
  <p>© 2026 Kartu Review Pintar NFC & QR · Powered by Laravel</p>
</div>
