import { Navigate, Outlet, useLocation } from "react-router";
import { auth } from "../auth";

export default function PrivateRoute() {
  const location = useLocation();
  if (!auth.isLoggedIn()) {
    const to = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${to}`} replace />;
  }
  return <Outlet />;
}
