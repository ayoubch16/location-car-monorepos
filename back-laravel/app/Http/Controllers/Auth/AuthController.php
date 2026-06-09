<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;       // Validation du formulaire de connexion
use App\Http\Requests\Auth\RegisterRequest;    // Validation du formulaire d'inscription
use App\Http\Traits\GeneratesTokens;           // Trait qui génère access_token + refresh_token
use App\Models\RefreshToken;                   // Modèle pour la table refresh_tokens
use App\Models\User;                           // Modèle utilisateur
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;           // Façade pour vérifier les identifiants
use Illuminate\Support\Facades\Hash;           // Façade pour hasher les mots de passe

class AuthController extends Controller
{
    // Importe la méthode generateTokenPair() depuis le trait
    use GeneratesTokens;

    /**
     * Inscription d'un nouveau client.
     * Accessible sans authentification — POST /api/auth/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        // Crée l'utilisateur en base avec les données validées par RegisterRequest
        // Le mot de passe est hashé automatiquement grâce au cast 'hashed' dans le modèle User
        $user = User::create([
            'nom'            => $request->nom,
            'prenom'         => $request->prenom,
            'email'          => $request->email,
            'password'       => Hash::make($request->password), // Hash bcrypt du mot de passe
            'telephone'      => $request->telephone,
            'adresse'        => $request->adresse,
            'num_permis'     => $request->num_permis,
            'date_naissance' => $request->date_naissance,
            'role'           => 'client', // Tout nouvel inscrit est client par défaut
        ]);

        // Génère le couple access_token + refresh_token et retourne la réponse 201 Created
        return response()->json([
            'message' => 'Inscription réussie.',
            'user'    => $user,
            ...$this->generateTokenPair($user), // Déstructure le tableau retourné par le trait
        ], 201);
    }

    /**
     * Connexion d'un utilisateur existant.
     * Accessible sans authentification — POST /api/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Vérifie que email + password correspondent à un utilisateur en base
        // Auth::attempt() retourne false si les identifiants sont incorrects
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect.',
            ], 401); // 401 Unauthorized
        }

        // Récupère l'objet User complet depuis la base
        $user = User::where('email', $request->email)->firstOrFail();

        // Retourne uniquement le message + tokens (sans les données utilisateur)
        return response()->json([
            'message' => 'Connexion réussie.',
            ...$this->generateTokenPair($user),
        ]);
    }

    /**
     * Renouvellement des tokens depuis un refresh token valide.
     * Accessible sans authentification — POST /api/auth/refresh
     * Le client envoie son refresh_token pour obtenir un nouveau couple de tokens.
     */
    public function refresh(Request $request): JsonResponse
    {
        // Valide que le champ refresh_token est présent dans la requête
        $request->validate([
            'refresh_token' => 'required|string',
        ]);

        // Hashe le token reçu en clair pour le comparer avec celui stocké en base
        $hashed = hash('sha256', $request->refresh_token);

        // Cherche le refresh token en base par son hash
        $record = RefreshToken::where('token', $hashed)->first();

        // Si le token n'existe pas OU s'il est expiré → refus
        if (!$record || $record->isExpired()) {
            return response()->json([
                'message' => 'Refresh token invalide ou expiré.',
            ], 401);
        }

        // Récupère l'utilisateur lié à ce refresh token
        $user = $record->user;

        // Supprime le refresh token utilisé (rotation — chaque refresh consomme le token)
        $record->delete();

        // Génère et retourne un nouveau couple de tokens
        return response()->json([
            ...$this->generateTokenPair($user),
        ]);
    }

    /**
     * Déconnexion de l'utilisateur.
     * Requiert d'être authentifié — POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user(); // Récupère l'utilisateur authentifié via le token Bearer

        // Supprime uniquement le token Sanctum actuellement utilisé pour cette requête
        $user->currentAccessToken()->delete();

        // Supprime aussi tous ses refresh tokens (invalide toutes les sessions futures)
        $user->refreshTokens()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    /**
     * Retourne les informations de l'utilisateur connecté.
     * Requiert d'être authentifié — GET /api/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        // $request->user() retourne l'utilisateur authentifié grâce au middleware auth:sanctum
        return response()->json([
            'user' => $request->user(),
        ]);
    }
}
