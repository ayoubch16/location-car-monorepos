<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voiture extends Model
{
    protected $fillable = [
        'marque', 'modele', 'annee', 'immatriculation',
        'couleur', 'prix_par_jour', 'disponible', 'kilometrage',
    ];

    protected $casts = [
        'disponible'    => 'boolean',
        'prix_par_jour' => 'decimal:2',
    ];

    public function locations()
    {
        return $this->hasMany(Location::class);
    }
}
