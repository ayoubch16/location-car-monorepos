import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useLocations } from "../api/useLocations";
import { useCancelLocation } from "../api/useCancelLocation";
import { StatutBadge } from "../components/Badge";
import { Spinner } from "../components/Spinner";
import type { Resa, LocationStatut } from "../types";

type ApiError = {
  response?: { data?: { message?: string } };
};

const fmtPrice = (v?: number | string | null) => {
  if (v == null) return "—";
  return (
    new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2 }).format(
      Number(v),
    ) + " DH"
  );
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function MesReservationsPage() {
  const { data: locations, isLoading, isError, refetch } = useLocations();
  const { mutate: cancelLocation, isLoading: cancelling } = useCancelLocation();
  const [cancelId, setCancelId] = useState<number | null>(null);

  const confirmCancel = () => {
    if (!cancelId) return;
    cancelLocation(cancelId, {
      onSuccess: () => {
        toast.success("Réservation annulée.");
        setCancelId(null);
      },
      onError: (err) => {
        const e = err as ApiError;
        toast.error(
          e.response?.data?.message ?? "Erreur lors de l'annulation.",
        );
        setCancelId(null);
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Mes Réservations</h1>
        <Link
          to="/"
          className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          + Nouvelle réservation
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="text-center py-24 text-gray-500">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="mb-3 font-medium text-gray-700">
            Impossible de charger vos réservations.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Réessayer
          </button>
        </div>
      ) : !locations?.length ? (
        <div className="text-center py-24 text-gray-500">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="font-semibold text-gray-700 mb-1">
            Aucune réservation
          </h3>
          <p className="text-sm mb-5">
            Vous n'avez pas encore effectué de réservation.
          </p>
          <Link
            to="/"
            className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            Réserver maintenant
          </Link>
        </div>
      ) : (
        <>
          <SummaryChips locations={locations} />

          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["#", "Véhicule", "Période", "Durée", "Lieu prise", "Total", "Statut", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {locations.map((loc) => (
                  <DesktopRow
                    key={loc.id}
                    loc={loc}
                    onCancel={() => setCancelId(loc.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {locations.map((loc) => (
              <MobileCard
                key={loc.id}
                loc={loc}
                onCancel={() => setCancelId(loc.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Cancel modal */}
      {cancelId !== null && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCancelId(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Annuler la réservation ?
            </h3>
            <p className="text-gray-500 text-sm mb-5">
              Cette action est irréversible. Votre réservation sera annulée
              définitivement.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCancelId(null)}
                disabled={cancelling}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Non, garder
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelling}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {cancelling && <Spinner size="sm" />}
                {cancelling ? "Annulation…" : "Oui, annuler"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryChips({ locations }: { locations: Resa[] }) {
  const counts: Record<LocationStatut, number> = {
    en_attente: 0,
    confirmee: 0,
    en_cours: 0,
    terminee: 0,
    annulee: 0,
  };
  locations.forEach((l) => counts[l.statut]++);

  const items = [
    { label: "Total",       value: locations.length,  cls: "bg-gray-100 text-gray-700" },
    { label: "En attente",  value: counts.en_attente,  cls: "bg-yellow-100 text-yellow-700" },
    { label: "Confirmées",  value: counts.confirmee,   cls: "bg-blue-100 text-blue-700" },
    { label: "En cours",    value: counts.en_cours,    cls: "bg-green-100 text-green-700" },
    { label: "Terminées",   value: counts.terminee,    cls: "bg-gray-100 text-gray-600" },
    { label: "Annulées",    value: counts.annulee,     cls: "bg-red-100 text-red-600" },
  ].filter((i) => i.value > 0 || i.label === "Total");

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {items.map(({ label, value, cls }) => (
        <span
          key={label}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cls}`}
        >
          {value} {label}
        </span>
      ))}
    </div>
  );
}

function DesktopRow({
  loc,
  onCancel,
}: {
  loc: Resa;
  onCancel: () => void;
}) {
  const canCancel = loc.statut === "en_attente" || loc.statut === "confirmee";
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-gray-400 text-xs">#{loc.id}</td>
      <td className="px-4 py-3">
        <div className="font-semibold text-gray-900">
          {loc.voiture
            ? `${loc.voiture.marque} ${loc.voiture.modele}`
            : "—"}
        </div>
        <div className="text-xs text-gray-400 font-mono">
          {loc.voiture?.immatriculation}
        </div>
      </td>
      <td className="px-4 py-3">
        <div>{fmtDate(loc.date_debut)}</div>
        <div className="text-xs text-gray-400">→ {fmtDate(loc.date_fin)}</div>
      </td>
      <td className="px-4 py-3 text-gray-600">
        {loc.duree_jours}j
      </td>
      <td className="px-4 py-3 text-gray-600 max-w-[130px] truncate">
        {loc.lieu_prise_en_charge}
      </td>
      <td className="px-4 py-3 font-semibold text-orange-500">
        {fmtPrice(loc.montant_total)}
      </td>
      <td className="px-4 py-3">
        <StatutBadge statut={loc.statut} />
      </td>
      <td className="px-4 py-3">
        {canCancel && (
          <button
            onClick={onCancel}
            className="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
          >
            Annuler
          </button>
        )}
      </td>
    </tr>
  );
}

function MobileCard({
  loc,
  onCancel,
}: {
  loc: Resa;
  onCancel: () => void;
}) {
  const canCancel = loc.statut === "en_attente" || loc.statut === "confirmee";
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-bold text-gray-900">
            {loc.voiture
              ? `${loc.voiture.marque} ${loc.voiture.modele}`
              : "—"}
          </div>
          <div className="text-xs text-gray-400 font-mono mt-0.5">
            {loc.voiture?.immatriculation}
          </div>
        </div>
        <StatutBadge statut={loc.statut} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <div className="text-gray-400 text-xs">Début</div>
          <div className="font-medium">{fmtDate(loc.date_debut)}</div>
        </div>
        <div>
          <div className="text-gray-400 text-xs">Fin</div>
          <div className="font-medium">{fmtDate(loc.date_fin)}</div>
        </div>
        <div>
          <div className="text-gray-400 text-xs">Durée</div>
          <div className="font-medium">
            {loc.duree_jours} jour{loc.duree_jours > 1 ? "s" : ""}
          </div>
        </div>
        <div>
          <div className="text-gray-400 text-xs">Total</div>
          <div className="font-semibold text-orange-500">
            {fmtPrice(loc.montant_total)}
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mb-3">
        📍 {loc.lieu_prise_en_charge}
      </div>
      {canCancel && (
        <button
          onClick={onCancel}
          className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Annuler la réservation
        </button>
      )}
    </div>
  );
}
