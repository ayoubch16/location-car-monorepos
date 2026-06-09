<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 13px;
            color: #1a1a2e;
            background: #fff;
        }

        /* ── Header ── */
        .header {
            background: #1a1a2e;
            color: #fff;
            padding: 28px 36px;
            display: table;
            width: 100%;
        }
        .header-left  { display: table-cell; vertical-align: middle; }
        .header-right { display: table-cell; vertical-align: middle; text-align: right; }
        .company-name { font-size: 22px; font-weight: bold; letter-spacing: 1px; }
        .company-sub  { font-size: 11px; color: #a0aec0; margin-top: 3px; }
        .devis-title  { font-size: 28px; font-weight: bold; color: #e2b96f; }
        .devis-ref    { font-size: 12px; color: #a0aec0; margin-top: 4px; }

        /* ── Body ── */
        .body { padding: 30px 36px; }

        /* ── Status badge ── */
        .badge {
            display: inline-block;
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: #d4edda;
            color: #155724;
            margin-bottom: 24px;
        }

        /* ── Two columns ── */
        .cols { display: table; width: 100%; margin-bottom: 24px; }
        .col  { display: table-cell; width: 50%; vertical-align: top; padding-right: 16px; }
        .col:last-child { padding-right: 0; padding-left: 16px; }

        .card {
            background: #f8f9fc;
            border-radius: 8px;
            padding: 16px 18px;
            border-left: 4px solid #e2b96f;
        }
        .card-title {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #718096;
            margin-bottom: 10px;
        }
        .card-row { margin-bottom: 5px; }
        .card-label { color: #718096; font-size: 11px; }
        .card-value { font-weight: bold; font-size: 13px; }

        /* ── Details table ── */
        .section-title {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #718096;
            margin-bottom: 10px;
            margin-top: 24px;
        }

        table.detail {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        table.detail thead tr {
            background: #1a1a2e;
            color: #fff;
        }
        table.detail thead th {
            padding: 10px 14px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        table.detail tbody tr:nth-child(even) { background: #f8f9fc; }
        table.detail tbody td {
            padding: 10px 14px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 12px;
        }

        /* ── Total box ── */
        .total-box {
            float: right;
            width: 260px;
            margin-bottom: 30px;
        }
        .total-row {
            display: table;
            width: 100%;
            padding: 7px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .total-label { display: table-cell; color: #718096; font-size: 12px; }
        .total-value { display: table-cell; text-align: right; font-size: 12px; font-weight: bold; }
        .total-final {
            background: #1a1a2e;
            color: #fff;
            border-radius: 6px;
            padding: 12px 16px;
            display: table;
            width: 100%;
            margin-top: 8px;
        }
        .total-final .total-label { color: #a0aec0; font-size: 12px; }
        .total-final .total-value { color: #e2b96f; font-size: 18px; font-weight: bold; }

        .clearfix::after { content: ""; display: table; clear: both; }

        /* ── Footer ── */
        .footer {
            border-top: 1px solid #e2e8f0;
            padding: 16px 36px;
            text-align: center;
            font-size: 10px;
            color: #a0aec0;
        }
    </style>
</head>
<body>

{{-- ── HEADER ── --}}
<div class="header">
    <div class="header-left">
        <div class="company-name">LOCATION VOITURE</div>
        <div class="company-sub">Service de location de véhicules</div>
    </div>
    <div class="header-right">
        <div class="devis-title">DEVIS</div>
        <div class="devis-ref">N° {{ $numero }}</div>
        <div class="devis-ref">Émis le {{ $date_emission }}</div>
    </div>
</div>

{{-- ── BODY ── --}}
<div class="body">

    <div class="badge">✓ Paiement confirmé</div>

    {{-- Client + Voiture --}}
    <div class="cols">
        <div class="col">
            <div class="card">
                <div class="card-title">Client</div>
                <div class="card-row">
                    <div class="card-value">{{ $client->prenom }} {{ $client->nom }}</div>
                </div>
                <div class="card-row">
                    <span class="card-label">Email : </span>
                    <span>{{ $client->email }}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Téléphone : </span>
                    <span>{{ $client->telephone ?? '—' }}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Adresse : </span>
                    <span>{{ $client->adresse ?? '—' }}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">N° Permis : </span>
                    <span>{{ $client->num_permis ?? '—' }}</span>
                </div>
            </div>
        </div>

        <div class="col">
            <div class="card">
                <div class="card-title">Véhicule</div>
                <div class="card-row">
                    <div class="card-value">{{ $voiture->marque }} {{ $voiture->modele }}</div>
                </div>
                <div class="card-row">
                    <span class="card-label">Année : </span>
                    <span>{{ $voiture->annee }}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Immatriculation : </span>
                    <span>{{ $voiture->immatriculation }}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Couleur : </span>
                    <span>{{ $voiture->couleur }}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Prix / jour : </span>
                    <span>{{ number_format($voiture->prix_par_jour, 2) }} MAD</span>
                </div>
            </div>
        </div>
    </div>

    {{-- Location details --}}
    <div class="section-title">Détails de la location</div>
    <table class="detail">
        <thead>
            <tr>
                <th>Date de début</th>
                <th>Date de fin</th>
                <th>Durée</th>
                <th>Lieu de prise en charge</th>
                <th>Lieu de retour</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $location->date_debut->format('d/m/Y') }}</td>
                <td>{{ $location->date_fin->format('d/m/Y') }}</td>
                <td>{{ $location->duree_jours }} jour(s)</td>
                <td>{{ $location->lieu_prise_en_charge }}</td>
                <td>{{ $location->lieu_retour }}</td>
            </tr>
        </tbody>
    </table>

    {{-- Payment details --}}
    <div class="section-title">Détails du paiement</div>
    <table class="detail">
        <thead>
            <tr>
                <th>Référence transaction</th>
                <th>Méthode</th>
                <th>Date de paiement</th>
                <th>Statut</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $paiement->reference_transaction ?? '—' }}</td>
                <td>{{ ucfirst(str_replace('_', ' ', $paiement->methode)) }}</td>
                <td>{{ $paiement->date_paiement->format('d/m/Y H:i') }}</td>
                <td>Payé</td>
            </tr>
        </tbody>
    </table>

    {{-- Total --}}
    <div class="clearfix">
        <div class="total-box">
            <div class="total-row">
                <span class="total-label">Prix / jour</span>
                <span class="total-value">{{ number_format($voiture->prix_par_jour, 2) }} MAD</span>
            </div>
            <div class="total-row">
                <span class="total-label">Nombre de jours</span>
                <span class="total-value">× {{ $location->duree_jours }}</span>
            </div>
            <div class="total-final">
                <div class="total-row" style="border:none; padding:0;">
                    <span class="total-label">TOTAL</span>
                    <span class="total-value">{{ number_format($paiement->montant, 2) }} MAD</span>
                </div>
            </div>
        </div>
    </div>

</div>

{{-- ── FOOTER ── --}}
<div class="footer">
    Ce document est généré automatiquement et fait office de reçu officiel de paiement. &nbsp;|&nbsp;
    Location Voiture &nbsp;|&nbsp; {{ now()->format('Y') }}
</div>

</body>
</html>
