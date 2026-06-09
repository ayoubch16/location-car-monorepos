import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "components/form/input";
import { Label } from "components/form";
import {
  PlusIcon,
  PencilIcon,
  TrashBinIcon,
  AngleLeftIcon,
  AngleRightIcon,
} from "assets";
import { useModal } from "core/hooks";
import {
  useGetVoitures,
  useCreateVoiture,
  useUpdateVoiture,
  useDeleteVoiture,
} from "api/voitures";
import type { Voiture, VoiturePayload } from "api/voitures/types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  marque: z.string().min(1, "Requis"),
  modele: z.string().min(1, "Requis"),
  annee: z.number({ invalid_type_error: "Requis" }).min(1900).max(2100),
  immatriculation: z.string().min(1, "Requis"),
  couleur: z.string().min(1, "Requis"),
  prix_par_jour: z.number({ invalid_type_error: "Requis" }).min(0, "≥ 0"),
  disponible: z.boolean(),
  kilometrage: z.number({ invalid_type_error: "Requis" }).min(0, "≥ 0"),
});

type VoitureFormData = z.infer<typeof schema>;

// ─── Form ─────────────────────────────────────────────────────────────────────

function VoitureForm({
  voiture,
  onClose,
}: {
  voiture: Voiture | null;
  onClose: () => void;
}) {
  const { mutate: create, isLoading: creating } = useCreateVoiture();
  const { mutate: update, isLoading: updating } = useUpdateVoiture();
  const isLoading = creating || updating;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VoitureFormData>({
    resolver: zodResolver(schema),
    defaultValues: voiture
      ? {
          marque: voiture.marque,
          modele: voiture.modele,
          annee: voiture.annee,
          immatriculation: voiture.immatriculation,
          couleur: voiture.couleur,
          prix_par_jour: voiture.prix_par_jour,
          disponible: voiture.disponible,
          kilometrage: voiture.kilometrage,
        }
      : { disponible: true, kilometrage: 0 },
  });

  const onSubmit = (data: VoitureFormData) => {
    const payload: VoiturePayload = data;
    if (voiture) {
      update({ id: voiture.id, ...payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="divide-y divide-gray-100 dark:divide-gray-800"
    >
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {voiture ? "Modifier la voiture" : "Nouvelle voiture"}
        </h2>
      </div>

      <div className="px-6 py-4 space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Identification
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>
              Marque <span className="text-error-500">*</span>
            </Label>
            <Input
              {...register("marque")}
              placeholder="ex: Toyota"
              error={!!errors.marque}
              hint={errors.marque?.message}
            />
          </div>
          <div>
            <Label>
              Modèle <span className="text-error-500">*</span>
            </Label>
            <Input
              {...register("modele")}
              placeholder="ex: Corolla"
              error={!!errors.modele}
              hint={errors.modele?.message}
            />
          </div>
          <div>
            <Label>
              Immatriculation <span className="text-error-500">*</span>
            </Label>
            <Input
              {...register("immatriculation")}
              placeholder="ex: 12345-A-1"
              error={!!errors.immatriculation}
              hint={errors.immatriculation?.message}
            />
          </div>
          <div>
            <Label>
              Couleur <span className="text-error-500">*</span>
            </Label>
            <Input
              {...register("couleur")}
              placeholder="ex: Blanc"
              error={!!errors.couleur}
              hint={errors.couleur?.message}
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Caractéristiques
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>
              Année <span className="text-error-500">*</span>
            </Label>
            <Input
              type="number"
              min={1900}
              max={2100}
              {...register("annee", { valueAsNumber: true })}
              placeholder="2022"
              error={!!errors.annee}
              hint={errors.annee?.message}
            />
          </div>
          <div>
            <Label>
              Kilométrage <span className="text-error-500">*</span>
            </Label>
            <Input
              type="number"
              min={0}
              {...register("kilometrage", { valueAsNumber: true })}
              placeholder="0"
              error={!!errors.kilometrage}
              hint={errors.kilometrage?.message}
            />
          </div>
          <div>
            <Label>
              Prix / jour (MAD) <span className="text-error-500">*</span>
            </Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              {...register("prix_par_jour", { valueAsNumber: true })}
              placeholder="350"
              error={!!errors.prix_par_jour}
              hint={errors.prix_par_jour?.message}
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center gap-3">
          <input
            id="v-disponible"
            type="checkbox"
            {...register("disponible")}
            className="w-4 h-4 accent-brand-500"
          />
          <label
            htmlFor="v-disponible"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Disponible à la location
          </label>
        </div>
      </div>

      <div className="px-6 py-4 flex justify-end gap-3">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" size="sm" isLoading={isLoading}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function VoituresPage() {
  const [search, setSearch] = useState("");
  const [dispoFilter, setDispoFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Voiture | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const { data: paginated, isLoading } = useGetVoitures({
    disponible: dispoFilter === "" ? undefined : dispoFilter === "true",
    marque: search || undefined,
    page,
  });

  const voitures = paginated?.data ?? [];
  const currentPage = paginated?.current_page ?? 1;
  const lastPage = paginated?.last_page ?? 1;
  const total = paginated?.total ?? 0;

  // Reset to page 1 when filters change
  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const handleDispo = (v: string) => {
    setDispoFilter(v);
    setPage(1);
  };

  const { mutate: deleteVoiture } = useDeleteVoiture();

  const handleEdit = (v: Voiture) => {
    setSelected(v);
    openModal();
  };
  const handleCreate = () => {
    setSelected(null);
    openModal();
  };
  const handleDelete = (id: number) => {
    if (window.confirm("Supprimer cette voiture ?")) deleteVoiture(id);
  };

  const selectClass =
    "h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  const thClass =
    "px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 text-start";

  return (
    <>
      <PageMeta title="Voitures | Location Voiture" description="" />
      <PageBreadcrumb pageTitle="Voitures" />

      <div className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Marque…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-10 w-44 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-900"
            />
            <select
              value={dispoFilter}
              onChange={(e) => handleDispo(e.target.value)}
              className={selectClass}
            >
              <option value="">Toutes</option>
              <option value="true">Disponible</option>
              <option value="false">Indisponible</option>
            </select>
          </div>
          <Button onClick={handleCreate} startIcon={<PlusIcon />} size="sm">
            Ajouter
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className={thClass}>
                    Marque / Modèle
                  </TableCell>
                  <TableCell isHeader className={thClass}>
                    Année
                  </TableCell>
                  <TableCell isHeader className={thClass}>
                    Immatriculation
                  </TableCell>
                  <TableCell isHeader className={thClass}>
                    Couleur
                  </TableCell>
                  <TableCell isHeader className={thClass}>
                    Prix / jour
                  </TableCell>
                  <TableCell isHeader className={thClass}>
                    Kilométrage
                  </TableCell>
                  <TableCell isHeader className={thClass}>
                    Statut
                  </TableCell>
                  <TableCell isHeader className={thClass}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <TableLoader />
                    </TableCell>
                  </TableRow>
                ) : voitures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">
                      Aucune voiture trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  voitures.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="px-5 py-4">
                        <span className="block font-medium text-gray-800 dark:text-white/90 text-sm">
                          {v.marque}
                        </span>
                        <span className="block text-xs text-gray-400">
                          {v.modele}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {v.annee}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm font-mono">
                        {v.immatriculation}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {v.couleur}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 text-sm font-medium">
                        {Number(v.prix_par_jour).toFixed(2)} MAD
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {Number(v.kilometrage).toLocaleString()} km
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge
                          size="sm"
                          color={v.disponible ? "success" : "error"}
                        >
                          {v.disponible ? "Disponible" : "Indisponible"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(v)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                            title="Modifier"
                          >
                            <PencilIcon className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                            title="Supprimer"
                          >
                            <TrashBinIcon className="size-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination footer */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-white/[0.05]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page{" "}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {currentPage}
                </span>{" "}
                sur{" "}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {lastPage}
                </span>
                {total > 0 && (
                  <span className="ml-2 text-gray-400">
                    ({total} voiture{total > 1 ? "s" : ""})
                  </span>
                )}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || isLoading}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Page précédente"
                >
                  <AngleLeftIcon className="size-4" />
                </button>

                {/* Page number buttons — show up to 5 pages around current */}
                {Array.from({ length: lastPage }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === lastPage ||
                      Math.abs(p - currentPage) <= 1,
                  )
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                      acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "…" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-gray-400 text-sm select-none"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        disabled={isLoading}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                          item === currentPage
                            ? "bg-brand-500 text-white"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={currentPage >= lastPage || isLoading}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Page suivante"
                >
                  <AngleRightIcon className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-2xl mx-4">
        <VoitureForm voiture={selected} onClose={closeModal} />
      </Modal>
    </>
  );
}
