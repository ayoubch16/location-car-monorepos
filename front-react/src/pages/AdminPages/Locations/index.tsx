import { useState } from "react";
import { PageMeta, PageBreadcrumb, Footer } from "components";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Badge,
} from "components/ui";
import { TrashBinIcon } from "assets";
import {
  useGetLocations,
  useUpdateLocation,
  useCancelLocation,
  useDeleteLocation,
} from "api/locations";
import { useAdminPayPaiement, useMarkUnpaid } from "api/paiements";
import type { Location, LocationStatut } from "api/locations/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUT_LABELS: Record<LocationStatut, string> = {
  en_attente: "En attente",
  confirmee:  "Confirmée",
  en_cours:   "En cours",
  terminee:   "Terminée",
  annulee:    "Annulée",
  non_paye:   "Non payée",
};

const STATUT_COLORS: Record<LocationStatut, "warning" | "success" | "info" | "error" | "light"> = {
  en_attente: "warning",
  confirmee:  "info",
  en_cours:   "success",
  terminee:   "light",
  annulee:    "error",
  non_paye:   "error",
};

const METHODES = [
  { value: "carte_bancaire", label: "Carte bancaire" },
  { value: "especes",        label: "Espèces" },
  { value: "virement",       label: "Virement" },
];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const BtnSpinner = () => (
  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const TableSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <svg className="animate-spin h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>
);

// ─── Payment Modal ─────────────────────────────────────────────────────────────

interface PaymentModalProps {
  location: Location;
  onClose: () => void;
}

function PaymentModal({ location, onClose }: PaymentModalProps) {
  const [methode, setMethode] = useState("carte_bancaire");
  const { mutate: adminPay, isLoading: paying } = useAdminPayPaiement();
  const { mutate: markUnpaid, isLoading: marking } = useMarkUnpaid();
  const busy = paying || marking;

  const paiementId = location.paiement?.id;
  const montant    = location.paiement?.montant ?? location.montant_total;

  const handleConfirm = () => {
    if (!paiementId) return;
    adminPay({ id: paiementId, methode }, { onSuccess: onClose });
  };

  const handleUnpaid = () => {
    if (!paiementId) return;
    markUnpaid(paiementId, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">
            Confirmation du paiement
          </h2>
          <button
            onClick={onClose}
            disabled={busy}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Récapitulatif location */}
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Client</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {location.user ? `${location.user.nom} ${location.user.prenom}` : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Véhicule</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {location.voiture ? `${location.voiture.marque} ${location.voiture.modele}` : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Période</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {fmtDate(location.date_debut)} → {fmtDate(location.date_fin)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Montant total</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {montant != null ? `${Number(montant).toFixed(2)} MAD` : "—"}
              </span>
            </div>
          </div>

          {/* Méthode de paiement */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Méthode de paiement
            </label>
            <select
              value={methode}
              onChange={(e) => setMethode(e.target.value)}
              disabled={busy}
              className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
            >
              {METHODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          {/* Non payé */}
          <button
            onClick={handleUnpaid}
            disabled={busy || !paiementId}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-error-50 text-error-600 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {marking ? <BtnSpinner /> : null}
            Non payé
          </button>
          {/* Confirmer */}
          <button
            onClick={handleConfirm}
            disabled={busy || !paiementId}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-success-500 text-white hover:bg-success-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paying ? <BtnSpinner /> : null}
            Confirmer le paiement
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LocationsPage() {
  const [statutFilter, setStatutFilter] = useState<LocationStatut | "">("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [payModal, setPayModal] = useState<Location | null>(null);

  const { data: locations, isLoading } = useGetLocations({
    statut: statutFilter || undefined,
  });

  const { mutate: updateStatut } = useUpdateLocation();
  const { mutate: cancelLocation } = useCancelLocation();
  const { mutate: deleteLocation } = useDeleteLocation();

  const handleStatut = (loc: Location, statut: LocationStatut) => {
    setProcessingId(loc.id);
    updateStatut(
      { id: loc.id, statut },
      { onSettled: () => setProcessingId(null) },
    );
  };

  const handleCancel = (loc: Location) => {
    if (!window.confirm("Annuler cette location ?")) return;
    setProcessingId(loc.id);
    cancelLocation(loc.id, { onSettled: () => setProcessingId(null) });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Supprimer cette location ?")) return;
    setProcessingId(id);
    deleteLocation(id, { onSettled: () => setProcessingId(null) });
  };

  const selectClass =
    "h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  const thClass = "px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 text-start";

  const actionBtn = (label: string, colorClass: string, onClick: () => void, rowId: number) => {
    const busy = processingId === rowId;
    return (
      <button
        onClick={onClick}
        disabled={busy || processingId !== null}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorClass}`}
      >
        {busy ? <BtnSpinner /> : null}
        {label}
      </button>
    );
  };

  return (
    <>
      <PageMeta title="Locations | Location Voiture" description="" />
      <PageBreadcrumb pageTitle="Locations" />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03]">
          <select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value as LocationStatut | "")}
            className={selectClass}
          >
            <option value="">Tous les statuts</option>
            {(Object.keys(STATUT_LABELS) as LocationStatut[]).map((s) => (
              <option key={s} value={s}>{STATUT_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className={thClass}>#</TableCell>
                  <TableCell isHeader className={thClass}>Client</TableCell>
                  <TableCell isHeader className={thClass}>Voiture</TableCell>
                  <TableCell isHeader className={thClass}>Période</TableCell>
                  <TableCell isHeader className={thClass}>Lieu de prise</TableCell>
                  <TableCell isHeader className={thClass}>Lieu de retour</TableCell>
                  <TableCell isHeader className={thClass}>Montant</TableCell>
                  <TableCell isHeader className={thClass}>Statut</TableCell>
                  <TableCell isHeader className={thClass}>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <TableSpinner />
                    </TableCell>
                  </TableRow>
                ) : !locations?.length ? (
                  <TableRow>
                    <TableCell colSpan={9} className="px-5 py-10 text-center text-gray-400 text-sm">
                      Aucune location trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="px-5 py-4 text-gray-400 text-sm">
                        #{loc.id}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        {loc.user ? (
                          <>
                            <span className="block font-medium text-gray-800 dark:text-white/90 text-sm">
                              {loc.user.nom} {loc.user.prenom}
                            </span>
                            <span className="block text-xs text-gray-400">{loc.user.email}</span>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        {loc.voiture ? (
                          <>
                            <span className="block font-medium text-gray-800 dark:text-white/90 text-sm">
                              {loc.voiture.marque} {loc.voiture.modele}
                            </span>
                            <span className="block text-xs text-gray-400 font-mono">
                              {loc.voiture.immatriculation}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">#{loc.voiture_id}</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="block">{fmtDate(loc.date_debut)}</span>
                        <span className="block text-xs text-gray-400">→ {fmtDate(loc.date_fin)}</span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm max-w-[160px] truncate">
                        {loc.lieu_prise_en_charge}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm max-w-[160px] truncate">
                        {loc.lieu_retour}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 text-sm font-medium">
                        {loc.montant_total != null ? `${Number(loc.montant_total).toFixed(2)} MAD` : "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge size="sm" color={STATUT_COLORS[loc.statut]}>
                          {STATUT_LABELS[loc.statut]}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {loc.statut === "en_attente" && actionBtn(
                            "Confirmer",
                            "bg-info-50 text-info-600 hover:bg-info-100 dark:bg-info-500/10 dark:text-info-400",
                            () => setPayModal(loc),
                            loc.id,
                          )}
                          {loc.statut === "confirmee" && actionBtn(
                            "Démarrer",
                            "bg-success-50 text-success-600 hover:bg-success-100 dark:bg-success-500/10 dark:text-success-400",
                            () => handleStatut(loc, "en_cours"),
                            loc.id,
                          )}
                          {loc.statut === "en_cours" && actionBtn(
                            "Terminer",
                            "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300",
                            () => handleStatut(loc, "terminee"),
                            loc.id,
                          )}
                          {(loc.statut === "en_attente" || loc.statut === "confirmee") && actionBtn(
                            "Annuler",
                            "bg-error-50 text-error-600 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400",
                            () => handleCancel(loc),
                            loc.id,
                          )}
                          <button
                            onClick={() => handleDelete(loc.id)}
                            disabled={processingId !== null}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Supprimer"
                          >
                            {processingId === loc.id ? (
                              <BtnSpinner />
                            ) : (
                              <TrashBinIcon className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {payModal && (
        <PaymentModal
          location={payModal}
          onClose={() => setPayModal(null)}
        />
      )}

      <Footer />
    </>
  );
}
