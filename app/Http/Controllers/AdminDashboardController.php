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

  /**
   * Download QR Code untuk kartu.
   */
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
}
