<?php

use App\Http\Middleware\IsAdmin;   // Middleware qui vérifie le rôle admin
use App\Http\Middleware\IsClient;  // Middleware qui vérifie le rôle client
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// Point d'entrée de l'application Laravel.
// Configure les routes, les middlewares et la gestion des erreurs.
return Application::configure(basePath: dirname(__DIR__)) // Définit la racine du projet
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Enregistre les alias de middleware pour les utiliser dans les routes
        $middleware->alias([
            'is_admin'  => IsAdmin::class,  // Route::middleware('is_admin') → vérifie role === 'admin'
            'is_client' => IsClient::class, // Route::middleware('is_client') → vérifie role === 'client'
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Personnalise les réponses d'erreur pour retourner du JSON (à la place des pages HTML)

        // 401 — Utilisateur non authentifié (token manquant ou invalide)
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        });

        // 422 — Erreur de validation (règles non respectées dans les FormRequest)
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation.',
                'errors'  => $e->errors(), // Détail des champs invalides
            ], 422);
        });

        // 404 — Ressource introuvable (Route Model Binding échoué)
        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Ressource introuvable.'], 404);
        });
    })->create(); // Crée et retourne l'instance de l'application
