<?php

namespace App\Controllers;

use App\Models\Voiture;
use App\Views\VoitureView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoitureController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Voiture::query();

        if ($request->has('disponible')) {
            $query->where('disponible', filter_var($request->disponible, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('marque')) {
            $query->where('marque', 'like', '%' . $request->marque . '%');
        }

        if ($request->has('prix_max')) {
            $query->where('prix_par_jour', '<=', $request->prix_max);
        }

        return response()->json([
            'voitures' => VoitureView::collection($query->paginate(10)),
        ]);
    }

    public function show($id): JsonResponse
    {
        $voiture = Voiture::findOrFail($id);

        return response()->json([
            'voiture' => VoitureView::make($voiture),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'marque'          => 'required|string|max:100',
            'modele'          => 'required|string|max:100',
            'annee'           => 'required|integer|min:1990|max:' . (date('Y') + 1),
            'immatriculation' => 'required|string|unique:voitures,immatriculation',
            'couleur'         => 'required|string|max:50',
            'prix_par_jour'   => 'required|numeric|min:0',
            'disponible'      => 'boolean',
            'kilometrage'     => 'integer|min:0',
        ]);

        $voiture = Voiture::create($data);

        return response()->json([
            'message' => 'Voiture ajoutée avec succès.',
            'voiture' => VoitureView::make($voiture),
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $voiture = Voiture::findOrFail($id);

        $data = $request->validate([
            'marque'          => 'required|string|max:100',
            'modele'          => 'required|string|max:100',
            'annee'           => 'required|integer|min:1990|max:' . (date('Y') + 1),
            'immatriculation' => 'required|string|unique:voitures,immatriculation,' . $id,
            'couleur'         => 'required|string|max:50',
            'prix_par_jour'   => 'required|numeric|min:0',
            'disponible'      => 'boolean',
            'kilometrage'     => 'integer|min:0',
        ]);

        $voiture->update($data);

        return response()->json([
            'message' => 'Voiture mise à jour avec succès.',
            'voiture' => VoitureView::make($voiture),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $voiture = Voiture::findOrFail($id);

        if ($voiture->locations()->whereIn('statut', ['en_attente', 'en_cours'])->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer une voiture avec une location active.',
            ], 409);
        }

        $voiture->delete();

        return response()->json(['message' => 'Voiture supprimée avec succès.']);
    }
}
