<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware IsClient
 * Vérifie que l'utilisateur connecté a le rôle "client".
 * Utilisé via l'alias 'is_client' défini dans bootstrap/app.php.
 * Non utilisé dans les routes actuelles (les clients sont filtrés dans les contrôleurs),
 * mais disponible si besoin de restreindre certaines routes aux seuls clients.
 */
class IsClient
{
    /**
     * Intercepte la requête avant qu'elle n'atteigne le contrôleur.
     * Si l'utilisateur n'est pas client → bloque avec 403 Forbidden.
     * Sinon → laisse passer la requête vers le contrôleur ($next).
     */
    public function handle(Request $request, Closure $next): Response
    {
        // isClient() est défini dans le modèle User : return $this->role === 'client'
        if (!$request->user() || !$request->user()->isClient()) {
            return response()->json([
                'message' => 'Accès refusé. Réservé aux clients.',
            ], 403); // 403 Forbidden
        }

        // L'utilisateur est client → on continue vers le contrôleur
        return $next($request);
    }
}
