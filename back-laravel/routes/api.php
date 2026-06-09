<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VoitureController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| ROUTES PUBLIQUES — Auth (sans token requis)
|--------------------------------------------------------------------------
| Ces routes sont accessibles sans être connecté.
*/
Route::prefix('auth')->group(function () {
    Route::post('/register',        [AuthController::class, 'register']);         // Créer un compte client
    Route::post('/login',           [AuthController::class, 'login']);            // Se connecter (retourne access + refresh token)
    Route::post('/refresh',         [AuthController::class, 'refresh']);          // Renouveler l'access token via refresh token
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']); // Vérifier l'email et connecter l'utilisateur
    Route::post('/reset-password',  [PasswordResetController::class, 'resetPassword']); // Réinitialiser le mot de passe avec un token
});

/*
|--------------------------------------------------------------------------
| ROUTES PUBLIQUES — Voitures (lecture seule, sans token)
|--------------------------------------------------------------------------
*/
Route::get('/voitures',             [VoitureController::class, 'index']); // Liste avec filtres (?disponible, ?marque, ?prix_max)
Route::get('/voitures/{voiture}',   [VoitureController::class, 'show']);  // Détail d'une voiture

/*
|--------------------------------------------------------------------------
| ROUTES PROTÉGÉES — Requièrent un token Sanctum valide
| Header obligatoire : Authorization: Bearer {access_token}
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // ── Auth (utilisateur connecté) ──────────────────────────────────────
    Route::post('/auth/logout',   [AuthController::class, 'logout']);       // Se déconnecter (révoque les tokens)
    Route::get('/auth/me',        [AuthController::class, 'me']);           // Voir son propre profil
    Route::put('/auth/profile',   [UserController::class, 'updateProfile']); // Modifier son propre profil/mot de passe

    /*
    |--------------------------------------------------------------------------
    | ROUTES ADMIN UNIQUEMENT — Middleware is_admin
    | Retourne 403 si l'utilisateur n'est pas admin.
    |--------------------------------------------------------------------------
    */
    Route::middleware('is_admin')->group(function () {

        // Voitures — écriture (admin uniquement)
        Route::post('/voitures',             [VoitureController::class, 'store']);   // Ajouter une voiture
        Route::put('/voitures/{voiture}',    [VoitureController::class, 'update']);  // Modifier une voiture
        Route::delete('/voitures/{voiture}', [VoitureController::class, 'destroy']); // Supprimer une voiture

        // Gestion des utilisateurs (admin uniquement)
        Route::get('/users',            [UserController::class, 'index']);   // Lister tous les users
        Route::get('/users/{user}',     [UserController::class, 'show']);    // Voir un user
        Route::post('/users',           [UserController::class, 'store']);   // Créer un user (avec choix du rôle)
        Route::put('/users/{user}',     [UserController::class, 'update']);  // Modifier un user
        Route::delete('/users/{user}',  [UserController::class, 'destroy']); // Supprimer un user

        // Gestion des locations (admin voit tout)
        Route::put('/locations/{location}',    [LocationController::class, 'update']);  // Changer le statut d'une location
        Route::delete('/locations/{location}', [LocationController::class, 'destroy']); // Supprimer une location

        // Gestion des paiements
        Route::post('/paiements/{paiement}/refund', [PaiementController::class, 'refund']); // Rembourser un paiement
    });

    /*
    |--------------------------------------------------------------------------
    | ROUTES CLIENT + ADMIN — Accessibles par tout utilisateur connecté
    |--------------------------------------------------------------------------
    */

    // Locations
    Route::get('/locations',                       [LocationController::class, 'index']);  // Mes locations (client) / toutes (admin)
    Route::get('/locations/{location}',            [LocationController::class, 'show']);   // Détail d'une location
    Route::post('/locations',                      [LocationController::class, 'store']);  // Créer une location (réservation)
    Route::post('/locations/{location}/cancel',    [LocationController::class, 'cancel']); // Annuler sa propre location

    // Paiements
    Route::get('/paiements',                       [PaiementController::class, 'index']);  // Mes paiements (client) / tous (admin)
    Route::get('/paiements/{paiement}',            [PaiementController::class, 'show']);   // Détail d'un paiement
    Route::post('/paiements/{paiement}/pay',       [PaiementController::class, 'pay']);    // Payer une location
    Route::get('/paiements/{paiement}/devis',      [PaiementController::class, 'devis']); // Télécharger le devis PDF
});
