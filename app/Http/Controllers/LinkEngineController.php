<?php

namespace App\Http\Controllers;

use App\Models\Link;
use App\Models\ScanLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class LinkEngineController extends Controller
{
    /**
     * Cek status suspend dan expired.
     */
    private function checkStatus($link)
    {
        if ($link->is_suspended) {
            return view('errors.suspended');
        }

        if ($link->expired_at && $link->expired_at <= now()) {
            return view('errors.expired');
        }

        return null;
    }

    /**
     * GET /{slug}
     * Redirect ke GMB jika sudah diklaim, atau tampilkan form aktivasi.
     */
    public function show(string $slug)
    {
        $link = Link::where('slug', $slug)->firstOrFail();

        if ($errorView = $this->checkStatus($link)) {
            return $errorView;
        }

        if ($link->is_claimed) {
            // Catat scan log
            ScanLog::create([
                'link_id'    => $link->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            // Redirect langsung ke Google Maps
            return redirect()->away($link->url_gmb, 302);
        }

        // Kartu belum diklaim – tampilkan form aktivasi
        return view('activate', compact('link'));
    }

    /**
     * POST /{slug}
     * Proses aktivasi kartu.
     */
    public function activate(Request $request, string $slug)
    {
        $link = Link::where('slug', $slug)->firstOrFail();

        if ($errorView = $this->checkStatus($link)) {
            return $errorView;
        }

        if ($link->is_claimed) {
            return redirect()->route('link.show', $slug);
        }

        $validated = $request->validate([
            'url_gmb' => [
                'required', 
                'url', 
                'max:2048',
                'regex:/^https?:\/\/(?:[a-zA-Z0-9-]+\.)*(?:google\.com|goo\.gl|vercel\.app|netlify\.app|makbuln\.web\.id)(?:\/|$)/i'
            ],
            'store_name' => ['nullable', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'max:20'],
            'pin'     => ['required', 'digits_between:4,6'],
        ], [
            'url_gmb.required' => 'Link URL wajib diisi.',
            'url_gmb.url'      => 'Format URL tidak valid. Pastikan diawali https://',
            'url_gmb.regex'    => 'Link harus berupa URL dari Google Maps, Vercel, Netlify, atau makbuln.web.id.',
            'phone_number.required' => 'Nomor Telepon wajib diisi.',
            'pin.required'     => 'PIN wajib diisi.',
            'pin.digits_between' => 'PIN harus berupa angka 4–6 digit.',
        ]);

        $link->update([
            'url_gmb'      => $validated['url_gmb'],
            'store_name'   => $validated['store_name'],
            'phone_number' => $validated['phone_number'],
            'pin'          => Hash::make($validated['pin']),
            'is_claimed'   => true,
        ]);

        return view('success', compact('link'))
            ->with('success', 'Kartu Aktif! Silakan scan ulang kartu Anda untuk langsung diarahkan ke Google Maps.');
    }

    /**
     * GET /{slug}/edit
     * Tampilkan form verifikasi PIN untuk edit.
     */
    public function editVerify(string $slug)
    {
        $link = Link::where('slug', $slug)->firstOrFail();

        if ($errorView = $this->checkStatus($link)) {
            return $errorView;
        }

        if (! $link->is_claimed) {
            return redirect()->route('link.show', $slug);
        }

        return view('edit-verify', compact('link'));
    }

    /**
     * POST /{slug}/edit
     * Verifikasi PIN, lalu tampilkan form edit atau proses update URL.
     */
    public function editUpdate(Request $request, string $slug)
    {
        $link = Link::where('slug', $slug)->firstOrFail();

        if ($errorView = $this->checkStatus($link)) {
            return $errorView;
        }

        if (! $link->is_claimed) {
            return redirect()->route('link.show', $slug);
        }

        // Step 1: Verifikasi PIN saja (belum ada url_gmb baru)
        if (! $request->has('url_gmb')) {
            $request->validate([
                'pin' => ['required', 'digits_between:4,6'],
            ], [
                'pin.required'       => 'PIN wajib diisi.',
                'pin.digits_between' => 'PIN harus berupa angka 4–6 digit.',
            ]);

            if (! Hash::check($request->pin, $link->pin)) {
                return back()->withErrors(['pin' => 'PIN yang Anda masukkan salah. Coba lagi.'])->withInput();
            }

            // PIN valid – tampilkan form edit URL
            return view('edit-form', compact('link'));
        }

        // Step 2: Update URL (PIN sudah diverifikasi di step sebelumnya, re-verify untuk keamanan)
        $request->validate([
            'pin'     => ['required', 'digits_between:4,6'],
            'url_gmb' => [
                'required', 
                'url', 
                'max:2048',
                'regex:/^https?:\/\/(?:[a-zA-Z0-9-]+\.)*(?:google\.com|goo\.gl|vercel\.app|netlify\.app|makbuln\.web\.id)(?:\/|$)/i'
            ],
        ], [
            'url_gmb.required' => 'Link URL wajib diisi.',
            'url_gmb.url'      => 'Format URL tidak valid. Pastikan diawali https://',
            'url_gmb.regex'    => 'Link harus berupa URL dari Google Maps, Vercel, Netlify, atau makbuln.web.id.',
            'pin.required'     => 'PIN wajib diisi.',
            'pin.digits_between' => 'PIN harus berupa angka 4–6 digit.',
        ]);

        if (! Hash::check($request->pin, $link->pin)) {
            return back()->withErrors(['pin' => 'Sesi verifikasi PIN tidak valid. Silakan mulai ulang.'])->withInput();
        }

        $link->update(['url_gmb' => $request->url_gmb]);

        return redirect()->route('link.show', $slug)
            ->with('success', 'Link Google Maps berhasil diperbarui!');
    }
}
