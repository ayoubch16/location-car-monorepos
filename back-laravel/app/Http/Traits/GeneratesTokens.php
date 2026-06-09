<?php

namespace App\Http\Traits;

use App\Models\User;
use Illuminate\Support\Str;

/**
 * Trait GeneratesTokens
 * Partagé entre AuthController et PasswordResetController.
 * Centralise la création du couple access_token + refresh_token
 * pour éviter la duplication de code.
 */
trait GeneratesTokens
{
    // Durée de vie du refresh token : 30 jours
    private const REFRESH_TOKEN_TTL_DAYS = 30;

    /**
     * Génère un nouveau couple de tokens pour l'utilisateur donné.
     * Révoque d'abord tous ses anciens tokens (access + refresh)
     * pour qu'une seule session soit active à la fois.
     *
     * Retourne un tableau prêt à être fusionné dans une réponse JSON.
     */
    protected function generateTokenPair(User $user): array
    {
        // Supprime tous les anciens access tokens Sanctum de cet utilisateur
        $user->tokens()->delete();

        // Supprime tous les anciens refresh tokens de cet utilisateur
        $user->refreshTokens()->delete();

        // Crée un nouvel access token Sanctum et récupère sa valeur en clair
        // (après ça il est hashé en base, on ne peut plus le relire)
        $accessToken = $user->createToken('access_token')->plainTextToken;

        // Génère un refresh token aléatoire de 64 caractères (valeur envoyée au client)
        $plainRefresh = Str::random(64);

        // Stocke le refresh token HASHÉ en base (sha256) pour la sécurité
        // + sa date d'expiration dans 30 jours
        $user->refreshTokens()->create([
            'token'      => hash('sha256', $plainRefresh),
            'expires_at' => now()->addDays(self::REFRESH_TOKEN_TTL_DAYS),
        ]);

        // Retourne les tokens + métadonnées pour la réponse JSON
        return [
            'access_token'  => $accessToken,           // Token à envoyer dans Authorization: Bearer
            'refresh_token' => $plainRefresh,           // Token à utiliser pour renouveler l'access token
            'token_type'    => 'Bearer',                // Type d'authentification HTTP
            'expires_in'    => config('sanctum.expiration', 60) * 60, // Durée en secondes (60 min par défaut)
        ];
    }
}
