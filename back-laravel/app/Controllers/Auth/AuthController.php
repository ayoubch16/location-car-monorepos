<?php

namespace App\Controllers\Auth;

use App\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Traits\GeneratesTokens;
use App\Models\RefreshToken;
use App\Models\User;
use App\Views\UserView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use GeneratesTokens;

    /**
     * Inscription d'un nouveau client.
     * POST /api/auth/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'nom'            => $request->nom,
            'prenom'         => $request->prenom,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
            'telephone'      => $request->telephone,
            'adresse'        => $request->adresse,
            'num_permis'     => $request->num_permis,
            'date_naissance' => $request->date_naissance,
            'role'           => 'client',
        ]);

        return response()->json([
            'message' => 'Inscription réussie.',
            'user'    => UserView::make($user),
            ...$this->generateTokenPair($user),
        ], 201);
    }

    /**
     * Connexion d'un utilisateur existant.
     * POST /api/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect.',
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        return response()->json([
            'message' => 'Connexion réussie.',
            ...$this->generateTokenPair($user),
        ]);
    }

    /**
     * Renouvellement des tokens via refresh token.
     * POST /api/auth/refresh
     */
    public function refresh(Request $request): JsonResponse
    {
        $request->validate(['refresh_token' => 'required|string']);

        $hashed = hash('sha256', $request->refresh_token);
        $record = RefreshToken::where('token', $hashed)->first();

        if (!$record || $record->isExpired()) {
            return response()->json([
                'message' => 'Refresh token invalide ou expiré.',
            ], 401);
        }

        $user = $record->user;
        $record->delete();

        return response()->json([...$this->generateTokenPair($user)]);
    }

    /**
     * Déconnexion — révoque tous les tokens.
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        $user->refreshTokens()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    /**
     * Retourne l'utilisateur connecté.
     * GET /api/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => UserView::make($request->user()),
        ]);
    }
}
