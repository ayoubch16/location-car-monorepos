import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useTranslation } from "react-i18next";
import { Footer, SimpleInput } from "components";
import { Button } from "components/ui";
import { E_ROUTES } from "enums";
import { EnvelopeIcon } from "assets";
import { useForgotPassword } from "api";

const schema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Email invalide"),
});

type FormData = z.infer<typeof schema>;

export function SignUpForm() {
  const { t } = useTranslation();
  const { mutate: forgotPassword, isLoading } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = ({ email }: FormData) => {
    forgotPassword(email);
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t("pages.auth.reset.title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("pages.auth.reset.subtitle")}
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-5">
                <SimpleInput
                  label={t("pages.auth.reset.emailLabel")}
                  placeholder={t("pages.auth.reset.emailPlaceholder")}
                  icon={<EnvelopeIcon className="size-6" />}
                  type="email"
                  registration={register("email")}
                  errorText={errors.email?.message}
                />

                <Button
                  type="submit"
                  className="w-full rounded-full"
                  size="sm"
                  isLoading={isLoading}
                >
                  {t("pages.auth.reset.submit")}
                </Button>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                {t("pages.auth.reset.alreadyHaveAccount")}{" "}
                <Link
                  to={"/" + E_ROUTES.LOGIN}
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  {t("pages.auth.reset.backToLogin")}
                </Link>
              </p>
            </div>
            <Footer EXTRA_CLASS="mt-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
