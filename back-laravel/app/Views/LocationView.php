<?php

namespace App\Views;

use App\Models\Location;

class LocationView
{
    public static function make(Location $location): array
    {
        return [
            'id'                   => $location->id,
            'user_id'              => $location->user_id,
            'voiture_id'           => $location->voiture_id,
            'date_debut'           => $location->date_debut?->format('Y-m-d'),
            'date_fin'             => $location->date_fin?->format('Y-m-d'),
            'duree_jours'          => $location->duree_jours,
            'lieu_prise_en_charge' => $location->lieu_prise_en_charge,
            'lieu_retour'          => $location->lieu_retour,
            'statut'               => $location->statut,
            'montant_total'        => $location->montant_total,
            'created_at'           => $location->created_at?->toDateTimeString(),
            'user'                 => $location->relationLoaded('user')
                ? UserView::make($location->user)
                : null,
            'voiture'              => $location->relationLoaded('voiture')
                ? VoitureView::make($location->voiture)
                : null,
            'paiement'             => $location->relationLoaded('paiement')
                ? PaiementView::make($location->paiement)
                : null,
        ];
    }

    public static function collection($items): array
    {
        if ($items instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $items->getCollection()->transform(fn($l) => static::make($l));
            return $items->toArray();
        }
        return collect($items)->map(fn($l) => static::make($l))->values()->toArray();
    }
}
