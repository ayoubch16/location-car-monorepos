<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'nom', 'prenom', 'email', 'password',
        'telephone', 'adresse', 'num_permis', 'date_naissance', 'role',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_naissance'    => 'date',
        'password'          => 'hashed',
    ];

    public function isAdmin(): bool { return $this->role === 'admin'; }
    public function isClient(): bool { return $this->role === 'client'; }

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }

    public function refreshTokens(): HasMany
    {
        return $this->hasMany(RefreshToken::class);
    }
}
