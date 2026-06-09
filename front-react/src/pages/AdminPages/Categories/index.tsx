import { useState, useRef } from "react";
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
} from "components/ui";
import { Button } from "components/ui";
import { Input } from "components/form/input";
import { Label } from "components/form";
import { PlusIcon, PencilIcon, TrashBinIcon } from "assets";
import { useModal } from "core/hooks";
import {
  useGetCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "api/categories";
import type { Category, CategoryPayload } from "api/categories/types";

// ─── Form schema ──────────────────────────────────────────────────────────────

const schema = z.object({
  name_ar: z.string().min(1, "Requis"),
  name_fr: z.string().min(1, "Requis"),
  name_en: z.string().min(1, "Requis"),
  sort_order: z.number().min(0),
  active: z.boolean(),
});
type CategoryFormData = z.infer<typeof schema>;

// ─── Category form (create / edit) ────────────────────────────────────────────

function CategoryForm({
  category,
  onClose,
}: {
  category: Category | null;
  onClose: () => void;
}) {
  const { mutate: create, isLoading: creating } = useCreateCategory();
  const { mutate: update, isLoading: updating } = useUpdateCategory();
  const isLoading = creating || updating;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(category?.image_url ?? null);
  const [uploadPct, setUploadPct] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(schema),
    defaultValues: category
      ? {
          name_ar: category.name_ar,
          name_fr: category.name_fr,
          name_en: category.name_en,
          sort_order: category.sort_order,
          active: category.active,
        }
      : { sort_order: 0, active: true },
  });

  const onSubmit = (data: CategoryFormData) => {
    const payload: CategoryPayload = {
      ...data,
      ...(imageFile ? { image_url: imageFile, _onProgress: setUploadPct } : {}),
    };
    if (category) {
      update({ id: category.id, ...payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  };

  const fieldClass =
    "h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 dark:focus:border-brand-800 dark:bg-gray-900";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        {category ? "Modifier la catégorie" : "Nouvelle catégorie"}
      </h2>

      {/* Image upload */}
      <div>
        <Label>Image de la catégorie</Label>
        <div
          onClick={() => fileRef.current?.click()}
          className="relative mt-1 cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:border-brand-400 dark:hover:border-brand-500 transition-colors overflow-hidden bg-gray-50 dark:bg-gray-900"
        >
          {preview ? (
            <>
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">Changer</span>
              </div>
            </>
          ) : (
            <div className="text-center pointer-events-none">
              <svg className="mx-auto mb-1 w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gray-400">Cliquer pour choisir une image</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) { setImageFile(f); setPreview(URL.createObjectURL(f)); }
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label>Nom (FR) <span className="text-error-500">*</span></Label>
          <Input {...register("name_fr")} placeholder="Nom français" error={!!errors.name_fr} hint={errors.name_fr?.message} />
        </div>
        <div>
          <Label>Nom (AR) <span className="text-error-500">*</span></Label>
          <input dir="rtl" {...register("name_ar")} placeholder="الاسم بالعربية" className={fieldClass} />
          {errors.name_ar && <p className="mt-1 text-xs text-error-500">{errors.name_ar.message}</p>}
        </div>
        <div>
          <Label>Nom (EN) <span className="text-error-500">*</span></Label>
          <Input {...register("name_en")} placeholder="English name" error={!!errors.name_en} hint={errors.name_en?.message} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Ordre d'affichage</Label>
          <Input
            type="number"
            {...register("sort_order", { valueAsNumber: true })}
            placeholder="0"
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input
            id="cat-active"
            type="checkbox"
            {...register("active")}
            className="w-4 h-4 accent-brand-500"
          />
          <label htmlFor="cat-active" className="text-sm text-gray-700 dark:text-gray-300">
            Actif
          </label>
        </div>
      </div>

      {uploadPct > 0 && uploadPct < 100 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Envoi en cours…</span>
            <span>{uploadPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-brand-500 transition-all duration-200"
              style={{ width: `${uploadPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
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

export function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [selected, setSelected] = useState<Category | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const { data: categories, isLoading } = useGetCategories({
    search: search || undefined,
    active:
      activeFilter === "" ? undefined : activeFilter === "true",
  });

  const { mutate: deleteCategory } = useDeleteCategory();

  const handleEdit = (cat: Category) => {
    setSelected(cat);
    openModal();
  };

  const handleCreate = () => {
    setSelected(null);
    openModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Supprimer cette catégorie ?")) deleteCategory(id);
  };

  const selectClass =
    "h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  const thClass =
    "px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 text-start";

  return (
    <>
      <PageMeta title="Catégories | Coq Zaman" description="" />
      <PageBreadcrumb pageTitle="Catégories" />

      <div className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 dark:bg-gray-900"
            />
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className={selectClass}
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
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
                  <TableCell isHeader className={thClass}>Catégorie</TableCell>
                  <TableCell isHeader className={thClass}>Nom (AR)</TableCell>
                  <TableCell isHeader className={thClass}>Nom (EN)</TableCell>
                  <TableCell isHeader className={thClass}>Ordre</TableCell>
                  <TableCell isHeader className={thClass}>Statut</TableCell>
                  <TableCell isHeader className={thClass}>Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {isLoading ? (
                  <TableRow>
                    <TableCell className="px-5 py-10 text-center text-gray-400 text-sm">
                      Chargement…
                    </TableCell>
                  </TableRow>
                ) : !categories?.length ? (
                  <TableRow>
                    <TableCell className="px-5 py-10 text-center text-gray-400 text-sm">
                      Aucune catégorie trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {cat.image_url ? (
                            <img
                              src={cat.image_url}
                              alt={cat.name_fr}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0" />
                          )}
                          <span className="font-medium text-gray-800 dark:text-white/90 text-sm">
                            {cat.name_fr}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm text-right" dir="rtl">
                        {cat.name_ar}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {cat.name_en}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {cat.sort_order}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge size="sm" color={cat.active ? "success" : "error"}>
                          {cat.active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                            title="Modifier"
                          >
                            <PencilIcon className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
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
        </div>
      </div>

      <Footer />

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-xl mx-4">
        <CategoryForm category={selected} onClose={closeModal} />
      </Modal>
    </>
  );
}
