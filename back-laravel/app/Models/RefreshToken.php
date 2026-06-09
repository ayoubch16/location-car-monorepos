<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modèle RefreshToken — stocke les refresh tokens des utilisateurs.
 * Correspond à la table "refresh_tokens" en base de données.
 *
 * Sécurité : seul le hash SHA-256 du token est stocké en base.
 * Le token en clair est envoyé une seule fois au client (comme un mot de passe).
 */
class RefreshToken extends Model
{
    protected $fillable = [
        'user_id',    // ID de l'utilisateur propriétaire du token
        'token',      // Hash SHA-256 du refresh token (jamais le token en clair)
        'expires_at', // Date d'expiration (30 jours après création)
    ];

    // Convertit automatiquement expires_at en objet Carbon pour utiliser isPast(), etc.
    protected $casts = [
        'expires_at' => 'datetime',
    ];

    /**
     * Relation : un refresh token appartient à un utilisateur.
     * Permet : $refreshToken->user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Vérifie si ce refresh token est expiré.
     * isPast() retourne true si la date est dans le passé.
     * Utilisé dans AuthController::refresh() pour rejeter les tokens expirés.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}
