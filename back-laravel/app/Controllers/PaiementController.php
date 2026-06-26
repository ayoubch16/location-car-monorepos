<?php

namespace App\Controllers;

use App\Models\Paiement;
use App\Views\PaiementView;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PaiementController extends Controller
{
    /**
     * Liste les paiements.
     * Client → les siens. Admin → tous.
     * GET /api/paiements
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Paiement::with('location.voiture', 'location.user');

        if ($user->isClient()) {
            $query->whereHas('location', fn($q) => $q->where('user_id', $user->id));
        }

        return response()->json([
            'paiements' => PaiementView::collection($query->latest()->paginate(10)),
        ]);
    }

    /**
     * Affiche un paiement.
     * GET /api/paiements/{id}
     */
    public function show(Request $request, Paiement $paiement): JsonResponse
    {
        $user = $request->user();

        if ($user->isClient() && $paiement->location->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json([
            'paiement' => PaiementView::make($paiement->load('location.voiture')),
        ]);
    }

    /**
     * Le client paie sa réservation. Active la location.
     * POST /api/paiements/{id}/pay
     */
    public function pay(Request $request, Paiement $paiement): JsonResponse
    {
        $request->validate([
            'methode' => 'required|in:carte_bancaire,especes,virement',
        ]);
        $user = $request->user();

        if ($paiement->location->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        if ($paiement->statut !== 'en_attente') {
            return response()->json(['message' => 'Ce paiement ne peut plus être modifié.'], 409);
        }

        $paiement->update([
            'methode'       => $request->methode,
            'statut'        => 'paye',
            'date_paiement' => now(),
        ]);

        $paiement->location->update(['statut' => 'en_cours']);

        return response()->json([
            'message'  => 'Paiement effectué avec succès.',
            'paiement' => PaiementView::make($paiement->fresh()),
        ]);
    }

    /**
     * Génère et télécharge le devis PDF.
     * GET /api/paiements/{id}/devis
     */
    public function devis(Request $request, Paiement $paiement): Response
    {
        $user = $request->user();

        if ($user->isClient() && $paiement->location->user_id !== $user->id) {
            abort(403, 'Accès refusé.');
        }

        if ($paiement->statut !== 'paye') {
            abort(409, 'Le devis est disponible uniquement pour les paiements confirmés.');
        }

        $paiement->load('location.user', 'location.voiture');

        $location      = $paiement->location;
        $client        = $location->user;
        $voiture       = $location->voiture;
        $numero        = 'DEV-' . now()->format('Y') . '-' . str_pad($paiement->id, 5, '0', STR_PAD_LEFT);
        $date_emission = now()->format('d/m/Y');

        $pdf = Pdf::loadView('devis.devis', compact(
            'paiement', 'location', 'client', 'voiture', 'numero', 'date_emission'
        ))->setPaper('a4', 'portrait');

        $filename = 'devis-' . str_replace(' ', '-', strtolower($client->nom))
            . '-' . str_replace(' ', '-', strtolower($voiture->marque))
            . '-' . str_replace(' ', '-', strtolower($voiture->modele))
            . '-' . $paiement->id . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Admin confirme le paiement (espèces/virement). Passe la location en "confirmee".
     * POST /api/paiements/{id}/admin-pay
     */
    public function adminPay(Request $request, Paiement $paiement): JsonResponse
    {
        $request->validate([
            'methode' => 'required|in:carte_bancaire,especes,virement',
        ]);
        if ($paiement->statut !== 'en_attente') {
            return response()->json(['message' => 'Ce paiement ne peut plus être modifié.'], 409);
        }

        $paiement->update([
            'methode'       => $request->methode,
            'statut'        => 'paye',
            'date_paiement' => now(),
        ]);

        $paiement->location->update(['statut' => 'confirmee']);

        return response()->json([
            'message'  => 'Paiement confirmé et location mise à jour.',
            'paiement' => PaiementView::make($paiement->fresh()),
        ]);
    }

    /**
     * Admin marque un paiement comme non payé.
     * POST /api/paiements/{id}/mark-unpaid
     */
    public function markUnpaid(Paiement $paiement): JsonResponse
    {
        if ($paiement->statut !== 'en_attente') {
            return response()->json(['message' => 'Ce paiement ne peut plus être modifié.'], 409);
        }

        $paiement->update(['statut' => 'annule']);
        $paiement->location->update(['statut' => 'non_paye']);

        return response()->json(['message' => 'Location marquée comme non payée.']);
    }

    /**
     * Admin rembourse un paiement. Annule la location et libère la voiture.
     * POST /api/paiements/{id}/refund
     */
    public function refund(Paiement $paiement): JsonResponse
    {
        if ($paiement->statut !== 'paye') {
            return response()->json([
                'message' => 'Seuls les paiements payés peuvent être remboursés.',
            ], 409);
        }

        $paiement->update(['statut' => 'rembourse']);
        $paiement->location->update(['statut' => 'annulee']);
        $paiement->location->voiture->update(['disponible' => true]);

        return response()->json(['message' => 'Remboursement effectué avec succès.']);
    }
}
