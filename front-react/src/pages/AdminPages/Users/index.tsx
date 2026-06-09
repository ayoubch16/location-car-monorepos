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
import { PlusIcon, PencilIcon, TrashBinIcon, AngleLeftIcon, AngleRightIcon } from "assets";
import { useModal } from "core/hooks";
import {
  useGetUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "api/users";
import type { User, UserPayload, UserRole } from "api/users/types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  nom: z.string().min(1, "Requis"),
  prenom: z.string().min(1, "Requis"),
  email: z
    .string()
    .min(1, "Requis")
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Email invalide"),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  num_permis: z.string().optional(),
  date_naissance: z.string().optional(),
  role: z.enum(["client", "admin"] as const),
});

type UserFormData = z.infer<typeof schema>;

// ─── Form ─────────────────────────────────────────────────────────────────────

function UserForm({
  user,
  onClose,
}: {
  user: User | null;
  onClose: () => void;
}) {
  const { mutate: create, isLoading: creating } = useCreateUser();
  const { mutate: update, isLoading: updating } = useUpdateUser();
  const isLoading = creating || updating;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: user
      ? {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone ?? "",
          adresse: user.adresse ?? "",
          num_permis: user.num_permis ?? "",
          date_naissance: user.date_naissance ?? "",
          role: user.role,
        }
      : { role: "client", telephone: "", adresse: "", num_permis: "", date_naissance: "" },
  });

  const onSubmit = (data: UserFormData) => {
    const payload: UserPayload = {
      ...data,
      telephone: data.telephone?.trim() || undefined,
      adresse: data.adresse?.trim() || undefined,
      num_permis: data.num_permis?.trim() || undefined,
      date_naissance: data.date_naissance?.trim() || undefined,
      password: data.password?.trim() || undefined,
      password_confirmation: data.password_confirmation?.trim() || undefined,
      role: data.role as UserRole,
    };
    if (!user && !data.password) return;
    if (user) {
      const { password, password_confirmation, ...rest } = payload;
      update(
        { id: user.id, ...(password ? payload : rest) },
        { onSuccess: onClose },
      );
    } else {
      create(payload, { onSuccess: onClose });
    }
  };

  const selectClass =
    "h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="divide-y divide-gray-100 dark:divide-gray-800"
    >
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {user ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
        </h2>
      </div>

      <div className="px-6 py-4 space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Identité
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Nom <span className="text-error-500">*</span></Label>
            <Input
              {...register("nom")}
              placeholder="Nom de famille"
              error={!!errors.nom}
              hint={errors.nom?.message}
            />
          </div>
          <div>
            <Label>Prénom <span className="text-error-500">*</span></Label>
            <Input
              {...register("prenom")}
              placeholder="Prénom"
              error={!!errors.prenom}
              hint={errors.prenom?.message}
            />
          </div>
          <div>
            <Label>Email <span className="text-error-500">*</span></Label>
            <Input
              type="email"
              {...register("email")}
              placeholder="email@exemple.com"
              error={!!errors.email}
              hint={errors.email?.message}
            />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input type="tel" {...register("telephone")} placeholder="0612345678" />
          </div>
        </div>
        <div>
          <Label>Adresse</Label>
          <Input {...register("adresse")} placeholder="12 Rue Hassan II, Rabat" />
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Permis & Naissance
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>N° Permis</Label>
            <Input {...register("num_permis")} placeholder="B-123456" />
          </div>
          <div>
            <Label>Date de naissance</Label>
            <Input type="date" {...register("date_naissance")} />
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Accès
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>{user ? "Nouveau mot de passe" : "Mot de passe *"}</Label>
            <Input
              type="password"
              {...register("password")}
              placeholder={user ? "Laisser vide = inchangé" : "••••••"}
              error={!!errors.password}
              hint={errors.password?.message}
            />
          </div>
          <div>
            <Label>Confirmation</Label>
            <Input
              type="password"
              {...register("password_confirmation")}
              placeholder="••••••"
            />
          </div>
        </div>
        <div>
          <Label>Rôle</Label>
          <select {...register("role")} className={selectClass}>
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>
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

const ROLE_LABELS: Record<string, string> = {
  client: "Client",
  admin: "Admin",
};

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<User | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const { data: paginated, isLoading } = useGetUsers({
    role: (roleFilter as UserRole) || undefined,
    page,
  });

  const q = search.toLowerCase().trim();
  const users = (paginated?.data ?? []).filter((u) => {
    if (!q) return true;
    return (
      u.nom.toLowerCase().includes(q) ||
      u.prenom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.telephone ?? "").includes(q) ||
      (u.num_permis ?? "").toLowerCase().includes(q)
    );
  });
  const currentPage = paginated?.current_page ?? 1;
  const lastPage = paginated?.last_page ?? 1;
  const total = paginated?.total ?? 0;

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleRole = (v: string) => { setRoleFilter(v as UserRole | ""); setPage(1); };

  const { mutate: deleteUser } = useDeleteUser();

  const handleEdit = (u: User) => { setSelected(u); openModal(); };
  const handleCreate = () => { setSelected(null); openModal(); };
  const handleDelete = (id: number) => {
    if (window.confirm("Supprimer cet utilisateur ?")) deleteUser(id);
  };

  const selectClass =
    "h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  const thClass = "px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 text-start";

  return (
    <>
      <PageMeta title="Utilisateurs | Location Voiture" description="" />
      <PageBreadcrumb pageTitle="Utilisateurs" />

      <div className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Nom, email…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-10 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-900"
            />
            <select
              value={roleFilter}
              onChange={(e) => handleRole(e.target.value)}
              className={selectClass}
            >
              <option value="">Tous les rôles</option>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
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
                  <TableCell isHeader className={thClass}>Nom complet</TableCell>
                  <TableCell isHeader className={thClass}>Email</TableCell>
                  <TableCell isHeader className={thClass}>Téléphone</TableCell>
                  <TableCell isHeader className={thClass}>N° Permis</TableCell>
                  <TableCell isHeader className={thClass}>Rôle</TableCell>
                  <TableCell isHeader className={thClass}>Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <TableLoader />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="px-5 py-4">
                        <span className="block font-medium text-gray-800 dark:text-white/90 text-sm">
                          {u.nom} {u.prenom}
                        </span>
                        {u.adresse && (
                          <span className="block text-xs text-gray-400">{u.adresse}</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {u.email}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {u.telephone ?? "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm font-mono">
                        {u.num_permis ?? "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge size="sm" color={u.role === "admin" ? "warning" : "info"}>
                          {ROLE_LABELS[u.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(u)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                            title="Modifier"
                          >
                            <PencilIcon className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
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
                <span className="font-medium text-gray-700 dark:text-gray-200">{currentPage}</span>{" "}
                sur{" "}
                <span className="font-medium text-gray-700 dark:text-gray-200">{lastPage}</span>
                {total > 0 && (
                  <span className="ml-2 text-gray-400">
                    ({total} utilisateur{total > 1 ? "s" : ""})
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

                {Array.from({ length: lastPage }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === lastPage || Math.abs(p - currentPage) <= 1,
                  )
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
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
        <UserForm user={selected} onClose={closeModal} />
      </Modal>
    </>
  );
}
