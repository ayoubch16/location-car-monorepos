<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * PaiementRequest — Validation des données pour effectuer un paiement.
 * Utilisée dans PaiementController::pay().
 */
class PaiementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Le contrôleur gère lui-même l'autorisation (ownership check)
    }

    public function rules(): array
    {
        return [
            // La méthode de paiement doit être l'une de ces trois valeurs exactes
            'methode' => 'required|in:carte_bancaire,especes,virement',
        ];
    }
}
