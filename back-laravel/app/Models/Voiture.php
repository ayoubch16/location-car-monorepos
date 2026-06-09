<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modèle Voiture — représente un véhicule disponible à la location.
 * Correspond à la table "voitures" en base de données.
 */
class Voiture extends Model
{
    use HasFactory;

    // Champs autorisés à être remplis via create() ou update()
    protected $fillable = [
        'marque',
        'modele',
        'annee',
        'immatriculation',
        'couleur',
        'prix_par_jour',
        'disponible',    // Booléen : true = libre, false = en location
        'kilometrage',
    ];

    // Conversions automatiques des types lors de la lecture
    protected $casts = [
        'disponible'    => 'boolean',   // Converti en true/false PHP (pas 0/1)
        'prix_par_jour' => 'decimal:2', // Toujours 2 décimales (ex: 350.00)
    ];

    /**
     * Relation : une voiture peut avoir plusieurs locations (historique).
     * Permet : $voiture->locations  ou  $voiture->locations()->whereIn(...)
     */
    public function locations()
    {
        return $this->hasMany(Location::class);
    }
}
