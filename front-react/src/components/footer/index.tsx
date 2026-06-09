import { useTranslation } from "react-i18next";

type footerType = { EXTRA_CLASS?: string };
export function Footer({ EXTRA_CLASS }: footerType) {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center items-center">
      <p
        className={
          "absolute bottom-4   text-sm text-center text-gray-500  dark:text-gray-400 " +
          EXTRA_CLASS
        }
      >
        {new Date().getFullYear()} - {t("components.footer.first-line")}
        <br />
        &copy; {t("components.footer.seconde-line")}
      </p>
    </div>
  );
}
