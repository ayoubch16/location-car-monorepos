<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    protected $fillable = [
        'location_id', 'montant', 'date_paiement',
        'methode', 'statut', 'reference_transaction',
    ];

    protected $casts = [
        'date_paiement' => 'datetime',
        'montant'       => 'decimal:2',
    ];

    public function location()
    {
        return $this->belongsTo(Location::class);
    }
}
