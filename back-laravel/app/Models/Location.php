<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modèle Location — représente une réservation/location de voiture.
 * Correspond à la table "locations" en base de données.
 *
 * Cycle de vie du statut :
 *   en_attente → (paiement effectué) → en_cours → terminee
 *                                    → annulee (annulation client ou admin)
 */
class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',               // ID du client qui loue
        'voiture_id',            // ID de la voiture louée
        'date_debut',            // Date de début de location
        'date_fin',              // Date de fin de location
        'duree_jours',           // Calculé automatiquement (date_fin - date_debut)
        'lieu_prise_en_charge',  // Adresse de récupération du véhicule
        'lieu_retour',           // Adresse de restitution du véhicule
        'statut',                // en_attente | en_cours | terminee | annulee
        'montant_total',         // Calculé automatiquement (duree_jours × prix_par_jour)
    ];

    // Conversions automatiques des types
    protected $casts = [
        'date_debut'    => 'date',      // Objet Carbon (sans heure)
        'date_fin'      => 'date',      // Objet Carbon (sans heure)
        'montant_total' => 'decimal:2', // Toujours 2 décimales
    ];

    /**
     * Relation : une location appartient à un client (User).
     * Permet : $location->user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation : une location est liée à une voiture.
     * Permet : $location->voiture
     */
    public function voiture()
    {
        return $this->belongsTo(Voiture::class);
    }

    /**
     * Relation : une location a un seul paiement (créé automatiquement lors de la réservation).
     * Permet : $location->paiement
     */
    public function paiement()
    {
        return $this->hasOne(Paiement::class);
    }
}
