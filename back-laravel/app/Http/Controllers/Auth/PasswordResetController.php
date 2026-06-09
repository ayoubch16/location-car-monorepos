<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Traits\GeneratesTokens;  // Pour connecter l'utilisateur après vérification email
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;    // Pour accéder directement à la table password_reset_tokens
use Illuminate\Support\Facades\Hash;  // Pour hasher et vérifier les tokens/mots de passe
use Illuminate\Support\Facades\Mail;  // (non utilisé en dev — pour envoyer l'email en production)
use Illuminate\Support\Str;           // Pour générer des chaînes aléatoires

class PasswordResetController extends Controller
{
    // Importe generateTokenPair() pour connecter l'utilisateur automatiquement
    use GeneratesTokens;

    /**
     * Étape 1 : Vérification de l'email oublié.
     * L'utilisateur envoie son email → on vérifie qu'il existe
     * puis on le connecte directement (retourne access + refresh token).
     * Il peut ensuite changer son mot de passe via PUT /api/auth/profile.
     *
     * POST /api/auth/forgot-password
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        // Valide que l'email est fourni ET qu'il correspond à un compte existant en base
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            // Message personnalisé si l'email n'est pas trouvé dans la table users
            'email.exists' => 'Aucun compte associé à cet email.',
        ]);

        // Récupère l'utilisateur correspondant à cet email
        $user = User::where('email', $request->email)->firstOrFail();

        // Génère un couple access_token + refresh_token et connecte l'utilisateur
        // Il peut maintenant appeler PUT /api/auth/profile pour changer son mot de passe
        return response()->json([
            'message' => 'Email vérifié. Vous pouvez maintenant modifier votre mot de passe.',
            ...$this->generateTokenPair($user),
        ]);
    }

    /**
     * Étape 2 : Réinitialisation du mot de passe avec un token de reset.
     * (Flow alternatif via email — non utilisé si on passe par forgot-password + profile)
     *
     * POST /api/auth/reset-password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        // Valide les 4 champs obligatoires :
        // email → doit exister, token → le code de reset reçu, password + confirmation
        $request->validate([
            'email'                 => 'required|email|exists:users,email',
            'token'                 => 'required|string',
            'password'              => 'required|string|min:8|confirmed', // confirmed = password_confirmation requis
        ]);

        // Cherche l'enregistrement de reset pour cet email dans la table password_reset_tokens
        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        // Vérifie que le token existe ET que le token en clair correspond au hash stocké
        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json([
                'message' => 'Token invalide ou expiré.',
            ], 422);
        }

        // Vérifie que le token a moins de 60 minutes (expiration automatique)
        if (now()->diffInMinutes($record->created_at) > 60) {
            // Supprime le token expiré de la base
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'message' => 'Token expiré. Veuillez refaire une demande.',
            ], 422);
        }

        // Récupère l'utilisateur et met à jour son mot de passe (hashé bcrypt)
        $user = User::where('email', $request->email)->firstOrFail();
        $user->update(['password' => Hash::make($request->password)]);

        // Supprime le token de reset utilisé (usage unique)
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Connecte automatiquement l'utilisateur après le reset (retourne access + refresh token)
        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès.',
            ...$this->generateTokenPair($user),
        ]);
    }
}
