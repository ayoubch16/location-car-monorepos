<?php

namespace App\Controllers;

use App\Models\Voiture;
use App\Views\VoitureView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoitureController extends Controller
{
    /**
     * Liste les voitures avec filtres optionnels.
     * GET /api/voitures  (?disponible ?marque ?prix_max)
     */
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

    /**
     * Affiche une voiture.
     * GET /api/voitures/{id}
     */
    public function show(Voiture $voiture): JsonResponse
    {
        return response()->json([
            'voiture' => VoitureView::make($voiture),
        ]);
    }

    /**
     * Crée une voiture.
     * POST /api/voitures  (admin)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'marque'          => 'required|string|max:100',
            'modele'          => 'required|string|max:100',
            'annee'           => 'required|integer|min:1990|max:' . (date('Y') + 1),
            'immatriculation' => 'required|string|unique:voitures,immatriculation',
            'couleur'         => 'required|string|max:50',
            'prix_par_jour'   => 'required|numeric|min:0',
            'disponible'      => 'boolean',
            'kilometrage'     => 'integer|min:0',
        ]);

        $voiture = Voiture::create($validated);

        return response()->json([
            'message' => 'Voiture ajoutée avec succès.',
            'voiture' => VoitureView::make($voiture),
        ], 201);
    }

    /**
     * Met à jour une voiture.
     * PUT /api/voitures/{id}  (admin)
     */
    public function update(Request $request, Voiture $voiture): JsonResponse
    {
        $validated = $request->validate([
            'marque'          => 'required|string|max:100',
            'modele'          => 'required|string|max:100',
            'annee'           => 'required|integer|min:1990|max:' . (date('Y') + 1),
            'immatriculation' => 'required|string|unique:voitures,immatriculation,' . $voiture->id,
            'couleur'         => 'required|string|max:50',
            'prix_par_jour'   => 'required|numeric|min:0',
            'disponible'      => 'boolean',
            'kilometrage'     => 'integer|min:0',
        ]);

        $voiture->update($validated);

        return response()->json([
            'message' => 'Voiture mise à jour avec succès.',
            'voiture' => VoitureView::make($voiture),
        ]);
    }

    /**
     * Supprime une voiture. Interdit si elle a une location active.
     * DELETE /api/voitures/{id}  (admin)
     */
    public function destroy(Voiture $voiture): JsonResponse
    {
        if ($voiture->locations()->whereIn('statut', ['en_attente', 'en_cours'])->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer une voiture avec une location active.',
            ], 409);
        }

        $voiture->delete();

        return response()->json(['message' => 'Voiture supprimée avec succès.']);
    }
}
