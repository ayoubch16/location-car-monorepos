import { useState } from "react";
import { useNavigate } from "react-router";
import { useVoitures, type VoitureFilters } from "../api/useVoitures";
import { auth } from "../auth";
import { Spinner } from "../components/Spinner";
import type { Voiture } from "../types";

const fmt = (v: number | string) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2 }).format(
    Number(v),
  ) + " DH";

export default function CarsPage() {
  const navigate = useNavigate();

  const [marque, setMarque]       = useState("");
  const [prixMax, setPrixMax]     = useState("");
  const [disponible, setDisponible] = useState(true);
  const [filters, setFilters]     = useState<VoitureFilters>({ disponible: true });

  const { data, isLoading, isError } = useVoitures(filters);
  const voitures = data?.data ?? [];

  const search = () =>
    setFilters({
      marque:    marque   || undefined,
      prix_max:  prixMax  ? Number(prixMax) : undefined,
      disponible: disponible || undefined,
      page: 1,
    });

  const reset = () => {
    setMarque("");
    setPrixMax("");
    setDisponible(true);
    setFilters({ disponible: true });
  };

  const handleReserver = (id: number) => {
    const dest = `/reservation?voiture_id=${id}`;
    if (!auth.isLoggedIn()) {
      navigate(`/login?redirect=${encodeURIComponent(dest)}`);
    } else {
      navigate(dest);
    }
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-14 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Trouvez votre véhicule idéal</h1>
        <p className="text-orange-100 text-base">
          Choisissez parmi notre flotte et réservez en quelques clics
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end mb-6 shadow-sm">
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Marque
            </label>
            <input
              value={marque}
              onChange={(e) => setMarque(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Toyota, Renault…"
              className="h-9 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>
          <div className="flex flex-col gap-1 min-w-[170px]">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Prix max / jour (DH)
            </label>
            <input
              type="number"
              value={prixMax}
              onChange={(e) => setPrixMax(e.target.value)}
              placeholder="500"
              min={0}
              className="h-9 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 pb-0.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={disponible}
              onChange={(e) => setDisponible(e.target.checked)}
              className="accent-orange-500 w-4 h-4"
            />
            Disponibles uniquement
          </label>
          <div className="flex gap-2">
            <button
              onClick={search}
              className="h-9 px-5 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              Rechercher
            </button>
            <button
              onClick={reset}
              className="h-9 px-4 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* States */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="text-center py-24 text-gray-500">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="font-medium text-gray-700">
              Impossible de charger les véhicules.
            </p>
            <p className="text-sm mt-1">
              Vérifiez que le serveur Laravel est démarré (php artisan serve).
            </p>
          </div>
        ) : voitures.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-700 mb-1">
              Aucun véhicule trouvé
            </h3>
            <p className="text-sm">
              Essayez d'élargir vos critères de recherche.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {data?.total ?? voitures.length} véhicule
              {(data?.total ?? voitures.length) > 1 ? "s" : ""} trouvé
              {(data?.total ?? voitures.length) > 1 ? "s" : ""}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {voitures.map((v: Voiture) => (
                <CarCard
                  key={v.id}
                  voiture={v}
                  onReserver={() => handleReserver(v.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {(data?.last_page ?? 1) > 1 && (
              <div className="flex justify-center gap-1 mt-10">
                {Array.from({ length: data!.last_page }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() =>
                        setFilters((f) => ({ ...f, page: p }))
                      }
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        p === (data?.current_page ?? 1)
                          ? "bg-orange-500 text-white"
                          : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CarCard({
  voiture: v,
  onReserver,
}: {
  voiture: Voiture;
  onReserver: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-6xl select-none">
        🚗
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-3">
          <div>
            <p className="font-bold text-gray-900">
              {v.marque} {v.modele}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {v.annee} · {v.couleur}
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
              v.disponible
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {v.disponible ? "Disponible" : "Indisponible"}
          </span>
        </div>

        <div className="space-y-1 text-xs text-gray-500 mb-4">
          <div className="flex justify-between">
            <span>Immatriculation</span>
            <span className="font-mono text-gray-700">{v.immatriculation}</span>
          </div>
          {v.kilometrage !== undefined && (
            <div className="flex justify-between">
              <span>Kilométrage</span>
              <span className="text-gray-700">
                {Number(v.kilometrage).toLocaleString("fr-FR")} km
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div>
            <span className="text-lg font-bold text-orange-500">
              {fmt(v.prix_par_jour)}
            </span>
            <span className="text-xs text-gray-400"> / jour</span>
          </div>
          <button
            onClick={onReserver}
            disabled={!v.disponible}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-orange-500 hover:bg-orange-600 text-white"
          >
            {v.disponible ? "Réserver" : "Indisponible"}
          </button>
        </div>
      </div>
    </div>
  );
}
