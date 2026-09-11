<!DOCTYPE html>
<html lang="id" class="h-full scroll-smooth">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kartu Pintar | Kartu NFC & QR Review Google Maps</title>
    <meta name="description" content="Kartu Pintar adalah kartu NFC & QR yang memudahkan pelanggan memberikan review Google Maps. Cocok untuk UMKM, restoran, toko, hotel, dan bisnis lainnya.">
    <meta name="keywords" content="kartu review Google Maps, kartu NFC Google Maps, kartu QR Google Maps, kartu review NFC, kartu review QR, kartu Google Maps, NFC review card, QR review card, smart review card, kartu digital bisnis, kartu review pelanggan">
    <link rel="canonical" href="https://kartupintar.my.id">

    {{-- Favicon & OpenGraph Meta Tags --}}
    <link rel="icon" type="image/jpeg" href="{{ asset('logo-kartu-pintar.jpg') }}">
    <meta property="og:title" content="Kartu Pintar | Kartu NFC & QR Review Google Maps">
    <meta property="og:description" content="Kartu Pintar adalah kartu NFC & QR yang memudahkan pelanggan memberikan review Google Maps. Cocok untuk UMKM, restoran, toko, hotel, dan bisnis lainnya.">
    <meta property="og:image" content="{{ asset('logo-kartu-pintar.jpg') }}">
    <meta property="og:url" content="https://kartupintar.my.id">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Kartu Pintar">

    {{-- Google Fonts: Archivo Black, JetBrains Mono, Inter --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap"
        rel="stylesheet">

    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
                        display: ['"Archivo Black"', 'sans-serif'],
                        mono: ['"JetBrains Mono"', 'monospace'],
                    },
                    colors: {
                        google: {
                            blue: '#4285F4',
                            red: '#EA4335',
                            yellow: '#FBBC05',
                            green: '#34A853',
                            surface: '#ffffff',
                            text: '#111827',
                            gray: '#f8f9fa',
                        }
                    },
                    animation: {
                        'fade-up': 'fadeUp 0.6s ease-out forwards',
                        'float': 'float 6s ease-in-out infinite',
                    },
                    keyframes: {
                        fadeUp: {
                            '0%': {
                                opacity: '0',
                                transform: 'translateY(24px)'
                            },
                            '100%': {
                                opacity: '1',
                                transform: 'translateY(0)'
                            },
                        },
                        float: {
                            '0%, 100%': {
                                transform: 'translateY(0px)'
                            },
                            '50%': {
                                transform: 'translateY(-10px)'
                            },
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #ffffff;
            color: #111827;
        }

        .font-bold-display {
            font-family: 'Archivo Black', sans-serif;
            text-transform: uppercase;
            letter-spacing: -0.02em;
        }

        .card-solid {
            background: #ffffff;
            border: 3px solid #111827;
            box-shadow: 8px 8px 0px rgba(17, 24, 39, 1);
            border-radius: 1rem;
            transition: all 0.3s ease;
        }

        .card-solid:hover {
            transform: translate(-4px, -4px);
            box-shadow: 12px 12px 0px rgba(17, 24, 39, 1);
        }

        .btn-google-blue {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 1rem 2rem;
            background: #4285F4;
            color: white;
            font-family: 'Archivo Black', sans-serif;
            text-transform: uppercase;
            font-size: 1rem;
            border-radius: 0.75rem;
            border: 3px solid #111827;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 4px 4px 0px #111827;
        }

        .btn-google-blue:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0px #111827;
        }

        .btn-google-blue:active {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0px #111827;
        }

        /* Decorative Grid Background */
        .bg-grid {
            background-size: 40px 40px;
            background-image:
                linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
        }
    </style>
</head>

<body class="min-h-screen bg-grid antialiased">

    {{-- Navbar --}}
    <nav class="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b-4 border-google-text z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
                <div class="flex-shrink-0 flex items-center gap-3">
                    <img src="{{ asset('logo-kartu-pintar.jpg') }}" alt="Logo Kartu Pintar"
                        class="w-10 h-10 rounded-full border-2 border-google-text shadow-[2px_2px_0px_#111827]">
                    <span class="font-bold-display text-xl mt-1">KARTU PINTAR</span>
                </div>
                <div class="flex items-center gap-4 md:gap-8">
                    <div class="hidden md:flex items-center gap-6">
                        <a href="#fitur" class="font-bold-display text-gray-600 hover:text-google-blue transition-colors text-sm">FITUR</a>
                        <a href="#cara-kerja" class="font-bold-display text-gray-600 hover:text-google-blue transition-colors text-sm">CARA KERJA</a>
                        <a href="#harga" class="font-bold-display text-gray-600 hover:text-google-blue transition-colors text-sm">HARGA</a>
                    </div>
                    <a href="#harga" class="px-5 py-2 bg-google-blue text-white font-bold-display text-sm border-2 border-google-text rounded-lg shadow-[4px_4px_0px_#111827] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#111827] active:translate-y-0 active:shadow-[2px_2px_0px_#111827] transition-all">
                        BELI SEKARANG
                    </a>
                </div>
            </div>
        </div>
    </nav>

    {{-- Hero Section --}}
    <section class="pt-32 pb-24 px-4 max-w-7xl mx-auto overflow-hidden ">
        <div class="flex flex-col lg:flex-row items-center gap-12">

            {{-- Left Content --}}
            <div class="flex-1 text-left relative z-10">
                <div class="mb-6 animate-fade-up">
                    <span
                        class="inline-flex items-center gap-2 border-2 border-google-text bg-google-green text-white rounded-full px-4 py-1.5 text-sm font-bold-display shadow-[4px_4px_0px_#111827]">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        NFC & QR READY
                    </span>
                </div>

                <h1 class="text-5xl sm:text-6xl lg:text-6xl font-bold-display text-google-text leading-[1.1] mb-6 animate-fade-up"
                    style="animation-delay: 0.1s;">
                    CARA <span
                        class="bg-google-yellow px-2 border-4 border-google-text shadow-[4px_4px_0px_#111827] -rotate-2 inline-block">TERCEPAT</span><br>
                    DAPATKAN ULASAN BINTANG 5
                </h1>

                <p class="text-lg md:text-xl text-gray-600 font-medium mb-10 max-w-lg animate-fade-up"
                    style="animation-delay: 0.2s;">
                    Berhenti meminta ulasan secara manual! Pelanggan cukup tap kartu atau scan kode, dan langsung
                    diarahkan ke halaman Google Maps bisnis Anda.
                </p>

                <div class="flex flex-wrap gap-4 animate-fade-up" style="animation-delay: 0.3s;">
                    <a href="#fitur" class="btn-google-blue !text-lg !px-8 !py-4 group">
                        LIHAT FITUR
                        <svg class="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none"
                            viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                        </svg>
                    </a>
                    <a href="#cara-kerja"
                        class="bg-white text-google-text font-bold-display text-lg px-8 py-4 rounded-xl border-4 border-google-text shadow-[4px_4px_0px_#111827] hover:bg-gray-50 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#111827] transition-all flex items-center justify-center">
                        CARA KERJA
                    </a>
                </div>
            </div>

            {{-- Right Visual (Floating Cards) --}}
            <div class="flex-1 relative w-full h-[400px] lg:h-[500px] animate-fade-up hidden md:block"
                style="animation-delay: 0.4s;">
                <div class="absolute inset-0 bg-google-blue/5 rounded-full blur-3xl transform scale-150"></div>

                <div class="relative w-full h-full flex justify-center items-center">
                    {{-- Main Phone Mockup --}}
                    <div
                        class="absolute z-20 w-64 h-[420px] bg-white border-4 border-google-text rounded-[2rem] shadow-[12px_12px_0px_#4285F4] p-4 flex flex-col items-center animate-float">
                        <div class="w-20 h-6 bg-gray-100 rounded-full mb-8 border-2 border-gray-200"></div>
                        <div class="w-full bg-google-yellow/20 rounded-xl p-4 border-2 border-google-yellow mb-4">
                            <div class="flex justify-center mb-2">
                                <span class="text-google-yellow text-3xl">★★★★★</span>
                            </div>
                            <div class="w-full h-3 bg-white rounded border border-gray-200 mb-2"></div>
                            <div class="w-2/3 h-3 bg-white rounded border border-gray-200"></div>
                        </div>
                        <div
                            class="w-full h-12 bg-google-blue rounded-xl mt-auto border-2 border-google-text text-white font-bold-display flex items-center justify-center text-sm shadow-[4px_4px_0px_#111827]">
                            POSTING
                        </div>
                    </div>

                    {{-- Floating NFC Card Element --}}
                    <div class="absolute z-30 -right-4 md:right-4 top-1/4 w-48 h-32 bg-google-red border-4 border-google-text rounded-xl shadow-[8px_8px_0px_#111827] transform rotate-12 flex flex-col items-start p-4 justify-between animate-float"
                        style="animation-delay: 1.5s;">
                        <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span class="font-bold-display text-white text-lg leading-none">TAP<br>HERE</span>
                    </div>

                    {{-- Small decorative elements --}}
                    <div
                        class="absolute z-10 left-10 bottom-1/4 w-12 h-12 bg-google-green border-4 border-google-text rounded-full shadow-[4px_4px_0px_#111827] animate-pulse">
                    </div>
                    <div
                        class="absolute z-10 right-16 bottom-16 w-16 h-16 bg-google-yellow border-4 border-google-text rounded-lg shadow-[4px_4px_0px_#111827] transform -rotate-12">
                    </div>
                </div>
            </div>

        </div>
    </section>

    {{-- Features Section --}}
    <section id="fitur" class="py-20 bg-google-text text-white border-y-4 border-google-text px-4">
        <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

                {{-- Feature 1 --}}
                <div
                    class="bg-white text-google-text p-8 border-4 border-google-text rounded-2xl shadow-[8px_8px_0px_#4285F4] hover:-translate-y-2 transition-transform">
                    <div
                        class="w-14 h-14 bg-google-blue border-2 border-google-text rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#111827]">
                        <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold-display mb-3">INSTANT REDIRECT</h3>
                    <p class="font-medium text-gray-600">Scan kartu → langsung ke Google Maps. Zero friction untuk
                        pelanggan Anda. Sangat cepat dan mudah.</p>
                </div>

                {{-- Feature 2 --}}
                <div
                    class="bg-white text-google-text p-8 border-4 border-google-text rounded-2xl shadow-[8px_8px_0px_#34A853] hover:-translate-y-2 transition-transform">
                    <div
                        class="w-14 h-14 bg-google-green border-2 border-google-text rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#111827]">
                        <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold-display mb-3">PIN AMAN</h3>
                    <p class="font-medium text-gray-600">Setiap kartu dilindungi oleh PIN terenkripsi. Hanya Anda yang
                        bisa mengubah tautan tujuan Google Maps.</p>
                </div>

                {{-- Feature 3 --}}
                <div
                    class="bg-white text-google-text p-8 border-4 border-google-text rounded-2xl shadow-[8px_8px_0px_#FBBC05] hover:-translate-y-2 transition-transform">
                    <div
                        class="w-14 h-14 bg-google-yellow border-2 border-google-text rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#111827]">
                        <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold-display mb-3">TANPA APLIKASI</h3>
                    <p class="font-medium text-gray-600">Frictionless onboarding. Aktivasi langsung dari browser
                        smartphone, tidak perlu mengunduh aplikasi tambahan.</p>
                </div>

            </div>
        </div>
    </section>

    {{-- How It Works --}}
    <section id="cara-kerja" class="py-24 px-4 bg-white">
        <div class="max-w-4xl mx-auto text-center">
            <h2 class="text-4xl md:text-5xl font-bold-display text-google-text mb-16">CARA KERJA</h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {{-- Connecting line for Desktop --}}
                <div
                    class="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-google-text -z-10 transform -translate-y-1/2">
                </div>

                <div
                    class="bg-white border-4 border-google-text p-6 rounded-full aspect-square flex flex-col justify-center shadow-[6px_6px_0px_#111827] mx-auto w-56 relative z-10">
                    <span class="text-4xl font-bold-display text-google-blue mb-2">1</span>
                    <h4 class="font-bold text-lg leading-tight">TAP KARTU<br>NFC</h4>
                </div>

                <div
                    class="bg-white border-4 border-google-text p-6 rounded-full aspect-square flex flex-col justify-center shadow-[6px_6px_0px_#111827] mx-auto w-56 relative z-10">
                    <span class="text-4xl font-bold-display text-google-red mb-2">2</span>
                    <h4 class="font-bold text-lg leading-tight">MASUKKAN<br>URL & PIN</h4>
                </div>

                <div
                    class="bg-white border-4 border-google-text p-6 rounded-full aspect-square flex flex-col justify-center shadow-[6px_6px_0px_#111827] mx-auto w-56 relative z-10">
                    <span class="text-4xl font-bold-display text-google-green mb-2">3</span>
                    <h4 class="font-bold text-lg leading-tight">SIAP<br>DIGUNAKAN!</h4>
                </div>
            </div>
        </div>
    </section>

    {{-- Target Audience --}}
    <section class="py-24 px-4 bg-google-yellow border-y-4 border-google-text">
        <div class="max-w-6xl mx-auto">
            <h2 class="text-4xl md:text-5xl font-bold-display text-google-text mb-16 text-center">UNTUK BISNIS APA SAJA?</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Card 1 -->
                <div class="bg-white border-4 border-google-text p-6 rounded-2xl shadow-[8px_8px_0px_#111827] hover:-translate-y-2 transition-transform">
                    <h3 class="text-2xl font-bold-display mb-2 text-google-blue">RESTORAN & KAFE</h3>
                    <p class="font-medium text-gray-700">Dapatkan ulasan selagi pelanggan menunggu tagihan atau menikmati kopi.</p>
                </div>
                <!-- Card 2 -->
                <div class="bg-white border-4 border-google-text p-6 rounded-2xl shadow-[8px_8px_0px_#111827] hover:-translate-y-2 transition-transform">
                    <h3 class="text-2xl font-bold-display mb-2 text-google-red">KLINIK & SALON</h3>
                    <p class="font-medium text-gray-700">Minta pasien menilai pelayanan langsung setelah selesai sesi pengobatan atau perawatan.</p>
                </div>
                <!-- Card 3 -->
                <div class="bg-white border-4 border-google-text p-6 rounded-2xl shadow-[8px_8px_0px_#111827] hover:-translate-y-2 transition-transform">
                    <h3 class="text-2xl font-bold-display mb-2 text-google-green">TOKO RETAIL</h3>
                    <p class="font-medium text-gray-700">Letakkan di meja kasir. Pelanggan tap saat membayar belanjaan mereka.</p>
                </div>
                <!-- Card 4 -->
                <div class="bg-white border-4 border-google-text p-6 rounded-2xl shadow-[8px_8px_0px_#111827] hover:-translate-y-2 transition-transform">
                    <h3 class="text-2xl font-bold-display mb-2 text-google-text">BENGKEL & JASA</h3>
                    <p class="font-medium text-gray-700">Tingkatkan kepercayaan calon pelanggan baru dengan rating tinggi di Maps.</p>
                </div>
            </div>
        </div>
    </section>

    {{-- Pricing Section --}}
    <section id="harga" class="py-24 px-4 bg-white">
        <div class="max-w-4xl mx-auto text-center">
            <h2 class="text-4xl md:text-5xl font-bold-display text-google-text mb-6">PILIH KARTU ANDA</h2>
            <p class="text-lg text-gray-600 font-medium mb-12">Satu kali bayar. Tanpa biaya bulanan. Bisa dipakai selamanya.</p>

            <div class="bg-white border-4 border-google-text p-8 md:p-12 rounded-3xl shadow-[12px_12px_0px_#111827] max-w-2xl mx-auto relative">
                <!-- Badge -->
                <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-google-red text-white font-bold-display px-6 py-2 border-4 border-google-text rounded-full shadow-[4px_4px_0px_#111827] rotate-2">
                    PROMO TERBATAS
                </div>

                <h3 class="text-3xl font-bold-display text-google-text mb-4 mt-4">PAKET STANDAR</h3>
                <div class="flex justify-center items-end gap-2 mb-8">
                    <span class="text-2xl font-bold text-gray-400 line-through">Rp 115.000</span>
                    <span class="text-5xl font-bold-display text-google-green">Rp 50.000</span>
                </div>

                <ul class="text-left space-y-4 font-bold text-gray-700 mb-10 max-w-sm mx-auto">
                    <li class="flex items-center gap-3">
                        <div class="w-6 h-6 bg-google-green rounded-full border-2 border-google-text flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        1 Kartu NFC & QR Code
                    </li>
                    <li class="flex items-center gap-3">
                        <div class="w-6 h-6 bg-google-green rounded-full border-2 border-google-text flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        Bebas ubah link Google Maps
                    </li>
                    <li class="flex items-center gap-3">
                        <div class="w-6 h-6 bg-google-green rounded-full border-2 border-google-text flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        Perlindungan PIN
                    </li>
                    <li class="flex items-center gap-3">
                        <div class="w-6 h-6 bg-google-green rounded-full border-2 border-google-text flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        Tanpa biaya langganan
                    </li>
                </ul>

                <div class="flex flex-col sm:flex-row gap-4">
                    <a href="https://wa.me/6285342181132?text=Halo%20saya%20tertarik%20dengan%20Kartu%20Review%20Pintar" target="_blank" class="w-full btn-google-blue !text-lg !py-4 block text-center flex-1">
                        PESAN VIA WA (1)
                    </a>
                    <a href="https://wa.me/6281340152851?text=Halo%20saya%20tertarik%20dengan%20Kartu%20Review%20Pintar" target="_blank" class="w-full btn-google-blue !text-lg !py-4 block text-center flex-1 !bg-google-green">
                        PESAN VIA WA (2)
                    </a>
                </div>
            </div>
        </div>
    </section>

    {{-- FAQ Section --}}
    <section class="py-24 px-4 bg-google-blue border-y-4 border-google-text text-white">
        <div class="max-w-3xl mx-auto">
            <h2 class="text-4xl md:text-5xl font-bold-display mb-12 text-center text-white">PERTANYAAN UMUM</h2>
            
            <div class="space-y-6">
                <!-- FAQ Item 1 -->
                <div class="bg-white text-google-text border-4 border-google-text p-6 rounded-2xl shadow-[8px_8px_0px_#111827]">
                    <h4 class="text-xl font-bold-display mb-2">Apakah hp pelanggan harus punya NFC?</h4>
                    <p class="font-medium text-gray-700">Untuk fitur tap, ya. Jika hp pelanggan tidak mendukung NFC, mereka tetap bisa scan QR code yang tercetak di kartu menggunakan kamera hp.</p>
                </div>

                <!-- FAQ Item 2 -->
                <div class="bg-white text-google-text border-4 border-google-text p-6 rounded-2xl shadow-[8px_8px_0px_#111827]">
                    <h4 class="text-xl font-bold-display mb-2">Apakah bisa dipakai untuk banyak cabang?</h4>
                    <p class="font-medium text-gray-700">Satu kartu terhubung ke satu link Google Maps. Jika Anda memiliki beberapa cabang, gunakan satu kartu untuk masing-masing cabang.</p>
                </div>

                <!-- FAQ Item 3 -->
                <div class="bg-white text-google-text border-4 border-google-text p-6 rounded-2xl shadow-[8px_8px_0px_#111827]">
                    <h4 class="text-xl font-bold-display mb-2">Bagaimana cara ganti link jika saya pindah lokasi?</h4>
                    <p class="font-medium text-gray-700">Anda cukup tap kartu, masukkan PIN rahasia Anda, lalu masukkan link Google Maps yang baru. Prosesnya hanya butuh 10 detik.</p>
                </div>
            </div>
        </div>
    </section>

    {{-- CTA Bottom --}}
    <section class="py-24 px-4 bg-white text-center">
        <div class="max-w-4xl mx-auto">
            <h2 class="text-4xl md:text-5xl font-bold-display text-google-text mb-6">SIAP NAIKKAN RATING ANDA?</h2>
            <p class="text-xl text-gray-600 font-medium mb-10">Tinggalkan cara lama. Mulai kumpulkan ulasan bintang 5 hari ini.</p>
            <a href="#harga" class="inline-flex items-center justify-center gap-2 px-12 py-5 bg-google-blue text-white font-bold-display text-xl uppercase rounded-xl border-4 border-google-text cursor-pointer transition-all shadow-[6px_6px_0px_#111827] hover:-translate-y-2 hover:shadow-[10px_10px_0px_#111827] active:translate-y-1 active:shadow-[2px_2px_0px_#111827]">
                BELI KARTU SEKARANG
            </a>
        </div>
    </section>

    {{-- Footer --}}
    <footer class="bg-google-gray border-t-4 border-google-text py-12 px-4 text-center">
        <div class="flex justify-center gap-2 mb-6">
            <div class="w-4 h-4 rounded-full bg-google-blue border-2 border-google-text"></div>
            <div class="w-4 h-4 rounded-full bg-google-red border-2 border-google-text"></div>
            <div class="w-4 h-4 rounded-full bg-google-yellow border-2 border-google-text"></div>
            <div class="w-4 h-4 rounded-full bg-google-green border-2 border-google-text"></div>
        </div>
        <p class="font-bold-display text-google-text text-xl mb-2">KARTU REVIEW PINTAR</p>
        <p class="font-bold text-gray-500 mb-6">Powered by AKASA DevSign</p>
        <p class="text-sm font-bold text-gray-400">&copy; {{ date('Y') }} All Rights Reserved.</p>
    </footer>

</body>

</html>
