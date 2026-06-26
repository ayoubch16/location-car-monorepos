<?php

namespace App\Views;

use App\Models\User;

class UserView
{
    public static function make(User $user): array
    {
        return [
            'id'             => $user->id,
            'nom'            => $user->nom,
            'prenom'         => $user->prenom,
            'email'          => $user->email,
            'telephone'      => $user->telephone,
            'adresse'        => $user->adresse,
            'num_permis'     => $user->num_permis,
            'date_naissance' => $user->date_naissance?->format('Y-m-d'),
            'role'           => $user->role,
            'created_at'     => $user->created_at?->toDateTimeString(),
            'locations'      => $user->relationLoaded('locations')
                ? LocationView::collection($user->locations)
                : null,
        ];
    }

    public static function collection($items): array
    {
        if ($items instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $items->getCollection()->transform(fn($u) => static::make($u));
            return $items->toArray();
        }
        return collect($items)->map(fn($u) => static::make($u))->values()->toArray();
    }
}
