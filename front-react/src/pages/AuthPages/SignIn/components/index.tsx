import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";

import { EnvelopeIcon, LockIcon } from "assets";
import { Button, Footer, Checkbox, SimpleInput } from "components";
import { E_ROUTES } from "enums";
import { useLogin } from "api";

export default function SignInForm() {
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);

  const { mutate: login, isLoading } = useLogin();

  const schema = z.object({
    email: z
      .string()
      .min(1, t("validation.required"))
      .refine(
        (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        t("validation.invalidEmail"),
      ),
    password: z
      .string()
      .min(1, t("validation.required"))
      .min(6, t("validation.minPassword")),
  });

  type SignInFormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: SignInFormData) => {
    login({ email: data.email, password: data.password });
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t("pages.auth.login.title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("pages.auth.login.subtitle")}
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-6">
                <SimpleInput
                  label={t("pages.auth.login.emailLabel")}
                  placeholder={t("pages.auth.login.emailPlaceholder")}
                  icon={<EnvelopeIcon className="size-6" />}
                  type="email"
                  registration={register("email")}
                  errorText={errors.email?.message}
                />

                <SimpleInput
                  label={t("pages.auth.login.passwordLabel")}
                  placeholder={t("pages.auth.login.passwordPlaceholder")}
                  icon={<LockIcon className="size-6" />}
                  password
                  registration={register("password")}
                  errorText={errors.password?.message}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      {t("pages.auth.login.keepLoggedIn")}
                    </span>
                  </div>
                  <Link
                    to={"/" + E_ROUTES.PASSWORD_RESET}
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    {t("pages.auth.login.forgotPassword")}
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full"
                  size="sm"
                  isLoading={isLoading}
                >
                  {t("pages.auth.login.submit")}
                </Button>
              </div>
            </form>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
