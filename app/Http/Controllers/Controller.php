<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

abstract class Controller
{
  protected function getGeoIP(string $ip): array
  {
    $response = Http::get('http://ipwho.is/' . $ip);

    if ($response->successful()) {
      $data = $response->json();

      return [
        'success'     => true,
        'country'     => $data['country'] ?? null,
        'country_code' => $data['country_code'] ?? null,
        'city'        => $data['city'] ?? null,
        'latitude'    => $data['latitude'] ?? null,
        'longitude'   => $data['longitude'] ?? null,
      ];
    }

    return [
      'success'     => false,
      'country'     => null,
      'country_code' => null,
      'city'        => null,
      'latitude'    => null,
      'longitude'   => null,
    ];
  }
}
