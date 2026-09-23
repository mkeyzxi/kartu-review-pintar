@extends('layouts.app')

@section('title', 'Analytics Dashboard')

@section('content')
<div class="w-full max-w-[1400px] mx-auto animate-fade-up" style="animation-delay: 0.1s;">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 class="text-4xl font-bold-display text-google-text">ANALYTICS</h1>
            <p class="text-gray-500 font-medium mt-1">Ringkasan penggunaan kartu dan traffic redirect.</p>
        </div>
        <div class="flex gap-4">
            <a href="{{ route('admin.dashboard') }}" class="bg-gray-200 hover:bg-gray-300 text-google-text font-bold-display px-4 py-2 rounded-lg border-2 border-google-text shadow-[4px_4px_0px_rgba(17,24,39,0.1)] transition-all">
                KEMBALI
            </a>
        </div>
    </div>

    {{-- Ringkasan --}}
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div class="card-solid p-6 flex flex-col border-google-blue shadow-[8px_8px_0px_#4285F4]">
            <span class="text-google-blue font-bold mb-2">TOTAL SCAN</span>
            <span class="text-5xl font-bold-display text-google-text">{{ number_format($totalScans, 0, ',', '.') }}</span>
        </div>
        <div class="card-solid p-6 flex flex-col border-google-green shadow-[8px_8px_0px_#34A853]">
            <span class="text-google-green font-bold mb-2">HARI INI</span>
            <span class="text-5xl font-bold-display text-google-text">{{ number_format($todayScans, 0, ',', '.') }}</span>
        </div>
        <div class="card-solid p-6 flex flex-col border-google-yellow shadow-[8px_8px_0px_#FBBC05]">
            <span class="text-google-yellow font-bold mb-2">BULAN INI</span>
            <span class="text-5xl font-bold-display text-google-text">{{ number_format($monthScans, 0, ',', '.') }}</span>
        </div>
    </div>

    {{-- Filter --}}
    @if($availableYears->isNotEmpty())
    <div class="card-solid p-6 bg-white mb-8">
        <h2 class="text-xl font-bold-display text-google-text mb-4">FILTER WAKTU</h2>
        <form method="GET" action="{{ route('admin.analytics') }}" class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
                <label class="block text-sm font-bold text-gray-700 mb-2">TAHUN</label>
                <select name="year" class="input-field cursor-pointer" onchange="this.form.submit()">
                    <option value="">Semua Tahun</option>
                    @foreach($availableYears as $year)
                        <option value="{{ $year }}" {{ request('year') == $year ? 'selected' : '' }}>{{ $year }}</option>
                    @endforeach
                </select>
            </div>

            @if($availableMonths->isNotEmpty())
            <div class="flex-1">
                <label class="block text-sm font-bold text-gray-700 mb-2">BULAN</label>
                <select name="month" class="input-field cursor-pointer" onchange="this.form.submit()">
                    <option value="">Semua Bulan</option>
                    @foreach($availableMonths as $month)
                        <option value="{{ $month }}" {{ request('month') == $month ? 'selected' : '' }}>
                            {{ \Carbon\Carbon::create()->month($month)->translatedFormat('F') }}
                        </option>
                    @endforeach
                </select>
            </div>
            @endif

            @if($availableDays->isNotEmpty())
            <div class="flex-1">
                <label class="block text-sm font-bold text-gray-700 mb-2">HARI TANGGAL</label>
                <select name="day" class="input-field cursor-pointer" onchange="this.form.submit()">
                    <option value="">Semua Hari</option>
                    @foreach($availableDays as $day)
                        <option value="{{ $day }}" {{ request('day') == $day ? 'selected' : '' }}>{{ $day }}</option>
                    @endforeach
                </select>
            </div>
            @endif

            @if(request('year') || request('month') || request('day'))
            <div class="flex items-end">
                <a href="{{ route('admin.analytics') }}" class="bg-gray-200 hover:bg-gray-300 text-google-text font-bold px-6 py-[14px] rounded-lg border-2 border-gray-400 h-[52px] flex items-center justify-center">
                    Reset
                </a>
            </div>
            @endif
        </form>
    </div>
    @endif

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {{-- Grafik Penggunaan 7 Hari --}}
        <div class="card-solid p-6 bg-white">
            <h2 class="text-xl font-bold-display text-google-text mb-6">SCAN 7 HARI TERAKHIR</h2>
            <div class="relative h-64 w-full">
                <canvas id="scanChart"></canvas>
            </div>
        </div>

        {{-- Statistik Kartu (Top Active) --}}
        <div class="card-solid p-6 bg-white">
            <h2 class="text-xl font-bold-display text-google-text mb-6">KARTU TERAKTIF</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b-2 border-gray-200">
                            <th class="pb-3 text-sm font-bold text-gray-500">LABEL / LOKASI</th>
                            <th class="pb-3 text-sm font-bold text-gray-500">KODE</th>
                            <th class="pb-3 text-sm font-bold text-gray-500 text-right">TOTAL SCAN</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($topCards as $log)
                        <tr class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                            <td class="py-3 font-bold text-google-text">
                                {{ $log->link->label ?? 'Tanpa Label' }}
                            </td>
                            <td class="py-3">
                                <span class="font-mono bg-gray-100 px-2 py-1 rounded text-xs border border-gray-300">
                                    {{ $log->link->slug ?? '-' }}
                                </span>
                            </td>
                            <td class="py-3 text-right font-bold-display text-google-blue">
                                {{ number_format($log->total_scan, 0, ',', '.') }}
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="3" class="py-4 text-center text-gray-500">Belum ada data scan.</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    {{-- Detail Aktivitas --}}
    <div class="card-solid p-6 bg-white">
        <h2 class="text-xl font-bold-display text-google-text mb-6">AKTIVITAS TERBARU</h2>
        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead>
                    <tr class="border-b-2 border-gray-200 bg-gray-50">
                        <th class="p-3 text-sm font-bold text-gray-500">WAKTU</th>
                        <th class="p-3 text-sm font-bold text-gray-500">KARTU</th>
                        <th class="p-3 text-sm font-bold text-gray-500">DEVICE & BROWSER</th>
                        <th class="p-3 text-sm font-bold text-gray-500">STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($recentScans as $scan)
                    <tr class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td class="p-3 text-sm font-bold text-gray-700">
                            {{ $scan->created_at->format('d/m/Y H:i') }}
                        </td>
                        <td class="p-3">
                            <div class="font-bold text-sm">{{ $scan->link->label ?? 'Tanpa Label' }}</div>
                            <div class="font-mono text-xs text-gray-500">{{ $scan->link->slug ?? '-' }}</div>
                        </td>
                        <td class="p-3">
                            <div class="text-sm">
                                <span class="font-bold capitalize">{{ $scan->device_type ?? 'Unknown' }}</span> 
                                - {{ $scan->browser ?? 'Unknown' }}
                            </div>
                        </td>
                        <td class="p-3">
                            @if($scan->status === 'valid')
                                <span class="inline-block bg-google-green/20 text-google-green font-bold px-2 py-1 rounded text-[10px] border border-google-green">VALID</span>
                            @else
                                <span class="inline-block bg-google-yellow/20 text-google-yellow font-bold px-2 py-1 rounded text-[10px] border border-google-yellow">{{ strtoupper($scan->status) }}</span>
                            @endif
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="4" class="p-6 text-center text-gray-500 font-bold">Belum ada aktivitas.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

{{-- Script Chart.js --}}
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const ctx = document.getElementById('scanChart').getContext('2d');
        
        // Urutan sudah kronologis dari controller (kiri ke kanan)
        const labels = {!! json_encode($chartLabels) !!};
        const data = {!! json_encode($chartData) !!};

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Scan',
                    data: data,
                    backgroundColor: '#4285F4', // google-blue
                    borderColor: '#111827',
                    borderWidth: 2,
                    borderRadius: 4,
                    hoverBackgroundColor: '#3367d6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0 // Hanya tampilkan angka bulat
                        },
                        grid: {
                            color: '#f3f4f6'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    });
</script>
@endsection
