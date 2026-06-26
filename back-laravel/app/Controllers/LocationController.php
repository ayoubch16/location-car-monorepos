<?php

namespace App\Controllers;

use App\Models\Location;
use App\Models\Paiement;
use App\Models\Voiture;
use App\Views\LocationView;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
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

    public function show(Request $request, $id): JsonResponse
    {
        $location = Location::with(['voiture', 'user', 'paiement'])->findOrFail($id);
        $user     = $request->user();

        if ($user->isClient() && $location->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json([
            'location' => LocationView::make($location),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'voiture_id'           => 'required|exists:voitures,id',
            'date_debut'           => 'required|date|after_or_equal:today',
            'date_fin'             => 'required|date|after:date_debut',
            'lieu_prise_en_charge' => 'required|string|max:255',
            'lieu_retour'          => 'required|string|max:255',
        ], [
            'voiture_id.exists'         => 'La voiture sélectionnée n\'existe pas.',
            'date_debut.after_or_equal' => 'La date de début doit être aujourd\'hui ou dans le futur.',
            'date_fin.after'            => 'La date de fin doit être après la date de début.',
        ]);

        $voiture = Voiture::findOrFail($request->voiture_id);

        if (!$voiture->disponible) {
            return response()->json(['message' => 'Cette voiture n\'est pas disponible.'], 409);
        }

        $duree   = Carbon::parse($request->date_debut)->diffInDays(Carbon::parse($request->date_fin));
        $montant = $duree * $voiture->prix_par_jour;

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

    public function update(Request $request, $id): JsonResponse
    {
        $location = Location::findOrFail($id);

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

    public function cancel(Request $request, $id): JsonResponse
    {
        $location = Location::findOrFail($id);

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

    public function destroy($id): JsonResponse
    {
        $location = Location::findOrFail($id);

        if ($location->statut === 'en_cours') {
            return response()->json([
                'message' => 'Impossible de supprimer une location en cours.',
            ], 409);
        }

        $location->delete();

        return response()->json(['message' => 'Location supprimée avec succès.']);
    }
}
