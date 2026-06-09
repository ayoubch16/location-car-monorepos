import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageMeta, PageBreadcrumb, Footer } from "components";
import { Button } from "components/ui";
import { Input } from "components/form/input";
import { Label } from "components/form";
import { useGetProfile, useUpdateProfile } from "api/profile";
import type { ProfilePayload } from "api/profile";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z
  .object({
    nom: z.string().min(1, "Requis"),
    prenom: z.string().min(1, "Requis"),
    email: z
      .string()
      .min(1, "Requis")
      .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Email invalide"),
    telephone: z.string().optional(),
    adresse: z.string().optional(),
    num_permis: z.string().optional(),
    date_naissance: z.string().optional(),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
  })
  .refine(
    (d) => !d.password || d.password === d.password_confirmation,
    { message: "Les mots de passe ne correspondent pas", path: ["password_confirmation"] },
  );

type ProfileForm = z.infer<typeof schema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export function UserProfiles() {
  const { data: profile, isLoading } = useGetProfile();
  const { mutate: update, isLoading: saving } = useUpdateProfile();
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom: "", prenom: "", email: "",
      telephone: "", adresse: "", num_permis: "", date_naissance: "",
      password: "", password_confirmation: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        nom: profile.nom,
        prenom: profile.prenom,
        email: profile.email,
        telephone: profile.telephone ?? "",
        adresse: profile.adresse ?? "",
        num_permis: profile.num_permis ?? "",
        date_naissance: profile.date_naissance ?? "",
        password: "",
        password_confirmation: "",
      });
    }
  }, [profile, reset]);

  const cancelEdit = () => {
    if (profile) {
      reset({
        nom: profile.nom, prenom: profile.prenom, email: profile.email,
        telephone: profile.telephone ?? "",
        adresse: profile.adresse ?? "",
        num_permis: profile.num_permis ?? "",
        date_naissance: profile.date_naissance ?? "",
        password: "", password_confirmation: "",
      });
    }
    setEditing(false);
  };

  const onSubmit = (data: ProfileForm) => {
    const payload: ProfilePayload = {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      telephone: data.telephone?.trim() || undefined,
      adresse: data.adresse?.trim() || undefined,
      num_permis: data.num_permis?.trim() || undefined,
      date_naissance: data.date_naissance?.trim() || undefined,
      password: data.password?.trim() || undefined,
      password_confirmation: data.password_confirmation?.trim() || undefined,
    };
    update(payload, { onSuccess: () => setEditing(false) });
  };

  const ro = !editing; // read-only shorthand
  const sectionTitle = "text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500";

  return (
    <>
      <PageMeta title="Mon profil | Location Voiture" description="" />
      <PageBreadcrumb pageTitle="Mon profil" />

      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] flex items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                {profile ? (`${profile.nom?.[0] ?? ""}${profile.prenom?.[0] ?? ""}`).toUpperCase() || "?" : "…"}
              </span>
            </div>
            <div>
              {isLoading ? (
                <div className="h-5 w-40 rounded bg-gray-100 dark:bg-gray-800 animate-pulse mb-1" />
              ) : (
                <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {profile?.nom} {profile?.prenom}
                </p>
              )}
              <p className="text-sm text-gray-400 capitalize">{profile?.role ?? "—"}</p>
            </div>
          </div>

          {!editing && (
            <Button
              type="button"
              size="sm"
              onClick={() => setEditing(true)}
              disabled={isLoading}
            >
              Modifier
            </Button>
          )}
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] divide-y divide-gray-100 dark:divide-gray-800"
        >
          {/* Identité */}
          <div className="p-6 space-y-4">
            <p className={sectionTitle}>Identité</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Nom <span className="text-error-500">*</span></Label>
                <Input
                  {...register("nom")}
                  placeholder="Nom de famille"
                  disabled={isLoading || ro}
                  error={!!errors.nom}
                  hint={errors.nom?.message}
                />
              </div>
              <div>
                <Label>Prénom <span className="text-error-500">*</span></Label>
                <Input
                  {...register("prenom")}
                  placeholder="Prénom"
                  disabled={isLoading || ro}
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
                  disabled={isLoading || ro}
                  error={!!errors.email}
                  hint={errors.email?.message}
                />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input
                  type="tel"
                  {...register("telephone")}
                  placeholder="0612345678"
                  disabled={isLoading || ro}
                />
              </div>
            </div>
            <div>
              <Label>Adresse</Label>
              <Input
                {...register("adresse")}
                placeholder="12 Rue Hassan II, Rabat"
                disabled={isLoading || ro}
              />
            </div>
          </div>

          {/* Permis & Naissance */}
          <div className="p-6 space-y-4">
            <p className={sectionTitle}>Permis & Naissance</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>N° Permis</Label>
                <Input
                  {...register("num_permis")}
                  placeholder="B-123456"
                  disabled={isLoading || ro}
                />
              </div>
              <div>
                <Label>Date de naissance</Label>
                <Input
                  type="date"
                  {...register("date_naissance")}
                  disabled={isLoading || ro}
                />
              </div>
            </div>
          </div>

          {/* Mot de passe — only shown in edit mode */}
          {editing && (
            <div className="p-6 space-y-4">
              <p className={sectionTitle}>Changer le mot de passe</p>
              <p className="text-xs text-gray-400">Laissez vide pour conserver votre mot de passe actuel.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nouveau mot de passe</Label>
                  <Input
                    type="password"
                    {...register("password")}
                    placeholder="••••••"
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
                    error={!!errors.password_confirmation}
                    hint={errors.password_confirmation?.message}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions — only shown in edit mode */}
          {editing && (
            <div className="p-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancelEdit}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={saving}
                disabled={!isDirty}
              >
                Enregistrer
              </Button>
            </div>
          )}
        </form>
      </div>

      <Footer />
    </>
  );
}
