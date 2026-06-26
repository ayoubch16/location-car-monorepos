<?php

namespace App\Controllers\Auth;

use App\Controllers\Controller;
use App\Http\Traits\GeneratesTokens;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PasswordResetController extends Controller
{
    use GeneratesTokens;

    /**
     * Étape 1 : Vérifie l'email et connecte l'utilisateur.
     * POST /api/auth/forgot-password
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Aucun compte associé à cet email.',
        ]);

        $user = User::where('email', $request->email)->firstOrFail();

        return response()->json([
            'message' => 'Email vérifié. Vous pouvez maintenant modifier votre mot de passe.',
            ...$this->generateTokenPair($user),
        ]);
    }

    /**
     * Étape 2 : Réinitialise le mot de passe via token de reset.
     * POST /api/auth/reset-password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email|exists:users,email',
            'token'    => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Token invalide ou expiré.'], 422);
        }

        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Token expiré. Veuillez refaire une demande.'], 422);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->update(['password' => Hash::make($request->password)]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès.',
            ...$this->generateTokenPair($user),
        ]);
    }
}
