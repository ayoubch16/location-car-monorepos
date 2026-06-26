<?php

namespace App\Controllers\Auth;

use App\Controllers\Controller;
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

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'email'          => 'required|email|unique:users,email',
            'password'       => 'required|string|min:8|confirmed',
            'telephone'      => 'nullable|string|max:20',
            'adresse'        => 'nullable|string|max:255',
            'num_permis'     => 'nullable|string|max:50',
            'date_naissance' => 'nullable|date|before:-18 years',
        ], [
            'email.unique'          => 'Cet email est déjà utilisé.',
            'password.confirmed'    => 'Les mots de passe ne correspondent pas.',
            'date_naissance.before' => 'Vous devez avoir au moins 18 ans.',
        ]);

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

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Email ou mot de passe incorrect.'], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        return response()->json([
            'message' => 'Connexion réussie.',
            ...$this->generateTokenPair($user),
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $request->validate(['refresh_token' => 'required|string']);

        $record = RefreshToken::where('token', hash('sha256', $request->refresh_token))->first();

        if (!$record || $record->isExpired()) {
            return response()->json(['message' => 'Refresh token invalide ou expiré.'], 401);
        }

        $user = $record->user;
        $record->delete();

        return response()->json([...$this->generateTokenPair($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        $user->refreshTokens()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => UserView::make($request->user()),
        ]);
    }
}
