@extends('layouts.app')

@section('title', 'Aktivasi Kartu')

@section('content')

<div class="w-full max-w-lg md:max-w-2xl animate-fade-up" style="animation-delay: 0.1s;">

    {{-- Card utama --}}
    <div class="card-solid p-8">

        {{-- Header --}}
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-google-blue border-2 border-google-text shadow-[4px_4px_0px_#111827]">
                <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
            </div>
            <h1 class="text-3xl font-bold-display text-google-text mb-1">AKTIVASI</h1>
            <p class="text-sm font-bold text-gray-500">ID: <span class="font-mono text-google-blue">{{ strtoupper($link->slug) }}</span></p>
            @if($link->store_name)
                <p class="mt-3 text-sm font-bold-display text-google-green bg-google-green/10 border-2 border-google-green inline-block px-3 py-1 rounded-full shadow-[2px_2px_0px_#34A853]">
                    {{ strtoupper($link->store_name) }}
                </p>
            @endif
        </div>

        {{-- Pesan sukses --}}
        @if (session('success'))
        <div class="mb-5 flex items-start gap-3 rounded-xl p-4 bg-google-green/10 border-2 border-google-green text-google-green font-bold">
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <p class="text-sm">{{ session('success') }}</p>
        </div>
        @endif

        {{-- TOOLTIP / HINT BOX --}}
        <div class="mb-6 rounded-xl p-4 bg-google-yellow/10 border-2 border-google-yellow">
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-google-yellow text-white shadow-[2px_2px_0px_#111827] border border-google-text">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div>
                    <p class="text-sm font-bold-display text-google-text mb-2 tracking-wide">CARA MENDAPATKAN LINK GOOGLE MAPS</p>
                    <ol class="text-xs text-gray-700 font-medium space-y-2 list-none">
                        <li class="flex items-start gap-2">
                            <span class="flex-shrink-0 w-4 h-4 rounded bg-google-text text-white text-[10px] font-bold flex items-center justify-center mt-0.5">1</span>
                            Buka aplikasi Google Maps
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="flex-shrink-0 w-4 h-4 rounded bg-google-text text-white text-[10px] font-bold flex items-center justify-center mt-0.5">2</span>
                            Cari nama bisnis Anda
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="flex-shrink-0 w-4 h-4 rounded bg-google-text text-white text-[10px] font-bold flex items-center justify-center mt-0.5">3</span>
                            Klik tombol Bagikan (Share)
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="flex-shrink-0 w-4 h-4 rounded bg-google-text text-white text-[10px] font-bold flex items-center justify-center mt-0.5">4</span>
                            Pilih Salin Tautan dan tempel di bawah
                        </li>
                    </ol>
                </div>
            </div>
        </div>

        {{-- Form Aktivasi --}}
        <form id="form-aktivasi" action="{{ route('link.activate', $link->slug) }}" method="POST" novalidate class="space-y-6">
            @csrf

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {{-- Input Nama Toko --}}
                <div>
                    <label for="store_name" class="block text-sm font-bold-display text-google-text mb-2">
                        NAMA TOKO / BISNIS <span class="text-gray-400 font-sans font-normal text-xs normal-case">(Opsional)</span>
                    </label>
                    <input
                        type="text"
                        id="store_name"
                        name="store_name"
                        placeholder="Contoh: Kopi Kenangan"
                        value="{{ old('store_name') }}"
                        class="input-field {{ $errors->has('store_name') ? 'error' : '' }}"
                        autocomplete="organization"
                    >
                    @error('store_name')
                        <p class="mt-2 text-xs text-google-red font-bold flex items-center gap-1">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                            </svg>
                            {{ $message }}
                        </p>
                    @enderror
                </div>

                {{-- Input Nomor Telepon --}}
                <div>
                    <label for="phone_number" class="block text-sm font-bold-display text-google-text mb-2">
                        NOMOR TELEPON (WA)
                    </label>
                    <input
                        type="tel"
                        id="phone_number"
                        name="phone_number"
                        placeholder="Contoh: 081234567890"
                        value="{{ old('phone_number') }}"
                        class="input-field {{ $errors->has('phone_number') ? 'error' : '' }}"
                        autocomplete="tel"
                        required
                    >
                    <p class="mt-2 text-xs text-gray-500 font-medium">Berguna jika kami perlu menghubungi Anda.</p>
                    @error('phone_number')
                        <p class="mt-2 text-xs text-google-red font-bold flex items-center gap-1">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                            </svg>
                            {{ $message }}
                        </p>
                    @enderror
                </div>
            </div>

            {{-- Input URL Google Maps --}}
            <div>
                <label for="url_gmb" class="block text-sm font-bold-display text-google-text mb-2">
                    LINK GOOGLE MAPS BISNIS ANDA
                </label>
                <input
                    type="url"
                    id="url_gmb"
                    name="url_gmb"
                    placeholder="https://maps.app.goo.gl/..."
                    value="{{ old('url_gmb') }}"
                    class="input-field {{ $errors->has('url_gmb') ? 'error' : '' }}"
                    autocomplete="off"
                    required
                >
                @error('url_gmb')
                    <p class="mt-2 text-xs text-google-red font-bold flex items-center gap-1">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                        {{ $message }}
                    </p>
                @enderror
            </div>

            {{-- Input PIN --}}
            <div>
                <label for="pin" class="block text-sm font-bold-display text-google-text mb-2">
                    BUAT PIN KARTU (4-6 DIGIT)
                </label>
                <input
                    type="number"
                    id="pin"
                    name="pin"
                    placeholder="Contoh: 123456"
                    class="input-field {{ $errors->has('pin') ? 'error' : '' }}"
                    maxlength="6"
                    min="1000"
                    max="999999"
                    required
                >
                <p class="mt-2 text-xs text-gray-500 font-medium">PIN digunakan untuk mengedit link di kemudian hari.</p>
                @error('pin')
                    <p class="mt-2 text-xs text-google-red font-bold flex items-center gap-1">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                        {{ $message }}
                    </p>
                @enderror
            </div>

            {{-- Submit Button --}}
            <button type="submit" id="btn-submit" class="btn-google-blue">
                <svg id="icon-submit" class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg id="icon-loading" class="w-5 h-5 hidden animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span id="btn-text">AKTIFKAN SEKARANG</span>
            </button>
        </form>

        {{-- Divider + edit link --}}
        <div class="mt-8 pt-6 border-t-2 border-gray-100 text-center">
            <p class="text-sm text-gray-500 font-bold mb-2">Sudah punya kartu aktif?</p>
            <a href="{{ route('link.edit.verify', $link->slug) }}"
               class="inline-flex items-center gap-1 text-sm font-bold-display text-google-blue hover:text-blue-700 transition-colors">
                EDIT / PERBARUI LINK &rarr;
            </a>
        </div>
    </div>
</div>

<script>
    document.getElementById('form-aktivasi').addEventListener('submit', function() {
        document.getElementById('btn-text').textContent = 'MENGAKTIFKAN...';
        document.getElementById('icon-submit').classList.add('hidden');
        document.getElementById('icon-loading').classList.remove('hidden');
        document.getElementById('btn-submit').disabled = true;
        document.getElementById('btn-submit').style.opacity = '0.8';
    });
</script>

@endsection
