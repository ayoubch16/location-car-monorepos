<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaiementRequest; // Validation de la méthode de paiement
use App\Models\Paiement;               // Modèle Eloquent pour la table paiements
use Barryvdh\DomPDF\Facade\Pdf;        // Façade DomPDF pour générer des fichiers PDF
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;          // Pour le type de retour du téléchargement PDF

class PaiementController extends Controller
{
    /**
     * Liste les paiements.
     * Client → voit uniquement ses propres paiements.
     * Admin → voit tous les paiements.
     * GET /api/paiements
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();

        // Charge la relation voiture via location (évite les requêtes N+1)
        $query = Paiement::with('location.voiture');

        // Si c'est un client, filtre uniquement ses paiements via la relation location
        if ($user->isClient()) {
            // whereHas() filtre les paiements dont la location appartient à ce client
            $query->whereHas('location', fn($q) => $q->where('user_id', $user->id));
        }

        return response()->json([
            'paiements' => $query->latest()->paginate(10),
        ]);
    }

    /**
     * Affiche le détail d'un paiement.
     * Client → interdit d'accéder aux paiements des autres.
     * GET /api/paiements/{id}
     */
    public function show(Request $request, Paiement $paiement): JsonResponse
    {
        $user = $request->user();

        // Vérifie que le paiement appartient bien au client connecté
        if ($user->isClient() && $paiement->location->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json([
            'paiement' => $paiement->load('location.voiture'),
        ]);
    }

    /**
     * Le client paie un paiement en attente.
     * POST /api/paiements/{id}/pay
     * Active automatiquement la location après le paiement.
     */
    public function pay(PaiementRequest $request, Paiement $paiement): JsonResponse
    {
        $user = $request->user();

        // Vérifie que le paiement appartient au client connecté
        if ($paiement->location->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        // Un paiement ne peut être effectué que s'il est encore en_attente
        if ($paiement->statut !== 'en_attente') {
            return response()->json([
                'message' => 'Ce paiement ne peut plus être modifié.',
            ], 409);
        }

        // Met à jour le paiement : méthode choisie par le client, statut paye, date actuelle
        $paiement->update([
            'methode'        => $request->methode,  // ex: carte_bancaire, especes, virement
            'statut'         => 'paye',
            'date_paiement'  => now(),               // Enregistre l'heure exacte du paiement
        ]);

        // Active la location : elle passe en "en_cours" maintenant que c'est payé
        $paiement->location->update(['statut' => 'en_cours']);

        return response()->json([
            'message'  => 'Paiement effectué avec succès.',
            'paiement' => $paiement->fresh(), // fresh() recharge l'objet depuis la base avec les nouvelles valeurs
        ]);
    }

    /**
     * Génère et télécharge le devis PDF pour un paiement confirmé.
     * Accessible par le client propriétaire ou un admin.
     * GET /api/paiements/{id}/devis
     */
    public function devis(Request $request, Paiement $paiement): Response
    {
        $user = $request->user();

        // Seul le client propriétaire ou un admin peut télécharger le devis
        if ($user->isClient() && $paiement->location->user_id !== $user->id) {
            abort(403, 'Accès refusé.');
        }

        // Le devis n'est disponible que pour les paiements confirmés (statut = paye)
        if ($paiement->statut !== 'paye') {
            abort(409, 'Le devis est disponible uniquement pour les paiements confirmés.');
        }

        // Charge toutes les relations nécessaires pour remplir le PDF en une seule requête
        $paiement->load('location.user', 'location.voiture');

        $location = $paiement->location; // Infos de la location (dates, lieux, durée)
        $client   = $location->user;     // Infos du client (nom, email, permis...)
        $voiture  = $location->voiture;  // Infos de la voiture (marque, modèle, immat...)

        // Numéro du devis au format DEV-ANNÉE-00001 (id padé sur 5 chiffres)
        $numero        = 'DEV-' . now()->format('Y') . '-' . str_pad($paiement->id, 5, '0', STR_PAD_LEFT);
        $date_emission = now()->format('d/m/Y'); // Date du jour formatée en français

        // Génère le PDF à partir du template Blade resources/views/devis/devis.blade.php
        // compact() passe toutes les variables au template
        $pdf = Pdf::loadView('devis.devis', compact(
            'paiement', 'location', 'client', 'voiture', 'numero', 'date_emission'
        ))->setPaper('a4', 'portrait'); // Format A4, orientation portrait

        // Construit le nom du fichier : devis-nom-marque-modele-id.pdf
        // strtolower + str_replace pour avoir un nom de fichier propre sans espaces
        $filename = 'devis-' . str_replace(' ', '-', strtolower($client->nom))
            . '-' . str_replace(' ', '-', strtolower($voiture->marque))
            . '-' . str_replace(' ', '-', strtolower($voiture->modele))
            . '-' . $paiement->id
            . '.pdf';

        // download() force le navigateur à télécharger le fichier (Content-Disposition: attachment)
        return $pdf->download($filename);
    }

    /**
     * Rembourse un paiement (admin uniquement).
     * Annule la location et remet la voiture disponible.
     * POST /api/paiements/{id}/refund
     */
    public function refund(Paiement $paiement): JsonResponse
    {
        // On ne peut rembourser que les paiements déjà payés
        if ($paiement->statut !== 'paye') {
            return response()->json([
                'message' => 'Seuls les paiements payés peuvent être remboursés.',
            ], 409);
        }

        // Marque le paiement comme remboursé
        $paiement->update(['statut' => 'rembourse']);

        // Annule la location associée
        $paiement->location->update(['statut' => 'annulee']);

        // Remet la voiture disponible pour de futures locations
        $paiement->location->voiture->update(['disponible' => true]);

        return response()->json([
            'message' => 'Remboursement effectué avec succès.',
        ]);
    }
}
