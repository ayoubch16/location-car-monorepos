import type { LocationStatut } from "../types";

const STATUT_MAP: Record<LocationStatut, { label: string; cls: string }> = {
  en_attente: { label: "En attente", cls: "bg-yellow-100 text-yellow-700" },
  confirmee:  { label: "Confirmée",  cls: "bg-blue-100 text-blue-700" },
  en_cours:   { label: "En cours",   cls: "bg-green-100 text-green-700" },
  terminee:   { label: "Terminée",   cls: "bg-gray-100 text-gray-600" },
  annulee:    { label: "Annulée",    cls: "bg-red-100 text-red-600" },
};

export function StatutBadge({ statut }: { statut: LocationStatut }) {
  const { label, cls } = STATUT_MAP[statut] ?? {
    label: statut,
    cls: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}
