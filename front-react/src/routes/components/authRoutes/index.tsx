import { Route, Routes, Navigate } from "react-router";
import { SignIn, PasswordReset, NotFound } from "pages";
import { E_ROUTES } from "enums";

export function AuthRoutes() {
  return (
    <Routes>
      <Route path={E_ROUTES.LOGIN} element={<SignIn />} />
      <Route path={E_ROUTES.PASSWORD_RESET} element={<PasswordReset />} />
      <Route path={E_ROUTES.NOT_FOUND} element={<NotFound />} />
      {/* Any path (including former admin paths) redirects to login */}
      <Route
        path={E_ROUTES.ANY}
        element={<Navigate to={"/" + E_ROUTES.LOGIN} replace />}
      />
    </Routes>
  );
}
