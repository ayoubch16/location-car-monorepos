import { useState } from "react";
import { useSearchParams, Link } from "react-router";
import toast from "react-hot-toast";
import { useVoiture } from "../api/useVoiture";
import { useCreateLocation } from "../api/useCreateLocation";
import { Spinner } from "../components/Spinner";

type ApiError = {
  response?: { status?: number; data?: { message?: string } };
};

const fmt = (v: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2 }).format(v) +
  " DH";

export default function ReservationPage() {
  const [searchParams]  = useSearchParams();
  const voitureId       = searchParams.get("voiture_id")
    ? Number(searchParams.get("voiture_id"))
    : null;

  const { data: voiture, isLoading, isError } = useVoiture(voitureId);
  const { mutate: createLocation, isLoading: submitting } = useCreateLocation();

  const today = new Date().toISOString().split("T")[0];
  const [dateDebut, setDateDebut]   = useState("");
  const [dateFin, setDateFin]       = useState("");
  const [lieuPrise, setLieuPrise]   = useState("");
  const [lieuRetour, setLieuRetour] = useState("");
  const [success, setSuccess]       = useState(false);

  const days =
    dateDebut && dateFin && dateFin >= dateDebut
      ? Math.round(
          (new Date(dateFin).getTime() - new Date(dateDebut).getTime()) /
            86_400_000,
        ) + 1
      : 0;
  const total =
    days > 0 && voiture ? days * Number(voiture.prix_par_jour) : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiture || days <= 0) return;
    createLocation(
      {
        voiture_id:           voiture.id,
        date_debut:           dateDebut,
        date_fin:             dateFin,
        duree_jours:          days,
        lieu_prise_en_charge: lieuPrise,
        lieu_retour:          lieuRetour,
      },
      {
        onSuccess: () => setSuccess(true),
        onError: (err) => {
          const e = err as ApiError;
          if (e.response?.status === 409) {
            toast.error("Ce véhicule n'est plus disponible.");
          } else {
            toast.error(
              e.response?.data?.message ?? "Erreur lors de la réservation.",
            );
          }
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !voiture || !voiture.disponible) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Véhicule introuvable
        </h2>
        <p className="text-gray-500 mb-6">
          Ce véhicule n'existe pas ou n'est plus disponible.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
        >
          Retour aux voitures
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Réservation envoyée !
        </h2>
        <p className="text-gray-500 mb-6">
          Votre demande a bien été envoyée. Un administrateur va la traiter
          rapidement.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            to="/mes-reservations"
            className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            Voir mes réservations
          </Link>
          <Link
            to="/"
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="text-orange-500 hover:underline">
          Accueil
        </Link>
        <span className="mx-1.5">›</span>
        <span>Réservation</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Réserver un véhicule
      </h1>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 font-semibold text-gray-800">
            Détails de la réservation
          </div>
          <form onSubmit={submit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début *
                </label>
                <input
                  type="date"
                  value={dateDebut}
                  min={today}
                  onChange={(e) => {
                    setDateDebut(e.target.value);
                    if (dateFin && dateFin < e.target.value) setDateFin("");
                  }}
                  required
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin *
                </label>
                <input
                  type="date"
                  value={dateFin}
                  min={dateDebut || today}
                  onChange={(e) => setDateFin(e.target.value)}
                  required
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu de prise en charge *
              </label>
              <input
                value={lieuPrise}
                onChange={(e) => setLieuPrise(e.target.value)}
                placeholder="Ex : Agence centrale, Casablanca"
                required
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu de retour *
              </label>
              <input
                value={lieuRetour}
                onChange={(e) => setLieuRetour(e.target.value)}
                placeholder="Ex : Aéroport Mohammed V"
                required
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              />
            </div>

            {/* Price summary */}
            {days > 0 && (
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Prix / jour</span>
                  <span>{fmt(Number(voiture.prix_par_jour))}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Durée</span>
                  <span>
                    {days} jour{days > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-orange-200 pt-2">
                  <span>Total estimé</span>
                  <span className="text-orange-500">{fmt(total)}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={days <= 0 || submitting}
              className="w-full h-11 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && <Spinner size="sm" />}
              {submitting ? "Envoi en cours…" : "Confirmer la réservation"}
            </button>
          </form>
        </div>

        {/* Car summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-6xl">
              🚗
            </div>
            <div className="p-4">
              <h2 className="font-bold text-gray-900 text-lg">
                {voiture.marque} {voiture.modele}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {voiture.annee} · {voiture.couleur}
              </p>
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Immatriculation</span>
                  <span className="font-mono text-gray-700">
                    {voiture.immatriculation}
                  </span>
                </div>
                {voiture.kilometrage !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kilométrage</span>
                    <span className="text-gray-700">
                      {Number(voiture.kilometrage).toLocaleString("fr-FR")} km
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-1 border-t border-gray-100">
                  <span className="text-gray-500">Prix / jour</span>
                  <span className="text-orange-500">
                    {fmt(Number(voiture.prix_par_jour))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 leading-relaxed">
            <strong className="text-blue-800">ℹ Information</strong>
            <p className="mt-1">
              Votre réservation sera en statut{" "}
              <em>En attente</em> jusqu'à la confirmation par notre équipe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
