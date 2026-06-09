import { BrowserRouter } from "react-router";
import { AdminRoutes, AuthRoutes } from "./components";
import { useAuthCookie, useHandleLanguage } from "core";
import { ScrollToTop } from "components";
import { useEffect } from "react";

export function AppRoutes() {
  const { status } = useAuthCookie();
  const lang = useHandleLanguage((s) => s.language);

  useEffect(() => {
    const isRtl = lang === "ar";
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.body.classList.toggle("rtl", isRtl);
  }, [lang]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      {status === "signIn" ? <AdminRoutes /> : <AuthRoutes />}
    </BrowserRouter>
  );
}
