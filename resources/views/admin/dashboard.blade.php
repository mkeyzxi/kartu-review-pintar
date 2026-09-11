@extends('layouts.app')

@section('title', 'Admin Dashboard')

@section('content')
<div class="w-full max-w-[1400px] mx-auto animate-fade-up" style="animation-delay: 0.1s;">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 class="text-4xl font-bold-display text-google-text">ADMIN DASHBOARD</h1>
            <p class="text-gray-500 font-medium mt-1">Pantau performa dan kelola kartu review pintar.</p>
        </div>
        <form action="{{ route('admin.logout') }}" method="POST">
            @csrf
            <button type="submit" class="bg-gray-200 hover:bg-gray-300 text-google-text font-bold-display px-4 py-2 rounded-lg border-2 border-google-text shadow-[4px_4px_0px_rgba(17,24,39,0.1)] transition-all">
                LOGOUT
            </button>
        </form>
    </div>

    @if (session('success'))
        <div class="bg-google-green/10 border-2 border-google-green text-google-green p-4 rounded-lg mb-8 font-bold">
            {{ session('success') }}
        </div>
    @endif

    {{-- Statistik --}}
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div class="card-solid p-6 flex flex-col">
            <span class="text-gray-500 font-bold mb-2">TOTAL KARTU</span>
            <span class="text-5xl font-bold-display text-google-text">{{ $totalCards }}</span>
        </div>
        <div class="card-solid p-6 flex flex-col border-google-green shadow-[8px_8px_0px_#34A853]">
            <span class="text-google-green font-bold mb-2">SUDAH AKTIF</span>
            <span class="text-5xl font-bold-display text-google-text">{{ $activeCards }}</span>
        </div>
        <div class="card-solid p-6 flex flex-col border-gray-400 shadow-[8px_8px_0px_#9CA3AF]">
            <span class="text-gray-500 font-bold mb-2">BELUM AKTIF</span>
            <span class="text-5xl font-bold-display text-google-text">{{ $inactiveCards }}</span>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {{-- Form Generate Massal --}}
        <div class="lg:col-span-1 card-solid p-6 bg-gray-50 flex flex-col justify-between">
            <div>
                <h2 class="text-xl font-bold-display text-google-text mb-4">GENERATE KARTU BARU</h2>
                <form action="{{ route('admin.dashboard.generate') }}" method="POST" class="flex flex-col gap-4">
                    @csrf
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">NAMA TOKO (Opsional)</label>
                        <input type="text" name="store_name" class="input-field bg-white" placeholder="Misal: Kopi Kenangan">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">JUMLAH KARTU</label>
                        <input type="number" name="count" class="input-field bg-white" min="1" max="500" value="1" required>
                    </div>
                    <button type="submit" class="btn-google-blue mt-2">
                        GENERATE
                    </button>
                </form>
            </div>
        </div>

        {{-- Filter & Search --}}
        <div class="lg:col-span-2 card-solid p-6 bg-white flex flex-col justify-center">
            <h2 class="text-xl font-bold-display text-google-text mb-4">PENCARIAN & FILTER</h2>
            <form method="GET" action="{{ route('admin.dashboard') }}" class="flex flex-col sm:flex-row gap-4">
                <div class="flex-1">
                    <label class="block text-sm font-bold text-gray-700 mb-2">CARI TOKO / SLUG</label>
                    <input type="text" name="search" value="{{ request('search') }}" class="input-field" placeholder="Cari...">
                </div>
                <div class="sm:w-1/3">
                    <label class="block text-sm font-bold text-gray-700 mb-2">STATUS</label>
                    <select name="status" class="input-field cursor-pointer">
                        <option value="">Semua Status</option>
                        <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Aktif</option>
                        <option value="inactive" {{ request('status') == 'inactive' ? 'selected' : '' }}>Belum Aktif</option>
                        <option value="suspended" {{ request('status') == 'suspended' ? 'selected' : '' }}>Ditangguhkan (Suspend)</option>
                        <option value="expired" {{ request('status') == 'expired' ? 'selected' : '' }}>Kedaluwarsa</option>
                    </select>
                </div>
                <div class="flex items-end">
                    <button type="submit" class="bg-google-text text-white font-bold px-6 py-[14px] rounded-lg border-2 border-google-text shadow-[4px_4px_0px_#111827] hover:bg-gray-800 h-[52px]">
                        Terapkan
                    </button>
                </div>
            </form>
        </div>
    </div>

    {{-- Tabel Data --}}
    <div class="card-solid overflow-hidden mb-8">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr class="bg-gray-100 border-b-2 border-google-text">
                        <th class="p-4 font-bold-display text-sm w-32">KODE</th>
                        <th class="p-4 font-bold-display text-sm">INFO TOKO</th>
                        <th class="p-4 font-bold-display text-sm w-48">STATUS & EXPIRED</th>
                        <th class="p-4 font-bold-display text-sm w-64">KONTROL ADMIN</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($links as $link)
                    <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td class="p-4 align-top">
                            <span class="font-mono bg-gray-200 px-2 py-1 rounded text-sm font-bold block text-center border border-gray-300">{{ $link->slug }}</span>
                            <a href="{{ url('/'.$link->slug) }}" target="_blank" class="text-[11px] text-google-blue font-bold hover:underline mt-2 text-center block mb-2">Test Link &rarr;</a>
                            
                            <a href="{{ route('admin.downloadQr', $link->id) }}" class="text-[10px] bg-white border border-gray-300 text-gray-700 font-bold py-1 px-2 rounded block text-center hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download QR
                            </a>

                            <div class="text-[10px] text-gray-400 mt-2 text-center">{{ $link->created_at->format('d/m/Y') }}</div>
                        </td>
                        
                        <td class="p-4 align-top">
                            <form action="{{ route('admin.updateStoreName', $link->id) }}" method="POST" class="mb-3">
                                @csrf
                                <label class="text-xs font-bold text-gray-500 block mb-1">NAMA TOKO:</label>
                                <div class="flex gap-2">
                                    <input type="text" name="store_name" value="{{ $link->store_name }}" class="input-field !py-1 !px-2 !text-sm flex-1 bg-white" placeholder="Belum ada nama">
                                    <button type="submit" class="bg-google-text text-white px-3 py-1 rounded font-bold text-xs hover:bg-gray-800">SIMPAN</button>
                                </div>
                            </form>

                            <div class="mt-3">
                                <form action="{{ route('admin.updateUrlGmb', $link->id) }}" method="POST">
                                    @csrf
                                    <label class="text-xs font-bold text-gray-500 block mb-1">URL GOOGLE MAPS:</label>
                                    <div class="flex gap-2">
                                        <input type="url" name="url_gmb" value="{{ $link->url_gmb }}" class="input-field !py-1 !px-2 !text-sm flex-1 bg-white" placeholder="https://maps.app.goo.gl/..." title="{{ $link->url_gmb }}">
                                        <button type="submit" class="bg-google-text text-white px-3 py-1 rounded font-bold text-xs hover:bg-gray-800">SIMPAN</button>
                                    </div>
                                    @if($link->url_gmb)
                                        <div class="mt-1">
                                            <a href="{{ $link->url_gmb }}" target="_blank" class="text-[10px] text-google-blue font-bold hover:underline">Tes Link Maps &rarr;</a>
                                        </div>
                                    @endif
                                </form>
                            </div>
                        </td>
                        
                        <td class="p-4 align-top">
                            {{-- Status Aktif/Belum --}}
                            <div class="mb-2">
                                @if($link->is_suspended)
                                    <span class="inline-block bg-google-red/20 text-google-red border-2 border-google-red font-bold px-3 py-1 rounded-full text-xs">DITANGGUHKAN</span>
                                @elseif($link->expired_at && $link->expired_at <= now())
                                    <span class="inline-block bg-google-yellow/20 text-google-yellow border-2 border-google-yellow font-bold px-3 py-1 rounded-full text-xs">EXPIRED</span>
                                @elseif($link->is_claimed)
                                    <span class="inline-block bg-google-green/20 text-google-green border-2 border-google-green font-bold px-3 py-1 rounded-full text-xs">AKTIF</span>
                                @else
                                    <span class="inline-block bg-gray-200 text-gray-500 border-2 border-gray-300 font-bold px-3 py-1 rounded-full text-xs">BELUM AKTIF</span>
                                @endif
                            </div>

                            <div class="text-xs font-bold text-gray-600 mt-3">
                                Berakhir Pada:<br>
                                @if($link->expired_at)
                                    <span class="{{ $link->expired_at <= now() ? 'text-google-red' : 'text-google-blue' }}">
                                        {{ $link->expired_at->format('d M Y, H:i') }}
                                    </span>
                                @else
                                    <span class="text-gray-400">Selamanya (Tanpa Batas)</span>
                                @endif
                            </div>
                        </td>

                        <td class="p-4 align-top">
                            <div class="flex flex-col gap-3">
                                {{-- Form Update Expiry --}}
                                <form action="{{ route('admin.updateExpiry', $link->id) }}" method="POST" class="bg-gray-100 p-2 rounded border border-gray-200">
                                    @csrf
                                    <label class="text-[10px] font-bold text-gray-500 block mb-1">UBAH MASA BERLAKU:</label>
                                    <div class="flex gap-2">
                                        <input type="datetime-local" name="expired_at" value="{{ $link->expired_at ? $link->expired_at->format('Y-m-d\TH:i') : '' }}" class="input-field !py-1 !px-2 !text-xs flex-1 bg-white">
                                        <button type="submit" class="bg-google-blue text-white px-2 py-1 rounded font-bold text-[10px] hover:bg-blue-600">SET</button>
                                    </div>
                                    <p class="text-[9px] text-gray-400 mt-1">*Kosongkan untuk selamanya</p>
                                </form>

                                {{-- Form Toggle Suspend --}}
                                <form action="{{ route('admin.toggleSuspend', $link->id) }}" method="POST">
                                    @csrf
                                    @if($link->is_suspended)
                                        <button type="submit" class="w-full bg-google-green text-white font-bold py-2 rounded text-xs border-2 border-google-green hover:bg-green-600 transition-colors shadow-[2px_2px_0px_#111827]">
                                            BUKA SUSPEND
                                        </button>
                                    @else
                                        <button type="submit" class="w-full bg-google-red text-white font-bold py-2 rounded text-xs border-2 border-google-red hover:bg-red-700 transition-colors shadow-[2px_2px_0px_#111827]" onclick="return confirm('Yakin ingin menangguhkan akses toko ini?')">
                                            SUSPEND TOKO
                                        </button>
                                    @endif
                                </form>
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="4" class="p-8 text-center text-gray-500 font-bold">Tidak ada kartu yang ditemukan.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        {{-- Paginasi --}}
        @if($links->hasPages())
        <div class="p-4 border-t-2 border-gray-200 bg-gray-50">
            {{ $links->links() }}
        </div>
        @endif
    </div>
</div>
@endsection
