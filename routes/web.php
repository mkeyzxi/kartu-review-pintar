<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\LinkEngineController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes – Kartu Review Pintar NFC & QR
|--------------------------------------------------------------------------
*/

// ── Halaman utama (opsional landing page) ──────────────────────────────
Route::get('/', function () {
    return view('welcome');
});

use App\Http\Controllers\AdminDashboardController;

// ── Route Admin Dashboard ──────────────────────────────────────────────
Route::get('/admin/login', [AdminDashboardController::class, 'login'])->name('admin.login');
Route::post('/admin/login', [AdminDashboardController::class, 'authenticate'])->name('admin.authenticate');
Route::post('/admin/logout', [AdminDashboardController::class, 'logout'])->name('admin.logout');

Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
Route::post('/admin/dashboard/update/{id}', [AdminDashboardController::class, 'updateStoreName'])->name('admin.updateStoreName');
Route::post('/admin/dashboard/update-gmb/{id}', [AdminDashboardController::class, 'updateUrlGmb'])->name('admin.updateUrlGmb');
Route::post('/admin/dashboard/suspend/{id}', [AdminDashboardController::class, 'toggleSuspend'])->name('admin.toggleSuspend');
Route::post('/admin/dashboard/expiry/{id}', [AdminDashboardController::class, 'updateExpiry'])->name('admin.updateExpiry');
Route::post('/admin/dashboard/generate', [AdminDashboardController::class, 'generate'])->name('admin.dashboard.generate');
Route::get('/admin/dashboard/qr/{id}', [AdminDashboardController::class, 'downloadQr'])->name('admin.downloadQr');

// ── Route Admin API (Mass Generation via script/Postman) ───────────────
Route::post('/admin/generate', [AdminController::class, 'generate'])
    ->name('admin.generate');

// ── Core Link Engine Routes ────────────────────────────────────────────
// GET  /{slug}      → tampilkan form aktivasi atau redirect ke GMB
// POST /{slug}      → proses aktivasi kartu
// GET  /{slug}/edit → tampilkan form verifikasi PIN
// POST /{slug}/edit → proses verifikasi PIN & update URL

Route::get('/{slug}', [LinkEngineController::class, 'show'])
    ->name('link.show')
    ->where('slug', '[a-zA-Z0-9]+');

Route::post('/{slug}', [LinkEngineController::class, 'activate'])
    ->name('link.activate')
    ->where('slug', '[a-zA-Z0-9]+')
    ->middleware('throttle:10,1');

Route::get('/{slug}/edit', [LinkEngineController::class, 'editVerify'])
    ->name('link.edit.verify')
    ->where('slug', '[a-zA-Z0-9]+');

Route::post('/{slug}/edit', [LinkEngineController::class, 'editUpdate'])
    ->name('link.edit.update')
    ->where('slug', '[a-zA-Z0-9]+')
    ->middleware('throttle:5,1');
