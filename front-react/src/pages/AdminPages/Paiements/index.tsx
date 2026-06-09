import { useState } from "react";
import { PageMeta, PageBreadcrumb, Footer } from "components";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Badge,
  Modal,
  TableLoader,
} from "components/ui";
import { Button } from "components/ui";
import { DownloadIcon } from "assets";
import { useModal } from "core/hooks";
import {
  useGetPaiements,
  usePayPaiement,
  useRefundPaiement,
} from "api/paiements";
import type { Paiement, PaiementStatut } from "api/paiements/types";
import { client } from "api/client";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUT_LABELS: Record<PaiementStatut, string> = {
  en_attente: "En attente",
  paye: "Payé",
  rembourse: "Remboursé",
};

const STATUT_COLORS: Record<PaiementStatut, "warning" | "success" | "info"> = {
  en_attente: "warning",
  paye: "success",
  rembourse: "info",
};

const METHODE_LABELS: Record<string, string> = {
  carte_bancaire: "Carte bancaire",
  especes: "Espèces",
  virement: "Virement",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Pay modal ────────────────────────────────────────────────────────────────

const METHODES = [
  { value: "carte_bancaire", label: "Carte bancaire" },
  { value: "especes", label: "Espèces" },
  { value: "virement", label: "Virement" },
];

function PayModal({
  paiement,
  onClose,
}: {
  paiement: Paiement;
  onClose: () => void;
}) {
  const [methode, setMethode] = useState("carte_bancaire");
  const { mutate: pay, isLoading } = usePayPaiement();

  const handlePay = () => {
    pay({ id: paiement.id, methode }, { onSuccess: onClose });
  };

  const selectClass =
    "h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  return (
    <div className="p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Enregistrer le paiement
      </h2>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Montant</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
          {paiement.montant.toFixed(2)} MAD
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Méthode de paiement
        </label>
        <select
          value={methode}
          onChange={(e) => setMethode(e.target.value)}
          className={selectClass}
        >
          {METHODES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Annuler
        </Button>
        <Button size="sm" isLoading={isLoading} onClick={handlePay}>
          Confirmer
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Spinner = () => (
  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export function PaiementsPage() {
  const [statutFilter, setStatutFilter] = useState<PaiementStatut | "">("");
  const [payTarget, setPayTarget] = useState<Paiement | null>(null);
  const [refundingId, setRefundingId] = useState<number | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const { data: paiements, isLoading } = useGetPaiements({
    statut: statutFilter || undefined,
  });

  const { mutate: refund } = useRefundPaiement();

  const handlePay = (p: Paiement) => { setPayTarget(p); openModal(); };
  const handleRefund = (p: Paiement) => {
    if (!window.confirm(`Rembourser ${p.montant.toFixed(2)} MAD ?`)) return;
    setRefundingId(p.id);
    refund(p.id, { onSettled: () => setRefundingId(null) });
  };
  const handleDevis = async (p: Paiement) => {
    try {
      const resp = await client.get(`paiements/${p.id}/devis`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(resp.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devis-${p.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
  };

  const selectClass =
    "h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  const thClass = "px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 text-start";

  return (
    <>
      <PageMeta title="Paiements | Location Voiture" description="" />
      <PageBreadcrumb pageTitle="Paiements" />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03]">
          <select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value as PaiementStatut | "")}
            className={selectClass}
          >
            <option value="">Tous les statuts</option>
            {(Object.keys(STATUT_LABELS) as PaiementStatut[]).map((s) => (
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
                  <TableCell isHeader className={thClass}>Location</TableCell>
                  <TableCell isHeader className={thClass}>Client</TableCell>
                  <TableCell isHeader className={thClass}>Montant</TableCell>
                  <TableCell isHeader className={thClass}>Méthode</TableCell>
                  <TableCell isHeader className={thClass}>Statut</TableCell>
                  <TableCell isHeader className={thClass}>Date</TableCell>
                  <TableCell isHeader className={thClass}>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <TableLoader />
                    </TableCell>
                  </TableRow>
                ) : !paiements?.length ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">
                      Aucun paiement trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  paiements.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="px-5 py-4 text-gray-400 text-sm">
                        #{p.id}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        {p.location ? (
                          <>
                            <span className="block font-medium text-gray-800 dark:text-white/90 text-sm">
                              {p.location.voiture
                                ? `${p.location.voiture.marque} ${p.location.voiture.modele}`
                                : `#${p.location_id}`}
                            </span>
                            <span className="block text-xs text-gray-400">
                              {fmtDate(p.location.date_debut)} → {fmtDate(p.location.date_fin)}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">#{p.location_id}</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {p.location?.user
                          ? `${p.location.user.nom} ${p.location.user.prenom}`
                          : "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 text-sm font-medium">
                        {p.montant.toFixed(2)} MAD
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {p.methode ? (METHODE_LABELS[p.methode] ?? p.methode) : "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge size="sm" color={STATUT_COLORS[p.statut]}>
                          {STATUT_LABELS[p.statut]}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {fmtDate(p.created_at)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {p.statut === "en_attente" && (
                            <button
                              onClick={() => handlePay(p)}
                              className="px-2 py-1 rounded text-xs font-medium bg-success-50 text-success-600 hover:bg-success-100 dark:bg-success-500/10 dark:text-success-400 transition-colors"
                            >
                              Payer
                            </button>
                          )}
                          {p.statut === "paye" && (
                            <button
                              onClick={() => handleRefund(p)}
                              disabled={refundingId !== null}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-info-50 text-info-600 hover:bg-info-100 dark:bg-info-500/10 dark:text-info-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {refundingId === p.id && <Spinner />}
                              Rembourser
                            </button>
                          )}
                          <button
                            onClick={() => handleDevis(p)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                            title="Télécharger devis PDF"
                          >
                            <DownloadIcon className="size-4" />
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

      <Footer />

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-sm mx-4">
        {payTarget && <PayModal paiement={payTarget} onClose={closeModal} />}
      </Modal>
    </>
  );
}
