<?php

namespace App\Views;

use App\Models\Paiement;

class PaiementView
{
    public static function make(Paiement $paiement): array
    {
        return [
            'id'                    => $paiement->id,
            'location_id'           => $paiement->location_id,
            'montant'               => $paiement->montant,
            'date_paiement'         => $paiement->date_paiement?->toDateTimeString(),
            'methode'               => $paiement->methode,
            'statut'                => $paiement->statut,
            'reference_transaction' => $paiement->reference_transaction,
            'created_at'            => $paiement->created_at?->toDateTimeString(),
            'location'              => $paiement->relationLoaded('location')
                ? LocationView::make($paiement->location)
                : null,
        ];
    }

    public static function collection($items): array
    {
        if ($items instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $items->getCollection()->transform(fn($p) => static::make($p));
            return $items->toArray();
        }
        return collect($items)->map(fn($p) => static::make($p))->values()->toArray();
    }
}
