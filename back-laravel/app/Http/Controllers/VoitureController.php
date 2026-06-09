<?php

namespace App\Http\Controllers;

use App\Http\Requests\VoitureRequest; // Validation des données de création/modification d'une voiture
use App\Models\Voiture;               // Modèle Eloquent représentant la table voitures
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoitureController extends Controller
{
    /**
     * Liste toutes les voitures avec filtres optionnels.
     * Accessible sans authentification — GET /api/voitures
     * Filtres disponibles : ?disponible=true  ?marque=Toyota  ?prix_max=500
     */
    public function index(Request $request): JsonResponse
    {
        // Démarre une requête Eloquent sur la table voitures (sans filtre par défaut)
        $query = Voiture::query();

        // Filtre par disponibilité si le paramètre est présent dans l'URL
        // filter_var() convertit "true"/"false" (string) en true/false (boolean)
        if ($request->has('disponible')) {
            $query->where('disponible', filter_var($request->disponible, FILTER_VALIDATE_BOOLEAN));
        }

        // Filtre par marque avec LIKE (recherche partielle, insensible à la casse)
        // ex: ?marque=toy  → trouve "Toyota"
        if ($request->has('marque')) {
            $query->where('marque', 'like', '%' . $request->marque . '%');
        }

        // Filtre par prix maximum par jour
        if ($request->has('prix_max')) {
            $query->where('prix_par_jour', '<=', $request->prix_max);
        }

        // Retourne les résultats paginés (10 par page)
        return response()->json([
            'voitures' => $query->paginate(10),
        ]);
    }

    /**
     * Affiche les détails d'une voiture spécifique.
     * Accessible sans authentification — GET /api/voitures/{id}
     * Laravel injecte automatiquement le bon objet Voiture via Route Model Binding.
     */
    public function show(Voiture $voiture): JsonResponse
    {
        return response()->json([
            'voiture' => $voiture,
        ]);
    }

    /**
     * Crée une nouvelle voiture.
     * Réservé aux admins — POST /api/voitures
     * VoitureRequest valide et filtre automatiquement les données avant d'arriver ici.
     */
    public function store(VoitureRequest $request): JsonResponse
    {
        // validated() retourne uniquement les champs déclarés dans les règles de VoitureRequest
        // Évite d'insérer des champs non autorisés envoyés par le client
        $voiture = Voiture::create($request->validated());

        return response()->json([
            'message' => 'Voiture ajoutée avec succès.',
            'voiture' => $voiture,
        ], 201); // 201 Created
    }

    /**
     * Met à jour une voiture existante.
     * Réservé aux admins — PUT /api/voitures/{id}
     */
    public function update(VoitureRequest $request, Voiture $voiture): JsonResponse
    {
        // Met à jour uniquement les champs validés
        $voiture->update($request->validated());

        return response()->json([
            'message' => 'Voiture mise à jour avec succès.',
            'voiture' => $voiture, // Retourne l'objet à jour
        ]);
    }

    /**
     * Supprime une voiture.
     * Réservé aux admins — DELETE /api/voitures/{id}
     * Interdit si la voiture a une location active (en_attente ou en_cours).
     */
    public function destroy(Voiture $voiture): JsonResponse
    {
        // Vérifie s'il existe une location active liée à cette voiture
        // whereIn() filtre sur les statuts qui bloquent la suppression
        if ($voiture->locations()->whereIn('statut', ['en_attente', 'en_cours'])->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer une voiture avec une location active.',
            ], 409); // 409 Conflict
        }

        $voiture->delete(); // Supprime définitivement la voiture de la base

        return response()->json([
            'message' => 'Voiture supprimée avec succès.',
        ]);
    }
}
