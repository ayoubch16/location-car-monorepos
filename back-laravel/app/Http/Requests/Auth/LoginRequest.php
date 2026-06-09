<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * LoginRequest — Validation du formulaire de connexion.
 * Laravel exécute automatiquement ces règles avant d'entrer dans le contrôleur.
 * Si la validation échoue, une réponse 422 avec les erreurs est retournée automatiquement.
 */
class LoginRequest extends FormRequest
{
    /**
     * Autorise tout le monde à utiliser cette requête.
     * (false bloquerait tous les accès — utile pour des requêtes admin uniquement)
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation appliquées aux données de la requête.
     */
    public function rules(): array
    {
        return [
            'email'    => 'required|email',    // Obligatoire + format email valide
            'password' => 'required|string',   // Obligatoire + doit être une chaîne
        ];
    }
}
