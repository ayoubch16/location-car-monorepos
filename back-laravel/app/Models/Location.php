<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'voiture_id', 'date_debut', 'date_fin',
        'duree_jours', 'lieu_prise_en_charge', 'lieu_retour',
        'statut', 'montant_total',
    ];

    protected $casts = [
        'date_debut'    => 'date',
        'date_fin'      => 'date',
        'montant_total' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function voiture()
    {
        return $this->belongsTo(Voiture::class);
    }

    public function paiement()
    {
        return $this->hasOne(Paiement::class);
    }
}
