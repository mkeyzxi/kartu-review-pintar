// export default function Home() {
//   return (
//     <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
//       <div className="text-center animate-fade-up">
//         <div className="inline-flex items-center gap-3 border-2 border-google-text rounded-full pl-2 pr-6 py-2 bg-white shadow-google-sm mb-8">
//           <div className="w-10 h-10 rounded-full border-2 border-google-text bg-google-blue flex items-center justify-center">
//             <span className="text-white font-bold-display text-sm">KP</span>
//           </div>
//           <span className="text-sm font-bold-display text-google-text tracking-wide">Kartu Pintar</span>
//         </div>

//         <h1 className="text-4xl md:text-6xl font-bold-display text-google-text mb-4">
//           KARTU REVIEW PINTAR
//         </h1>
//         <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
//           Sistem kartu review pintar dengan NFC & QR Code yang memudahkan pelanggan memberikan review Google Maps
//         </p>

//         <div className="space-y-4">
//           <a
//             href="/admin/login"
//             className="inline-block bg-google-blue text-white px-8 py-4 rounded-lg font-bold-display hover:bg-blue-600 transition-all shadow-google-sm"
//           >
//             LOGIN ADMIN
//           </a>
//         </div>
//       </div>

//       <p className="mt-12 text-sm font-bold text-gray-400 text-center">
//         &copy; {new Date().getFullYear()} KARTU REVIEW PINTAR NFC DAN QR
//       </p>
//     </main>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        // Scroll ke bawah -> sembunyikan navbar
        setShowNavbar(false);
      } else {
        // Scroll ke atas -> tampilkan navbar
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY <= 0 ? 0 : currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-grid antialiased">
      {/*
        Style bawaan dari file blade dipertahankan di sini agar langsung jalan.
        Sangat disarankan untuk memindahkan CSS ini ke globals.css nantinya.
      */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

        .font-bold-display {
            font-family: 'Archivo Black', sans-serif;
            text-transform: uppercase;
            letter-spacing: -0.02em;
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

        .bg-grid {
            background-size: 40px 40px;
            background-image:
                linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
        }

        @keyframes fadeUp {
            0% { opacity: 0; transform: translateY(24px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
            animation: fadeUp 0.6s ease-out forwards;
            opacity: 0;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
      `}} />

      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b-4 border-google-text z-50 transform transition-transform duration-300 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-3">
              <Image
                src="/logo-kartu-pintar.jpg"
                alt="Logo Kartu Pintar"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-google-text shadow-[2px_2px_0px_#111827]"
              />
              <span className="font-bold-display text-base md:text-xl mt-1">
                KARTU PINTAR
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-8">
              <div className="hidden md:flex items-center gap-6">
                <a
                  href="#fitur"
                  aria-label="Lihat Fitur Kartu Pintar"
                  className="font-bold-display text-gray-700 hover:text-google-blue transition-colors text-sm"
                >
                  FITUR
                </a>
                <a
                  href="#cara-kerja"
                  aria-label="Lihat Cara Kerja Kartu Pintar"
                  className="font-bold-display text-gray-700 hover:text-google-blue transition-colors text-sm"
                >
                  CARA KERJA
                </a>
                <a
                  href="#harga"
                  aria-label="Lihat Harga Kartu Pintar"
                  className="font-bold-display text-gray-700 hover:text-google-blue transition-colors text-sm"
                >
                  HARGA
                </a>
              </div>
              <a
                href="#harga"
                aria-label="Beli Kartu Sekarang"
                className="px-3 py-1.5 md:px-5 md:py-2 bg-google-blue text-white font-bold-display text-xs md:text-sm border-2 border-google-text rounded-lg shadow-[4px_4px_0px_#111827] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#111827] active:translate-y-0 active:shadow-[2px_2px_0px_#111827] transition-all"
              >
                BELI SEKARANG
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 text-left relative z-10">
            <div className="mb-6 animate-fade-up">
              <span className="inline-flex items-center gap-2 border-2 border-google-text bg-google-green text-white rounded-full px-4 py-1.5 text-sm font-bold-display shadow-[4px_4px_0px_#111827]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
                NFC DAN QR READY
              </span>
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-6xl font-bold-display text-google-text leading-[1.1] mb-6 animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              KARTU NFC DAN QR{" "}
              <span className="bg-google-yellow px-2 border-4 border-google-text shadow-[4px_4px_0px_#111827] -rotate-2 inline-block">
                TERCEPAT
              </span>
              <br />
              UNTUK REVIEW GOOGLE MAPS
            </h1>

            <h2
              className="text-lg md:text-xl text-gray-700 font-medium mb-10 max-w-lg animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              Berhenti meminta ulasan secara manual! Dengan{" "}
              <strong>Kartu Review Pintar</strong>, pelanggan cukup tap NFC atau
              scan QR code, langsung diarahkan ke halaman review Google Maps
              bisnis Anda untuk rating bintang 5.
            </h2>

            <div
              className="flex flex-wrap gap-4 animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <a
                href="#fitur"
                aria-label="Lihat Fitur Lengkap"
                className="btn-google-blue !text-lg !px-8 !py-4 group"
              >
                LIHAT FITUR
                <svg
                  className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                  />
                </svg>
              </a>
              <a
                href="#cara-kerja"
                aria-label="Pelajari Cara Kerja"
                className="bg-white text-google-text font-bold-display text-lg px-8 py-4 rounded-xl border-4 border-google-text shadow-[4px_4px_0px_#111827] hover:bg-gray-50 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#111827] transition-all flex items-center justify-center"
              >
                CARA KERJA
              </a>
            </div>
          </div>

          {/* Right Visual (Floating Cards) */}
          <div
            className="flex-1 relative w-full h-[400px] lg:h-[500px] animate-fade-up hidden md:block"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="absolute inset-0 bg-google-blue/5 rounded-full blur-3xl transform scale-150"></div>

            <div className="relative w-full h-full flex justify-center items-center">
              {/* Main Phone Mockup */}
              <div className="absolute z-20 w-64 h-[420px] bg-white border-4 border-google-text rounded-[2rem] shadow-[12px_12px_0px_#4285F4] p-4 flex flex-col items-center animate-float">
                <div className="w-20 h-6 bg-gray-100 rounded-full mb-8 border-2 border-gray-200"></div>
                <div className="w-full bg-google-yellow/20 rounded-xl p-4 border-2 border-google-yellow mb-4">
                  <div className="flex justify-center mb-2">
                    <span className="text-google-yellow text-3xl">★★★★★</span>
                  </div>
                  <div className="w-full h-3 bg-white rounded border border-gray-200 mb-2"></div>
                  <div className="w-2/3 h-3 bg-white rounded border border-gray-200"></div>
                </div>
                <div className="w-full h-12 bg-google-blue rounded-xl mt-auto border-2 border-google-text text-white font-bold-display flex items-center justify-center text-sm shadow-[4px_4px_0px_#111827]">
                  POSTING
                </div>
              </div>

              {/* Floating NFC Card Element */}
              <div
                className="absolute z-30 -right-4 md:right-4 top-1/4 w-48 h-32 bg-google-red border-4 border-google-text rounded-xl shadow-[8px_8px_0px_#111827] transform rotate-12 flex flex-col items-start p-4 justify-between animate-float"
                style={{ animationDelay: "1.5s" }}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="font-bold-display text-white text-lg leading-none">
                  TAP<br />HERE
                </span>
              </div>

              {/* Small decorative elements */}
              <div className="absolute z-10 left-10 bottom-1/4 w-12 h-12 bg-google-green border-4 border-google-text rounded-full shadow-[4px_4px_0px_#111827] animate-pulse"></div>
              <div className="absolute z-10 right-16 bottom-16 w-16 h-16 bg-google-yellow border-4 border-google-text rounded-lg shadow-[4px_4px_0px_#111827] transform -rotate-12"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="fitur"
        className="py-20 bg-google-text text-white border-y-4 border-google-text px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white text-google-text p-8 border-4 border-google-text rounded-2xl shadow-[8px_8px_0px_#4285F4] hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 bg-google-blue border-2 border-google-text rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#111827]">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold-display mb-3">INSTANT REDIRECT</h3>
              <p className="font-medium text-gray-700">
                Scan kartu → langsung ke Google Maps. Zero friction untuk
                pelanggan Anda. Sangat cepat dan mudah.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white text-google-text p-8 border-4 border-google-text rounded-2xl shadow-[8px_8px_0px_#34A853] hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 bg-google-green border-2 border-google-text rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#111827]">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold-display mb-3">PIN AMAN</h3>
              <p className="font-medium text-gray-700">
                Setiap kartu dilindungi oleh PIN terenkripsi. Hanya Anda yang
                bisa mengubah tautan tujuan Google Maps.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white text-google-text p-8 border-4 border-google-text rounded-2xl shadow-[8px_8px_0px_#FBBC05] hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 bg-google-yellow border-2 border-google-text rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#111827]">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold-display mb-3">TANPA APLIKASI</h3>
              <p className="font-medium text-gray-700">
                Frictionless onboarding. Aktivasi langsung dari browser
                smartphone, tidak perlu mengunduh aplikasi tambahan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="cara-kerja" className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold-display text-google-text mb-16">
            CARA KERJA
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for Desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-google-text -z-10 transform -translate-y-1/2"></div>

            <div className="bg-white border-4 border-google-text p-6 rounded-full aspect-square flex flex-col justify-center shadow-[6px_6px_0px_#111827] mx-auto w-56 relative z-10">
              <span className="text-4xl font-bold-display text-google-blue mb-2">
                1
              </span>
              <h4 className="font-bold text-lg leading-tight">
                TAP KARTU<br />NFC
              </h4>
            </div>

            <div className="bg-white border-4 border-google-text p-6 rounded-full aspect-square flex flex-col justify-center shadow-[6px_6px_0px_#111827] mx-auto w-56 relative z-10">
              <span className="text-4xl font-bold-display text-google-red mb-2">
                2
              </span>
              <h4 className="font-bold text-lg leading-tight">
                MASUKKAN<br />URL & PIN
              </h4>
            </div>

            <div className="bg-white border-4 border-google-text p-6 rounded-full aspect-square flex flex-col justify-center shadow-[6px_6px_0px_#111827] mx-auto w-56 relative z-10">
              <span className="text-4xl font-bold-display text-google-green mb-2">
                3
              </span>
              <h4 className="font-bold text-lg leading-tight">
                SIAP<br />DIGUNAKAN!
              </h4>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-24 px-4 bg-google-yellow border-y-4 border-google-text">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold-display text-google-text mb-16 text-center">
            UNTUK BISNIS APA SAJA?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white border-4 border-google-text p-6 rounded-2xl shadow-[8px_8px_0px_#111827] hover:-translate-y-2 transition-transform">
              <h3 className="text-2xl font-bold-display mb-2 text-google-blue">
                RESTORAN & KAFE
              </h3>
              <p className="font-medium text-gray-700">
                Dapatkan ulasan selagi pelanggan menunggu tagihan atau menikmati kopi.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-white border-4 border-google-text p-6 rounded-2xl shadow-[8px_8px_0px_#111827] hover:-translate-y-2 transition-transform">
              <h3 className="text-2xl font-bold-display mb-2 text-google-red">
                KLINIK & SALON
              </h3>
              <p className="font-medium text-gray-700">
                Minta pasien menilai pelayanan langsung setelah selesai sesi pengobatan atau perawatan.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-white border-4 border-google-text p-6 rounded-2xl shadow-[8px_8px_0px_#111827] hover:-translate-y-2 transition-transform">
              <h3 className="text-2xl font-bold-display mb-2 text-google-green">
                TOKO RETAIL
              </h3>
              <p className="font-medium text-gray-700">
                Letakkan di meja kasir. Pelanggan tap saat membayar belanjaan mereka.
              </p>
            </div>
            {/* Card 4 */}
            <div className="bg-white border-4 border-google-text p-6 rounded-2xl shadow-[8px_8px_0px_#111827] hover:-translate-y-2 transition-transform">
              <h3 className="text-2xl font-bold-display mb-2 text-google-text">
                BENGKEL & JASA
              </h3>
              <p className="font-medium text-gray-700">
                Tingkatkan kepercayaan calon pelanggan baru dengan rating tinggi di Maps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold-display text-google-text mb-6">
            PILIH KARTU ANDA
          </h2>
          <p className="text-lg text-gray-700 font-medium mb-12">
            Satu kali bayar. Tanpa biaya bulanan. Bisa dipakai selamanya.
          </p>

          <div className="bg-white border-4 border-google-text p-8 md:p-12 rounded-3xl shadow-[12px_12px_0px_#111827] max-w-2xl mx-auto relative">
            {/* Badge */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-google-red text-white font-bold-display px-6 py-2 border-4 border-google-text rounded-full shadow-[4px_4px_0px_#111827] rotate-2">
              PROMO TERBATAS
            </div>

            <h3 className="text-3xl font-bold-display text-google-text mb-4 mt-4">
              PAKET STANDAR
            </h3>
            <div className="flex justify-center items-end gap-2 mb-8">
              <span className="text-2xl font-bold text-gray-400 line-through">
                Rp 115.000
              </span>
              <span className="text-5xl font-bold-display text-google-green">
                Rp 75.000
              </span>
            </div>

            <ul className="text-left space-y-4 font-bold text-gray-700 mb-10 max-w-sm mx-auto">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 bg-google-green rounded-full border-2 border-google-text flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                1 Kartu NFC dan QR Code
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 bg-google-green rounded-full border-2 border-google-text flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                Bebas ubah link Google Maps
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 bg-google-green rounded-full border-2 border-google-text flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                Perlindungan PIN
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 bg-google-green rounded-full border-2 border-google-text flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                Tanpa biaya langganan
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/6285342181132?text=Halo%20saya%20tertarik%20dengan%20Kartu%20Review%20Pintar"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pesan Kartu via WhatsApp Admin 1"
                className="w-full btn-google-blue !text-lg !py-4 block text-center flex-1"
              >
                PESAN VIA WA (1)
              </a>
              <a
                href="https://wa.me/6281340152851?text=Halo%20saya%20tertarik%20dengan%20Kartu%20Review%20Pintar"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pesan Kartu via WhatsApp Admin 2"
                className="w-full btn-google-blue !text-lg !py-4 block text-center flex-1 !bg-google-green"
              >
                PESAN VIA WA (2)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-google-blue border-y-4 border-google-text text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold-display mb-12 text-center text-white">
            PERTANYAAN UMUM
          </h2>

          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <div className="bg-white text-google-text border-4 border-google-text p-6 rounded-2xl shadow-[8px_8px_0px_#111827]">
              <h4 className="text-xl font-bold-display mb-2">
                Apakah hp pelanggan harus punya NFC?
              </h4>
              <p className="font-medium text-gray-700">
                Untuk fitur tap, ya. Jika hp pelanggan tidak mendukung NFC,
                mereka tetap bisa scan QR code yang tercetak di kartu
                menggunakan kamera hp.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="bg-white text-google-text border-4 border-google-text p-6 rounded-2xl shadow-[8px_8px_0px_#111827]">
              <h4 className="text-xl font-bold-display mb-2">
                Apakah bisa dipakai untuk banyak cabang?
              </h4>
              <p className="font-medium text-gray-700">
                Satu kartu terhubung ke satu link Google Maps. Jika Anda
                memiliki beberapa cabang, gunakan satu kartu untuk
                masing-masing cabang.
              </p>
            </div>

            {/* FAQ Item 3 */}
            <div className="bg-white text-google-text border-4 border-google-text p-6 rounded-2xl shadow-[8px_8px_0px_#111827]">
              <h4 className="text-xl font-bold-display mb-2">
                Bagaimana cara ganti link jika saya pindah lokasi?
              </h4>
              <p className="font-medium text-gray-700">
                Anda cukup tap kartu, masukkan PIN rahasia Anda, lalu masukkan
                link Google Maps yang baru. Prosesnya hanya butuh 10 detik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-24 px-4 bg-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold-display text-google-text mb-6">
            SIAP NAIKKAN RATING ANDA?
          </h2>
          <p className="text-xl text-gray-700 font-medium mb-10">
            Tinggalkan cara lama. Mulai kumpulkan ulasan bintang 5 hari ini.
          </p>
          <a
            href="#harga"
            aria-label="Beli Kartu Sekarang"
            className="inline-flex items-center justify-center gap-2 px-12 py-5 bg-google-blue text-white font-bold-display text-xl uppercase rounded-xl border-4 border-google-text cursor-pointer transition-all shadow-[6px_6px_0px_#111827] hover:-translate-y-2 hover:shadow-[10px_10px_0px_#111827] active:translate-y-1 active:shadow-[2px_2px_0px_#111827]"
          >
            BELI KARTU SEKARANG
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-google-gray border-t-4 border-google-text py-12 px-4 text-center">
        <div className="flex justify-center gap-2 mb-6">
          <div className="w-4 h-4 rounded-full bg-google-blue border-2 border-google-text"></div>
          <div className="w-4 h-4 rounded-full bg-google-red border-2 border-google-text"></div>
          <div className="w-4 h-4 rounded-full bg-google-yellow border-2 border-google-text"></div>
          <div className="w-4 h-4 rounded-full bg-google-green border-2 border-google-text"></div>
        </div>
        <p className="font-bold-display text-google-text text-xl mb-2">
          KARTU REVIEW PINTAR
        </p>
        <p className="font-bold text-gray-500 mb-6">Powered by AKASA DevSign</p>
        <p className="text-sm font-bold text-gray-400">
          &copy; {new Date().getFullYear()} All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
