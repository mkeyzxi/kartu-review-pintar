<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Link extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'store_name',
        'phone_number',
        'url_gmb',
        'is_claimed',
        'pin',
        'is_suspended',
        'expired_at',
    ];

    protected $casts = [
        'is_claimed' => 'boolean',
        'is_suspended' => 'boolean',
        'expired_at' => 'datetime',
    ];

    /**
     * Relasi ke scan logs.
     */
    public function scanLogs()
    {
        return $this->hasMany(ScanLog::class);
    }
}
