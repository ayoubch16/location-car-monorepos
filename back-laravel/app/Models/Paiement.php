<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modèle Paiement — représente le paiement lié à une location.
 * Correspond à la table "paiements" en base de données.
 * Créé automatiquement lors de la création d'une location (toujours en_attente au départ).
 *
 * Cycle de vie du statut :
 *   en_attente → (client paie) → paye → (admin rembourse) → rembourse
 *   en_attente → (client annule) → annule
 */
class Paiement extends Model
{
    use HasFactory;

    protected $fillable = [
        'location_id',            // ID de la location associée (clé étrangère)
        'montant',                // Montant à payer (= montant_total de la location)
        'date_paiement',          // Date/heure à laquelle le paiement a été effectué (null si en_attente)
        'methode',                // carte_bancaire | especes | virement
        'statut',                 // en_attente | paye | rembourse | annule
        'reference_transaction',  // Référence unique générée automatiquement (REF-XXXXXX)
    ];

    // Conversions automatiques des types
    protected $casts = [
        'date_paiement' => 'datetime', // Objet Carbon avec heure (enregistré au moment du paiement)
        'montant'       => 'decimal:2', // Toujours 2 décimales
    ];

    /**
     * Relation : un paiement appartient à une location.
     * Permet : $paiement->location  (et ensuite $paiement->location->voiture, etc.)
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }
}
