PRD — Kartu Review Pintar: Scan Tracking & Analytics

1. Informasi Produk

Nama Produk: Kartu Review Pintar
Fitur: Scan Tracking & Analytics
Platform: Web Dashboard + NFC/QR Card
Target: UMKM, F&B, barbershop, salon, bengkel, penginapan, dan bisnis lokal lainnya.

Tujuan

Menambahkan kemampuan untuk:

mencatat setiap penggunaan kartu NFC/QR;
mengetahui jumlah penggunaan kartu;
mengetahui kartu mana yang paling sering digunakan;
melihat statistik penggunaan berdasarkan waktu;
membedakan penggunaan berdasarkan kartu;
memberikan data sederhana kepada pemilik bisnis tanpa mengklaim bahwa setiap scan merupakan satu orang atau satu review. 2. Masalah yang Ingin Diselesaikan

Pada versi awal:

NFC / QR
↓
Google Maps
↓
Review

Pemilik bisnis tidak mengetahui apakah kartunya benar-benar digunakan.

Mereka hanya mengetahui bahwa kartu tersedia, tetapi tidak memiliki data seperti:

Berapa kali kartu digunakan?

Kapan paling banyak digunakan?

Kartu mana yang paling sering digunakan?

Apakah kartu di kasir lebih sering digunakan dibanding kartu di meja?

Solusi

Menggunakan URL perantara milik Kartu Review Pintar.

NFC / QR
↓
Kartu Review Pintar
↓
Catat penggunaan
↓
Redirect
↓
Google Maps 3. Konsep Utama

Setiap kartu mempunyai URL unik.

Contoh:

https://kartureviewpintar.com/r/KRP001

Ketika pelanggan melakukan:

Tap NFC atau Scan QR

request akan masuk terlebih dahulu ke server Kartu Review Pintar.

Server kemudian:

mencari kartu;
memeriksa apakah kartu aktif;
mencatat penggunaan;
menentukan tujuan Google Maps;
melakukan redirect.

Sehingga pelanggan tetap mendapatkan pengalaman:

Tap → Google Maps

tanpa perlu mengetahui proses tracking di belakangnya.

4. User Role
   Business Owner

Pemilik bisnis dapat:

melihat total scan;
melihat statistik scan;
melihat penggunaan berdasarkan kartu;
melihat penggunaan berdasarkan periode;
melihat detail aktivitas;
mengelola kartu;
mengubah link Google Maps.
Customer

Pelanggan hanya perlu:

tap NFC; atau
scan QR.

Tidak perlu:

membuat akun;
login;
menginstal aplikasi. 5. User Flow
Customer Flow
Pelanggan melihat kartu
↓
Tap NFC / Scan QR
↓
Request ke server
↓
Identifikasi Card ID
↓
Catat Scan
↓
Redirect
↓
Google Maps
↓
Pelanggan memberikan review 6. Redirect Tracking

Setiap kartu mempunyai URL unik.

Contoh:

/r/KRP001

Laravel menerima request:

GET /r/KRP001

Kemudian:

KRP001
↓
Cari kartu
↓
Kartu aktif?
↓
Ya
↓
Simpan scan log
↓
Ambil Google Maps URL
↓
Redirect

Jika kartu tidak aktif:

Kartu tidak aktif

Jika kartu tidak ditemukan:

Kartu tidak ditemukan 7. Data Scan yang Dicatat

Minimal:

Data Keterangan
ID ID log
Card ID Identitas kartu
Scanned At Waktu penggunaan
IP Address IP request
User Agent Informasi browser/device
Referrer Jika tersedia
Destination Tujuan redirect

Contoh:

Card ID : KRP001
Scanned At : 18 September 2026 14:32
Device : Android
Browser : Chrome
Destination : Google Maps 8. Privasi Data

Fitur tracking sebaiknya tidak mengumpulkan data pribadi yang tidak diperlukan.

Jangan mencoba mengetahui:

nama pelanggan
nomor telepon
email pelanggan
lokasi GPS pelanggan

untuk kebutuhan dasar fitur ini.

IP address juga sebaiknya tidak ditampilkan mentah kepada pemilik bisnis. Jika tidak diperlukan untuk operasional/keamanan, bisa dilakukan anonymization atau retention terbatas.

Tujuan tracking adalah:

mengukur penggunaan kartu, bukan mengidentifikasi pelanggan.

9. Database

Tambahkan tabel:

scan_logs
id
card_id
scanned_at
ip_hash
user_agent
device_type
browser
referrer
created_at
updated_at

Relasi:

Business
│
└── Cards
│
└── Scan Logs

Contoh:

Business
↓
Kartu #001
↓
542 Scan

Kartu #002
↓
321 Scan 10. Card Management

Pada halaman kartu:

Kartu Saya

┌─────────────────────────────────────┐
│ KRP001 │
│ Lokasi: Kasir │
│ Status: Aktif │
│ Total Scan: 542 │
│ │
│ [Detail] [Edit] [Nonaktifkan] │
└─────────────────────────────────────┘

Pemilik dapat memberikan label pada kartu.

Contoh:

KRP001 → Kasir
KRP002 → Meja 01
KRP003 → Meja 02
KRP004 → Pintu Masuk

Ini akan membuat data analytics lebih berguna.

11. Dashboard Analytics

Tambahkan halaman:

Analytics

Ringkasan
┌──────────────┐
│ Total Scan │
│ 1.248 │
└──────────────┘

┌──────────────┐
│ Hari Ini │
│ 37 │
└──────────────┘

┌──────────────┐
│ Bulan Ini │
│ 421 │
└──────────────┘ 12. Grafik Penggunaan

Tampilkan grafik:

Scan 7 Hari Terakhir
Sen ███████
Sel █████████
Rab █████
Kam ███████████
Jum █████████████
Sab ███████████████
Min █████████

Pengguna dapat memilih:

7 hari;
30 hari;
3 bulan;
custom date range. 13. Statistik Berdasarkan Kartu

Contoh:

Kartu Lokasi Total Scan
KRP001 Kasir 542
KRP002 Meja 01 321
KRP003 Meja 02 385

Bisa diberikan visualisasi sederhana:

Kartu paling banyak digunakan: KRP001 — Kasir

Namun sebaiknya hindari label seperti “kartu terbaik” karena jumlah scan belum tentu berarti kualitas kartu atau kualitas pelayanan lebih baik.

14. Statistik Berdasarkan Waktu

Pemilik bisnis dapat melihat:

Jam Penggunaan
08.00 ███
09.00 █████
10.00 ███████
11.00 █████████
12.00 █████████████
13.00 ████████
14.00 █████

Ini dapat membantu melihat kapan kartu paling sering digunakan.

15. Detail Scan

Pemilik dapat membuka:

Detail Aktivitas

Contoh:

Waktu Kartu Device
14:32 Kasir Android
14:27 Meja 01 iPhone
14:21 Kasir Android
13:58 Meja 02 Android

Tidak perlu menampilkan IP mentah pada dashboard.

16. Unique Scan

Ini bagian yang penting.

Jangan hanya membuat:

Total Orang

karena sistem tidak dapat memastikan bahwa satu scan = satu orang.

Gunakan istilah:

Total Scan

Contoh:

1.248 Total Scan

Jika ingin memberikan metrik tambahan:

Perkiraan Pengguna Unik

bisa dibuat berdasarkan mekanisme cookie/session atau kombinasi sinyal teknis tertentu, tetapi harus diberi label perkiraan, bukan jumlah orang yang pasti.

Untuk MVP saya malah menyarankan belum perlu membuat unique visitor.

Fokus dulu pada:

Total penggunaan kartu.

17. Review Conversion

Untuk versi awal:

Scan → Google Maps

Yang dapat dipastikan sistem adalah:

Kartu digunakan dan pengguna diarahkan ke Google Maps.

Yang tidak dapat dipastikan secara langsung:

Apakah pelanggan benar-benar menulis review.

Jadi dashboard jangan mengatakan:

1.248 Scan
1.248 Review

Yang benar:

1.248 Scan
↓
1.248 Redirect ke Google Maps

Jika suatu saat ada integrasi resmi yang memungkinkan mendapatkan data review secara sah, fitur ini bisa dikembangkan lebih lanjut.

18. Anti-Spam / Duplicate Scan

Satu pelanggan bisa saja melakukan:

Tap
Tap
Tap

sehingga tercatat 3 scan.

Untuk analytics, kamu bisa membuat dua metrik:

Raw Scan

Semua request dihitung.

Total Scan: 1.248
Valid Scan

Request berulang dalam waktu sangat dekat dapat ditandai sebagai duplicate.

Misalnya:

Tap 14:32:01
Tap 14:32:03
Tap 14:32:05

dapat ditandai sebagai:

1 valid scan
2 duplicate

Namun jangan langsung menghapus raw data. Lebih baik simpan datanya dan tentukan statusnya.

19. Status Scan

Contoh:

valid
duplicate
invalid_card
inactive_card

Sehingga analytics bisa membedakan:

Total Request 1.300
Valid Scan 1.248
Duplicate 52

Ini juga berguna untuk debugging sistem.

20. Keamanan

URL kartu:

/r/KRP001

tidak boleh memberikan akses ke dashboard.

URL tersebut hanya berfungsi sebagai public redirect endpoint.

Sedangkan pengaturan kartu membutuhkan:

Login

- PIN / Authentication

Jangan menaruh:

Google Maps URL
PIN
data pemilik

di URL publik.

21. Admin / Business Dashboard

Struktur navigasi dapat dibuat sederhana:

Dashboard
│
├── Overview
│
├── Kartu
│ ├── Semua Kartu
│ └── Tambah Kartu
│
├── Analytics
│ ├── Ringkasan
│ ├── Periode
│ └── Per Kartu
│
└── Pengaturan 22. Dashboard Overview

Dashboard utama dapat menampilkan:

Halo, Kopi ABC 👋

Total Kartu
5

Total Scan
1.248

Scan Hari Ini
37

Scan Bulan Ini
421

Kemudian:

Aktivitas Scan
[ Grafik ]

Kartu Teraktif
Kasir 542
Meja 01 321
Meja 02 385 23. MVP

Untuk tahap pertama, saya tidak menyarankan membuat semuanya sekaligus.

MVP:
Unique Card ID
Unique redirect URL
NFC
QR
Redirect tracking
Scan log
Total scan
Scan berdasarkan kartu
Scan berdasarkan tanggal
Dashboard sederhana
Status kartu
Edit Google Maps URL
Setelah MVP:
Grafik interaktif
Filter tanggal
Device analytics
Duplicate detection
Export CSV
Multi-location
Multi-user
Advanced analytics 24. Contoh Arsitektur
┌──────────────┐
│ NFC Card │
└──────┬───────┘
│
┌──────▼───────┐
│ QR Code │
└──────┬───────┘
│
▼
┌─────────────────────┐
│ Kartu Review Pintar │
│ /r/{card_code} │
└──────────┬──────────┘
│
▼
┌────────────────┐
│ Laravel │
└───────┬────────┘
│
┌───────────┴───────────┐
▼ ▼
┌──────────────┐ ┌──────────────┐
│ MySQL │ │ Google Maps │
│ Scan Logs │ │ Review │
└──────────────┘ └──────────────┘
▲ ▲
│ │
└────── Dashboard ──────┘ 25. Contoh Teknologi

Karena stack project-mu sudah cocok, tidak perlu diubah:

Backend

Laravel
PHP

Database

MySQL

Frontend

Blade / Tailwind CSS
Vite

Physical

NFC Card
QR Code

Hosting

VPS/shared hosting/hosting Laravel yang sesuai

Tidak wajib menggunakan:

Google Analytics
Firebase Analytics
aplikasi mobile
server terpisah

untuk MVP.

26. Success Metrics

Keberhasilan fitur dapat diukur dari:

Sistem
Redirect berhasil.
Scan tercatat.
Tidak terjadi kehilangan log.
Redirect ke Google Maps tetap cepat.
Bisnis

Pemilik bisnis dapat mengetahui:

Berapa kali kartu digunakan?

Kartu mana yang digunakan?

Kapan kartu paling sering digunakan?

Bagaimana tren penggunaan dari waktu ke waktu?

27. Positioning Fitur

Saya akan mengemas fitur ini dengan bahasa yang sederhana:

Pantau Penggunaan Kartu

Ketahui berapa kali pelanggan menggunakan Kartu Review Pintar untuk menuju halaman review bisnis Anda.

Lalu:

1.248
Total Scan

421
Scan Bulan Ini

37
Scan Hari Ini

Dan jangan mengatakan:

“Kami menjamin mendapatkan 1.248 review.”

Lebih tepat:

“1.248 pelanggan telah menggunakan kartu untuk menuju halaman review.”

🔥 Pengembangan yang menurut saya paling menarik setelah ini

Kalau fitur ini sudah jadi, project-mu bisa berkembang menjadi:

Kartu → Tracking → Analytics

dan nantinya:

Kartu → Tracking → Analytics → Multi-Card → Multi-Location

Misalnya satu restoran memiliki:

Cabang Makassar
├── Kasir
├── Meja 01
├── Meja 02
└── Meja 03

Cabang Gowa
├── Kasir
├── Meja 01
└── Meja 02

Pemilik cukup membuka dashboard dan melihat penggunaan masing-masing kartu/cabang.

Menurut saya ini jauh lebih menarik untuk portfolio dibanding hanya “NFC redirect ke Google Maps”, karena sekarang sudah ada unsur product engineering + analytics + physical-to-digital system.
