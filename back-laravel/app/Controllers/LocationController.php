<?php

namespace App\Controllers;

use App\Http\Requests\LocationRequest;
use App\Models\Location;
use App\Models\Paiement;
use App\Models\Voiture;
use App\Views\LocationView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    /**
     * Liste les locations.
     * Client → ses locations. Admin → toutes.
     * GET /api/locations
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Location::with(['voiture', 'user', 'paiement']);

        if ($user->isClient()) {
            $query->where('user_id', $user->id);
        }

        return response()->json([
            'locations' => LocationView::collection($query->latest()->paginate(10)),
        ]);
    }

    /**
     * Affiche une location.
     * Client → uniquement la sienne. Admin → toutes.
     * GET /api/locations/{id}
     */
    public function show(Request $request, Location $location): JsonResponse
    {
        $user = $request->user();

        if ($user->isClient() && $location->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json([
            'location' => LocationView::make($location->load(['voiture', 'user', 'paiement'])),
        ]);
    }

    /**
     * Crée une réservation, génère le paiement associé et bloque la voiture.
     * POST /api/locations
     */
    public function store(LocationRequest $request): JsonResponse
    {
        $voiture = Voiture::findOrFail($request->voiture_id);

        if (!$voiture->disponible) {
            return response()->json(['message' => 'Cette voiture n\'est pas disponible.'], 409);
        }

        $dateDebut = \Carbon\Carbon::parse($request->date_debut);
        $dateFin   = \Carbon\Carbon::parse($request->date_fin);
        $duree     = $dateDebut->diffInDays($dateFin);
        $montant   = $duree * $voiture->prix_par_jour;

        $location = Location::create([
            'user_id'              => $request->user()->id,
            'voiture_id'           => $voiture->id,
            'date_debut'           => $request->date_debut,
            'date_fin'             => $request->date_fin,
            'duree_jours'          => $duree,
            'lieu_prise_en_charge' => $request->lieu_prise_en_charge,
            'lieu_retour'          => $request->lieu_retour,
            'statut'               => 'en_attente',
            'montant_total'        => $montant,
        ]);

        Paiement::create([
            'location_id'           => $location->id,
            'montant'               => $montant,
            'methode'               => 'carte_bancaire',
            'statut'                => 'en_attente',
            'reference_transaction' => 'REF-' . strtoupper(uniqid()),
        ]);

        $voiture->update(['disponible' => false]);

        return response()->json([
            'message'  => 'Location créée avec succès.',
            'location' => LocationView::make($location->load('paiement')),
        ], 201);
    }

    /**
     * Modifie le statut d'une location et gère la disponibilité de la voiture.
     * PUT /api/locations/{id}  (admin)
     */
    public function update(Request $request, Location $location): JsonResponse
    {
        $request->validate([
            'statut' => 'required|in:en_attente,confirmee,en_cours,terminee,annulee,non_paye',
        ]);

        $location->update(['statut' => $request->statut]);

        if (in_array($request->statut, ['terminee', 'annulee'])) {
            $location->voiture->update(['disponible' => true]);
        }

        if ($request->statut === 'confirmee') {
            $location->voiture->update(['disponible' => false]);
        }

        return response()->json([
            'message'  => 'Statut de la location mis à jour.',
            'location' => LocationView::make($location->load('voiture')),
        ]);
    }

    /**
     * Le client annule sa propre réservation (uniquement si pas encore commencée).
     * POST /api/locations/{id}/cancel
     */
    public function cancel(Request $request, Location $location): JsonResponse
    {
        if ($location->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        if (!in_array($location->statut, ['en_attente', 'confirmee'])) {
            return response()->json([
                'message' => 'Seules les locations en attente ou confirmées peuvent être annulées.',
            ], 409);
        }

        $location->update(['statut' => 'annulee']);
        $location->voiture->update(['disponible' => true]);

        if ($location->paiement) {
            $location->paiement->update(['statut' => 'annule']);
        }

        return response()->json(['message' => 'Location annulée avec succès.']);
    }

    /**
     * Supprime une location. Interdit si en cours.
     * DELETE /api/locations/{id}  (admin)
     */
    public function destroy(Location $location): JsonResponse
    {
        if ($location->statut === 'en_cours') {
            return response()->json([
                'message' => 'Impossible de supprimer une location en cours.',
            ], 409);
        }

        $location->delete();

        return response()->json(['message' => 'Location supprimée avec succès.']);
    }
}
