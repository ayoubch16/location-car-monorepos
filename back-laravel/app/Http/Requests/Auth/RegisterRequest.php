<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * RegisterRequest — Validation du formulaire d'inscription.
 * Toutes les règles sont vérifiées avant d'entrer dans le contrôleur.
 */
class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Tout le monde peut s'inscrire
    }

    /**
     * Règles de validation pour l'inscription.
     */
    public function rules(): array
    {
        return [
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'email'          => 'required|email|unique:users,email', // L'email ne doit pas déjà exister en base
            'password'       => 'required|string|min:8|confirmed',   // min 8 chars + password_confirmation doit correspondre
            'telephone'      => 'nullable|string|max:20',            // Optionnel
            'adresse'        => 'nullable|string|max:255',           // Optionnel
            'num_permis'     => 'nullable|string|max:50',            // Optionnel
            'date_naissance' => 'nullable|date|before:-18 years',    // Doit avoir au moins 18 ans
        ];
    }

    /**
     * Messages d'erreur personnalisés en français.
     * Remplacent les messages par défaut de Laravel (en anglais).
     */
    public function messages(): array
    {
        return [
            'email.unique'          => 'Cet email est déjà utilisé.',
            'password.confirmed'    => 'Les mots de passe ne correspondent pas.',
            'date_naissance.before' => 'Vous devez avoir au moins 18 ans.',
        ];
    }
}
