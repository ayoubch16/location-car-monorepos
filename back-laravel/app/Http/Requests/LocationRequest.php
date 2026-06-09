<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * LocationRequest — Validation des données pour créer une location.
 */
class LocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Tout utilisateur authentifié peut créer une location
    }

    public function rules(): array
    {
        return [
            'voiture_id'           => 'required|exists:voitures,id',          // L'ID doit exister dans la table voitures
            'date_debut'           => 'required|date|after_or_equal:today',   // Doit être aujourd'hui ou dans le futur
            'date_fin'             => 'required|date|after:date_debut',       // Doit être strictement après la date de début
            'lieu_prise_en_charge' => 'required|string|max:255',              // Lieu de récupération du véhicule
            'lieu_retour'          => 'required|string|max:255',              // Lieu de restitution du véhicule
        ];
    }

    /**
     * Messages d'erreur personnalisés en français.
     */
    public function messages(): array
    {
        return [
            'voiture_id.exists'         => 'La voiture sélectionnée n\'existe pas.',
            'date_debut.after_or_equal' => 'La date de début doit être aujourd\'hui ou dans le futur.',
            'date_fin.after'            => 'La date de fin doit être après la date de début.',
        ];
    }
}
