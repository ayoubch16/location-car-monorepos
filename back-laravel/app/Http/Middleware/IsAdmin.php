<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware IsAdmin
 * Vérifie que l'utilisateur connecté a le rôle "admin".
 * Utilisé via l'alias 'is_admin' défini dans bootstrap/app.php.
 * S'applique après le middleware auth:sanctum (l'utilisateur est déjà authentifié ici).
 */
class IsAdmin
{
    /**
     * Intercepte la requête avant qu'elle n'atteigne le contrôleur.
     * Si l'utilisateur n'est pas admin → bloque avec 403 Forbidden.
     * Sinon → laisse passer la requête vers le contrôleur ($next).
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Double vérification : l'utilisateur existe ET a le rôle admin
        // isAdmin() est défini dans le modèle User : return $this->role === 'admin'
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Accès refusé. Réservé aux administrateurs.',
            ], 403); // 403 Forbidden
        }

        // L'utilisateur est admin → on continue vers le contrôleur
        return $next($request);
    }
}
