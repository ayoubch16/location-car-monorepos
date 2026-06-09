<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * VoitureRequest — Validation des données pour créer ou modifier une voiture.
 * Utilisée dans VoitureController::store() et VoitureController::update().
 */
class VoitureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // L'autorisation admin est gérée par le middleware is_admin dans les routes
    }

    public function rules(): array
    {
        // Récupère l'ID de la voiture depuis les paramètres de route (null si c'est une création)
        // Utilisé pour la règle unique : lors d'une modification, on ignore l'immatriculation existante
        $voitureId = $this->route('voiture')?->id ?? $this->route('voiture');

        return [
            'marque'          => 'required|string|max:100',
            'modele'          => 'required|string|max:100',
            'annee'           => 'required|integer|min:1990|max:' . (date('Y') + 1), // Entre 1990 et l'année prochaine
            // unique:voitures,immatriculation SAUF pour la voiture en cours de modification (évite faux conflit)
            'immatriculation' => 'required|string|unique:voitures,immatriculation,' . $voitureId,
            'couleur'         => 'required|string|max:50',
            'prix_par_jour'   => 'required|numeric|min:0',  // Nombre décimal positif
            'disponible'      => 'boolean',                  // Optionnel, true/false
            'kilometrage'     => 'integer|min:0',            // Optionnel, entier positif
        ];
    }
}
