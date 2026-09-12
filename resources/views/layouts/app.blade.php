<!DOCTYPE html>
<html lang="id" class="h-full">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Kartu Pintar | Kartu NFC dan QR Review Google Maps')</title>
    <meta name="description" content="Kartu Pintar adalah kartu NFC dan QR yang memudahkan pelanggan memberikan review Google Maps. Cocok untuk UMKM, restoran, toko, hotel, dan bisnis lainnya.">
    <meta name="keywords" content="kartu review Google Maps, kartu NFC Google Maps, kartu QR Google Maps, kartu review NFC, kartu review QR, kartu Google Maps, NFC review card, QR review card, smart review card, kartu digital bisnis, kartu review pelanggan">
    <link rel="canonical" href="https://kartupintar.my.id">

    {{-- Favicon & OpenGraph Meta Tags --}}
    <link rel="icon" type="image/jpeg" href="{{ asset('logo-kartu-pintar.jpg') }}">
    <meta property="og:title" content="@yield('title', 'Kartu Pintar | Kartu NFC dan QR Review Google Maps')">
    <meta property="og:description" content="Kartu Pintar adalah kartu NFC dan QR yang memudahkan pelanggan memberikan review Google Maps. Cocok untuk UMKM, restoran, toko, hotel, dan bisnis lainnya.">
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

    {{-- TailwindCSS Play CDN --}}
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
                        'fade-up': 'fadeUp 0.5s ease-out forwards',
                        'pulse-slow': 'pulse 3s ease-in-out infinite',
                    },
                    keyframes: {
                        fadeUp: {
                            '0%': {
                                opacity: '0',
                                transform: 'translateY(20px)'
                            },
                            '100%': {
                                opacity: '1',
                                transform: 'translateY(0)'
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
            box-shadow: 8px 8px 0px rgba(17, 24, 39, 0.1);
            border-radius: 1rem;
        }

        .input-field {
            width: 100%;
            padding: 0.875rem 1rem;
            background: #f8f9fa;
            border: 2px solid #e5e7eb;
            border-radius: 0.5rem;
            color: #111827;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.95rem;
            transition: all 0.2s ease;
            outline: none;
        }

        .input-field::placeholder {
            color: #9ca3af;
        }

        .input-field:focus {
            background: #ffffff;
            border-color: #4285F4;
            box-shadow: 0 0 0 4px rgba(66, 133, 244, 0.15);
        }

        .input-field.error {
            border-color: #EA4335;
            box-shadow: 0 0 0 4px rgba(234, 67, 53, 0.15);
        }

        .btn-google-blue {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            padding: 1rem 1.5rem;
            background: #4285F4;
            color: white;
            font-family: 'Archivo Black', sans-serif;
            text-transform: uppercase;
            font-size: 1rem;
            border-radius: 0.5rem;
            border: 2px solid #4285F4;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-google-blue:hover {
            background: #3367d6;
            border-color: #3367d6;
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(66, 133, 244, 0.3);
        }

        .btn-google-blue:active {
            transform: translateY(0);
        }

        .btn-google-green {
            background: #34A853;
            border-color: #34A853;
        }

        .btn-google-green:hover {
            background: #2b8240;
            border-color: #2b8240;
            box-shadow: 0 6px 15px rgba(52, 168, 83, 0.3);
        }

        .btn-google-red {
            background: #EA4335;
            border-color: #EA4335;
        }

        .btn-google-red:hover {
            background: #c5221f;
            border-color: #c5221f;
            box-shadow: 0 6px 15px rgba(234, 67, 53, 0.3);
        }

        .glow-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #34A853;
            box-shadow: 0 0 10px #34A853;
            animation: pulse 2s ease-in-out infinite;
        }
    </style>
</head>

<body class="min-h-full font-sans antialiased text-google-text">

    {{-- Main content --}}
    <main class="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">

        {{-- Logo/Brand --}}
        {{-- <div class="mb-8 text-center animate-fade-up">
            <div class="inline-flex items-center gap-3 border-2 border-google-text rounded-full pl-2 pr-6 py-2 bg-white shadow-[4px_4px_0px_rgba(17,24,39,0.1)]">
                <img src="{{ asset('logo-kartu-pintar.jpg') }}" alt="Logo" class="w-10 h-10 rounded-full border-2 border-google-text">
                <span class="text-sm font-bold-display text-google-text tracking-wide mt-1">Kartu Pintar</span>
            </div>
        </div> --}}

        @yield('content')

        {{-- Footer --}}
        <p class="mt-12 text-sm font-bold text-gray-400 text-center">
            &copy; {{ date('Y') }} KARTU REVIEW PINTAR NFC DAN QR
        </p>
    </main>

</body>

</html>
