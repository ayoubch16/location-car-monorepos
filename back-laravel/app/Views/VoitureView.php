<?php

namespace App\Views;

use App\Models\Voiture;

class VoitureView
{
    public static function make(Voiture $voiture): array
    {
        return [
            'id'              => $voiture->id,
            'marque'          => $voiture->marque,
            'modele'          => $voiture->modele,
            'annee'           => $voiture->annee,
            'immatriculation' => $voiture->immatriculation,
            'couleur'         => $voiture->couleur,
            'prix_par_jour'   => $voiture->prix_par_jour,
            'disponible'      => $voiture->disponible,
            'kilometrage'     => $voiture->kilometrage,
            'created_at'      => $voiture->created_at?->toDateTimeString(),
        ];
    }

    public static function collection($items): array
    {
        if ($items instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $items->getCollection()->transform(fn($v) => static::make($v));
            return $items->toArray();
        }
        return collect($items)->map(fn($v) => static::make($v))->values()->toArray();
    }
}
