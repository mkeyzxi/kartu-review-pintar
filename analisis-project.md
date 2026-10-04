# Analisis Kebutuhan Server & Resource - Kartu Review Pintar (Skala 50 Kartu dengan MySQL)

Aplikasi "Kartu Review Pintar" adalah sebuah sistem berbasis web yang dibangun menggunakan **Laravel**. Mengingat target penggunaan saat ini adalah untuk **50 kartu** dan menggunakan database **MySQL**, aplikasi ini tergolong **sangat ringan (ultra-lightweight)** karena:
1. Skala data sangat kecil (hanya 50 record kartu beserta operasi CRUD sederhana untuk pengaturan URL).
2. Tidak melakukan komputasi gambar atau video di sisi server.
3. Menggunakan TailwindCSS berbasis CDN, sehingga tidak memerlukan proses *build asset* Node.js yang berat di server produksi.
4. Fungsi utamanya adalah *Redirection* (Mengarahkan URL dari scan NFC/QR ke Google Maps), yang mana eksekusinya memakan waktu dalam hitungan milidetik.

Berikut adalah hasil analisis spesifikasi VPS/Hosting, RAM, dan Storage yang dibutuhkan untuk menjalankan aplikasi ini secara optimal.

---

## 1. Spesifikasi Minimum (Sangat Direkomendasikan untuk 50 Kartu)
Spesifikasi ini sangat cocok untuk skala 50 kartu. Anda bahkan bisa menggunakan **Shared Hosting** standar yang mendukung Laravel dan MySQL. Namun jika menggunakan VPS, berikut spesifikasi terendah yang sudah sangat mencukupi:

*   **CPU / vCore**: 1 vCPU
*   **RAM**: 1 GB
*   **Storage (Disk)**: 10 GB - 15 GB SSD / NVMe
*   **Sistem Operasi**: Ubuntu 22.04 LTS / 24.04 LTS (Jika menggunakan VPS)
*   **Web Server**: Nginx + PHP-FPM / Litespeed (PHP 8.2 atau lebih baru)
*   **Database**: **MySQL 8.0** / MariaDB (Sesuai kebutuhan)
*   **Estimasi Biaya**: 
    *   **Shared Hosting**: ~$1 - $3 / bulan (Sangat direkomendasikan dan memadai untuk 50 kartu).
    *   **VPS**: ~$4 - $5 / bulan (Tersedia di DigitalOcean, Linode, Vultr, Hetzner, Hostinger, dll).

*Catatan untuk RAM 1GB (Jika pakai VPS):* MySQL 8.0 biasanya memakan memori sekitar 400MB RAM. Sangat disarankan untuk mengaktifkan **Swap Memory (sebesar 1GB-2GB)** di OS Linux Anda agar VPS tidak *crash* akibat kehabisan memori.

---

## 2. Rincian Konsumsi Storage (Penyimpanan)
Untuk skala 50 kartu, aplikasi ini sangat amat hemat penyimpanan. Berikut rincian kasarnya jika di-deploy di VPS:

1.  **Sistem Operasi (Ubuntu)**: ~3 GB - 4 GB
2.  **Web Server & Database (Nginx, PHP, MySQL)**: ~1 GB - 1.5 GB
3.  **Source Code Laravel & Vendor (Dependencies)**: ~100 MB - 150 MB
4.  **Database Data (MySQL)**: 50 data kartu (URL, PIN, Nama Toko) di tabel MySQL hanya akan memakan ruang **beberapa Kilobytes (KB)** saja. Sangat kecil!
5.  **Log File (Laravel & Nginx)**: ~100 MB (Tergantung intensitas scan, namun untuk 50 kartu akan sangat lambat bertambahnya).

**Total Storage Terpakai saat fresh deploy (VPS):** Sekitar **5 GB - 6 GB**.
Jika Anda memilih menggunakan **Shared Hosting**, storage yang terpakai murni hanya untuk *Source Code Laravel* dan *Database*, yaitu totalnya tidak akan sampai **200 MB**.

---

## 3. Tips Optimalisasi & Deploy (MySQL & 50 Kartu)
Meskipun skalanya kecil (50 kartu), menerapkan *best practice* Laravel tetap disarankan agar respons *redirect* saat kartu di-scan terasa instan:

1.  **Gunakan Laravel Caching**: Jalankan perintah ini di server saat deploy:
    *   `php artisan config:cache`
    *   `php artisan route:cache`
    *   `php artisan view:cache`
2.  **Matikan APP_DEBUG**: Pastikan file `.env` di produksi disetting `APP_DEBUG=false` agar tidak memakan memori untuk mencatat log error dan demi keamanan.
3.  **Koneksi Database Persistent**: Karena secara spesifik menggunakan MySQL, pastikan koneksi database di `.env` sudah benar terkonfigurasi (`DB_CONNECTION=mysql`).
4.  **Pilih Nginx / Litespeed**: Jika Anda menggunakan VPS, Nginx sangat dianjurkan. Jika menggunakan Shared Hosting, biasanya sudah menggunakan Litespeed yang juga sangat kencang.

## Kesimpulan
Untuk target **50 kartu menggunakan database MySQL**, Anda **tidak perlu menyewa VPS yang mahal**. Bahkan layanan **Shared Hosting murah (paket basic/entry-level)** yang menyediakan database MySQL dan support instalasi Laravel sudah lebih dari cukup. 

Jika Anda tetap menginginkan kontrol penuh, sebuah VPS dengan spesifikasi paling rendah (1 vCPU, 1 GB RAM, 10 GB SSD) di kisaran harga $4-$5/bulan adalah opsi yang sangat solid dan bahkan sudah *overkill* (sangat berlebih) untuk melayani 50 kartu NFC.
