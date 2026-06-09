<?php

namespace App\Http\Controllers;

use App\Http\Requests\LocationRequest; // Validation des données de création d'une location
use App\Models\Location;               // Modèle Eloquent pour la table locations
use App\Models\Paiement;               // Modèle pour créer automatiquement le paiement associé
use App\Models\Voiture;                // Modèle pour vérifier la disponibilité de la voiture
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    /**
     * Liste les locations.
     * Client → voit uniquement ses propres locations.
     * Admin → voit toutes les locations.
     * GET /api/locations
     */
    public function index(Request $request): JsonResponse
    {
        // Récupère l'utilisateur authentifié via le token Bearer
        $user = $request->user();

        // Charge les relations voiture et paiement en même temps (évite les requêtes N+1)
        $query = Location::with(['voiture', 'user', 'paiement']);

        // Si c'est un client, filtre uniquement ses locations
        if ($user->isClient()) {
            $query->where('user_id', $user->id);
        }

        // Tri par date décroissante (les plus récentes en premier) + pagination 10/page
        return response()->json([
            'locations' => $query->latest()->paginate(10),
        ]);
    }

    /**
     * Affiche le détail d'une location.
     * Client → interdit d'accéder aux locations des autres.
     * GET /api/locations/{id}
     */
    public function show(Request $request, Location $location): JsonResponse
    {
        $user = $request->user();

        // Un client ne peut voir que ses propres locations
        if ($user->isClient() && $location->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        // Charge toutes les relations utiles pour l'affichage détaillé
        return response()->json([
            'location' => $location->load(['voiture', 'user', 'paiement']),
        ]);
    }

    /**
     * Crée une nouvelle location.
     * Disponible pour tout utilisateur authentifié — POST /api/locations
     * Crée automatiquement un paiement en attente et marque la voiture indisponible.
     */
    public function store(LocationRequest $request): JsonResponse
    {
        // Récupère la voiture demandée (findOrFail → 404 si inexistante)
        $voiture = Voiture::findOrFail($request->voiture_id);

        // Vérifie que la voiture est disponible à la location
        if (!$voiture->disponible) {
            return response()->json([
                'message' => 'Cette voiture n\'est pas disponible.',
            ], 409); // 409 Conflict
        }

        // Calcule la durée en jours entre date_debut et date_fin avec Carbon
        $dateDebut = \Carbon\Carbon::parse($request->date_debut);
        $dateFin   = \Carbon\Carbon::parse($request->date_fin);
        $duree     = $dateDebut->diffInDays($dateFin); // ex: 5 jours

        // Calcule le montant total = durée × prix journalier de la voiture
        $montant = $duree * $voiture->prix_par_jour;

        // Crée l'enregistrement de location en base
        $location = Location::create([
            'user_id'              => $request->user()->id, // ID du client connecté
            'voiture_id'           => $voiture->id,
            'date_debut'           => $request->date_debut,
            'date_fin'             => $request->date_fin,
            'duree_jours'          => $duree,
            'lieu_prise_en_charge' => $request->lieu_prise_en_charge,
            'lieu_retour'          => $request->lieu_retour,
            'statut'               => 'en_attente', // La location attend le paiement
            'montant_total'        => $montant,
        ]);

        // Crée automatiquement un paiement en_attente lié à cette location
        // Le client devra ensuite appeler POST /paiements/{id}/pay pour payer
        Paiement::create([
            'location_id'           => $location->id,
            'montant'               => $montant,
            'methode'               => 'carte_bancaire', // Méthode par défaut, changeable au moment du paiement
            'statut'                => 'en_attente',
            'reference_transaction' => 'REF-' . strtoupper(uniqid()), // Référence unique générée automatiquement
        ]);

        // Marque la voiture comme indisponible pour éviter les doubles réservations
        $voiture->update(['disponible' => false]);

        return response()->json([
            'message'  => 'Location créée avec succès.',
            'location' => $location->load('paiement'), // Inclut le paiement créé dans la réponse
        ], 201);
    }

    /**
     * Modifie le statut d'une location.
     * Réservé aux admins — PUT /api/locations/{id}
     * Libère la voiture si la location est terminée ou annulée.
     */
    public function update(Request $request, Location $location): JsonResponse
    {
        // Valide que le statut envoyé est l'une des valeurs autorisées
        $request->validate([
            'statut' => 'required|in:en_attente,confirmee,en_cours,terminee,annulee',
        ]);

        // Sauvegarde l'ancien statut (non utilisé ici mais utile pour des logs futurs)
        $ancienStatut = $location->statut;

        // Met à jour le statut
        $location->update(['statut' => $request->statut]);

        // Si la location est terminée ou annulée, la voiture redevient disponible
        if (in_array($request->statut, ['terminee', 'annulee'])) {
            $location->voiture->update(['disponible' => true]);
        }

        // Si la location est confirmée, la voiture reste indisponible (déjà réservée)
        if ($request->statut === 'confirmee') {
            $location->voiture->update(['disponible' => false]);
        }

        return response()->json([
            'message'  => 'Statut de la location mis à jour.',
            'location' => $location->load('voiture'),
        ]);
    }

    /**
     * Annule sa propre location (client uniquement).
     * Interdit si la location a déjà commencé.
     * POST /api/locations/{id}/cancel
     */
    public function cancel(Request $request, Location $location): JsonResponse
    {
        // Vérifie que la location appartient bien au client connecté
        if ($location->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        // On ne peut annuler que les locations en_attente ou confirmée (pas encore commencées)
        if (!in_array($location->statut, ['en_attente', 'confirmee'])) {
            return response()->json([
                'message' => 'Seules les locations en attente ou confirmées peuvent être annulées.',
            ], 409);
        }

        // Passe la location à "annulée"
        $location->update(['statut' => 'annulee']);

        // Remet la voiture disponible
        $location->voiture->update(['disponible' => true]);

        // Si un paiement existait (en_attente), l'annule aussi
        if ($location->paiement) {
            $location->paiement->update(['statut' => 'annule']);
        }

        return response()->json([
            'message' => 'Location annulée avec succès.',
        ]);
    }

    /**
     * Supprime définitivement une location.
     * Réservé aux admins — DELETE /api/locations/{id}
     * Interdit si la location est en cours.
     */
    public function destroy(Location $location): JsonResponse
    {
        // Impossible de supprimer une location en_cours (voiture actuellement louée)
        if ($location->statut === 'en_cours') {
            return response()->json([
                'message' => 'Impossible de supprimer une location en cours.',
            ], 409);
        }

        $location->delete(); // Supprime la location (le paiement associé sera supprimé en cascade)

        return response()->json([
            'message' => 'Location supprimée avec succès.',
        ]);
    }
}
