<?php

namespace App\Http\Controllers;

use App\Models\Link;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminDashboardController extends Controller
{
  /**
   * Tampilkan form login.
   */
  public function login()
  {
    if (session('admin_logged_in')) {
      return redirect()->route('admin.dashboard');
    }
    return view('admin.login');
  }

  /**
   * Proses otentikasi login admin.
   */
  public function authenticate(Request $request)
  {
    $adminSecret = config('app.admin_secret', 'GANTI_SECRET_INI');

    if ($request->input('secret') === $adminSecret) {
      session(['admin_logged_in' => true]);
      return redirect()->route('admin.dashboard')->with('success', 'Login berhasil.');
    }

    return back()->withErrors(['secret' => 'Secret key tidak valid.']);
  }

  /**
   * Logout admin.
   */
  public function logout()
  {
    session()->forget('admin_logged_in');
    return redirect()->route('admin.login');
  }

  /**
   * Tampilkan halaman dashboard.
   */
  public function index(Request $request)
  {
    if (!session('admin_logged_in')) {
      return redirect()->route('admin.login');
    }

    $query = Link::query();

    // Fitur Pencarian
    if ($search = $request->input('search')) {
      $query->where(function ($q) use ($search) {
        $q->where('slug', 'like', "%{$search}%")
          ->orWhere('store_name', 'like', "%{$search}%");
      });
    }

    // Fitur Filter Status
    if ($status = $request->input('status')) {
      $now = now();
      if ($status === 'active') {
        $query->where('is_claimed', true)
          ->where('is_suspended', false)
          ->where(function ($q) use ($now) {
            $q->whereNull('expired_at')->orWhere('expired_at', '>', $now);
          });
      } elseif ($status === 'inactive') {
        $query->where('is_claimed', false);
      } elseif ($status === 'suspended') {
        $query->where('is_suspended', true);
      } elseif ($status === 'expired') {
        $query->whereNotNull('expired_at')->where('expired_at', '<=', $now);
      }
    }

    // Paginasi 20 item
    $links = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();

    // Hitung statistik untuk header
    $totalCards = Link::count();
    $activeCards = Link::where('is_claimed', true)->count();
    $inactiveCards = Link::where('is_claimed', false)->count();

    return view('admin.dashboard', compact('links', 'totalCards', 'activeCards', 'inactiveCards'));
  }

  /**
   * Toggle status suspend toko.
   */
  public function toggleSuspend(Request $request, $id)
  {
    if (!session('admin_logged_in')) {
      abort(403);
    }

    $link = Link::findOrFail($id);
    $link->update([
      'is_suspended' => !$link->is_suspended,
    ]);

    $status = $link->is_suspended ? 'ditangguhkan' : 'diaktifkan kembali';
    return back()->with('success', "Toko berhasil {$status}.");
  }

  /**
   * Update masa berlangganan (expired_at).
   */
  public function updateExpiry(Request $request, $id)
  {
    if (!session('admin_logged_in')) {
      abort(403);
    }

    $request->validate([
      'expired_at' => 'nullable|date',
    ]);

    $link = Link::findOrFail($id);
    $link->update([
      'expired_at' => $request->expired_at,
    ]);

    return back()->with('success', 'Masa berlangganan berhasil diperbarui.');
  }

  /**
   * Update nama toko untuk sebuah link.
   */
  public function updateStoreName(Request $request, $id)
  {
    if (!session('admin_logged_in')) {
      abort(403);
    }

    $request->validate([
      'store_name' => 'nullable|string|max:255',
    ]);

    $link = Link::findOrFail($id);
    $link->update([
      'store_name' => $request->store_name,
    ]);

    return back()->with('success', 'Nama toko berhasil diperbarui.');
  }

  /**
   * Update URL Google Maps untuk sebuah link.
   */
  public function updateUrlGmb(Request $request, $id)
  {
    if (!session('admin_logged_in')) {
      abort(403);
    }

    $request->validate([
      'url_gmb' => 'nullable|url|max:2000',
    ], [
      'url_gmb.url' => 'Format URL Google Maps tidak valid.'
    ]);

    $link = Link::findOrFail($id);
    $link->update([
      'url_gmb' => $request->url_gmb,
    ]);

    return back()->with('success', 'URL Google Maps berhasil diperbarui.');
  }

  /**
   * Generate kartu/slug baru dari dashboard.
   */
  public function generate(Request $request)
  {
    if (!session('admin_logged_in')) {
      abort(403);
    }

    $count = (int) $request->input('count', 1);
    $count = max(1, min($count, 500)); // Batasi 1-500
    $storeName = $request->input('store_name');

    $generated = [];
    $insertData = [];
    $attempts  = 0;
    $now       = now();

    while (count($generated) < $count && $attempts < ($count * 5)) {
      $slug = strtolower(Str::random(8));
      $attempts++;

      if (!in_array($slug, $generated) && !Link::where('slug', $slug)->exists()) {
        $generated[] = $slug;
        $insertData[] = [
          'slug'       => $slug,
          'store_name' => $storeName,
          'url_gmb'    => null,
          'is_claimed' => false,
          'pin'        => null,
          'created_at' => $now,
          'updated_at' => $now,
        ];
      }
    }

    if (!empty($insertData)) {
      Link::insert($insertData);
    }

    return back()->with('success', count($generated) . ' kartu baru berhasil dibuat.');
  }

  public function downloadQr($id)
  {
    if (!session('admin_logged_in')) {
      abort(403);
    }

    $link = Link::findOrFail($id);
    $url = url('/' . $link->slug);

    $qrCode = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')
      ->size(500)
      ->margin(1)
      ->generate($url);

    return response($qrCode)
      ->header('Content-type', 'image/png')
      ->header('Content-Disposition', 'attachment; filename="qrcode-' . $link->slug . '.png"');
  }

  /**
   * Update label kartu (lokasi/penempatan).
   */
  public function updateLabel(Request $request, $id)
  {
    if (!session('admin_logged_in')) {
      abort(403);
    }

    $request->validate([
      'label' => 'nullable|string|max:100',
    ]);

    $link = Link::findOrFail($id);
    $link->update([
      'label' => $request->label,
    ]);

    return back()->with('success', 'Label kartu berhasil diperbarui.');
  }

  public function analytics(Request $request)
  {
    if (!session('admin_logged_in')) {
      return redirect()->route('admin.login');
    }

    $availableYears = \App\Models\ScanLog::where('status', 'valid')->selectRaw('YEAR(created_at) as year')->distinct()->orderByDesc('year')->pluck('year');
    $availableMonths = collect();
    $availableDays = collect();

    $selectedYear = $request->input('year');
    $selectedMonth = $request->input('month');
    $selectedDay = $request->input('day');

    if ($selectedYear) {
      $availableMonths = \App\Models\ScanLog::where('status', 'valid')->whereYear('created_at', $selectedYear)->selectRaw('MONTH(created_at) as month')->distinct()->orderBy('month')->pluck('month');
    }
    if ($selectedYear && $selectedMonth) {
      $availableDays = \App\Models\ScanLog::where('status', 'valid')->whereYear('created_at', $selectedYear)->whereMonth('created_at', $selectedMonth)->selectRaw('DAY(created_at) as day')->distinct()->orderBy('day')->pluck('day');
    }

    $baseQuery = \App\Models\ScanLog::where('status', 'valid');
    if ($selectedYear) $baseQuery->whereYear('created_at', $selectedYear);
    if ($selectedMonth) $baseQuery->whereMonth('created_at', $selectedMonth);
    if ($selectedDay) {
        $formattedDate = sprintf('%04d-%02d-%02d', $selectedYear, $selectedMonth, $selectedDay);
        $baseQuery->whereDate('created_at', $formattedDate);
    }

    $totalScans = (clone $baseQuery)->count();
    $todayScans = \App\Models\ScanLog::where('status', 'valid')->whereDate('created_at', today())->count();
    $monthScans = \App\Models\ScanLog::where('status', 'valid')->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count();

    // Data grafik dinamis
    $chartLabels = [];
    $chartData = [];

    if ($selectedYear && $selectedMonth && $selectedDay) {
      // Grafik per jam dalam 1 hari
      $formattedDate = sprintf('%04d-%02d-%02d', $selectedYear, $selectedMonth, $selectedDay);
      $hourlyData = \App\Models\ScanLog::where('status', 'valid')->whereDate('created_at', $formattedDate)
        ->selectRaw('HOUR(created_at) as hour, count(*) as total')
        ->groupBy('hour')->pluck('total', 'hour')->toArray();
      for ($i = 0; $i < 24; $i++) {
        $chartLabels[] = sprintf('%02d:00', $i);
        $chartData[] = $hourlyData[$i] ?? 0;
      }
    } elseif ($selectedYear && $selectedMonth) {
      // Grafik per hari dalam 1 bulan
      $daysInMonth = \Carbon\Carbon::createFromDate($selectedYear, $selectedMonth, 1)->daysInMonth;
      $dailyData = \App\Models\ScanLog::where('status', 'valid')->whereYear('created_at', $selectedYear)->whereMonth('created_at', $selectedMonth)
        ->selectRaw('DAY(created_at) as day, count(*) as total')
        ->groupBy('day')->pluck('total', 'day')->toArray();
      for ($i = 1; $i <= $daysInMonth; $i++) {
        $chartLabels[] = $i;
        $chartData[] = $dailyData[$i] ?? 0;
      }
    } elseif ($selectedYear) {
      // Grafik per bulan dalam 1 tahun
      $monthlyData = \App\Models\ScanLog::where('status', 'valid')->whereYear('created_at', $selectedYear)
        ->selectRaw('MONTH(created_at) as month, count(*) as total')
        ->groupBy('month')->pluck('total', 'month')->toArray();
      $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      for ($i = 1; $i <= 12; $i++) {
        $chartLabels[] = $monthNames[$i-1];
        $chartData[] = $monthlyData[$i] ?? 0;
      }
    } else {
      // Default: Grafik 7 hari terakhir
      for ($i = 6; $i >= 0; $i--) {
        $date = now()->subDays($i);
        $chartLabels[] = $date->translatedFormat('D');
        $chartData[] = \App\Models\ScanLog::where('status', 'valid')->whereDate('created_at', $date)->count();
      }
    }

    // Kartu paling sering digunakan (berdasarkan filter)
    $topCards = (clone $baseQuery)
      ->selectRaw('link_id, count(*) as total_scan')
      ->groupBy('link_id')
      ->orderByDesc('total_scan')
      ->take(10)
      ->with('link')
      ->get();

    // Aktivitas terbaru (berdasarkan filter)
    $recentScans = (clone $baseQuery)
      ->with('link')
      ->orderByDesc('created_at')
      ->take(10)
      ->get();

    return view('admin.analytics', compact(
      'totalScans',
      'todayScans',
      'monthScans',
      'chartLabels',
      'chartData',
      'topCards',
      'recentScans',
      'availableYears',
      'availableMonths',
      'availableDays',
      'selectedYear',
      'selectedMonth',
      'selectedDay'
    ));
  }
}
