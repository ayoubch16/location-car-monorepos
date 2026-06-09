import { Link, Outlet, useNavigate } from "react-router";
import { auth } from "../auth";
import { client } from "../api/client";

export default function Layout() {
  const navigate = useNavigate();
  const user = auth.getUser();
  const loggedIn = auth.isLoggedIn();

  const handleLogout = async () => {
    try {
      await client.post("auth/logout");
    } catch (_) {
      // ignore
    }
    auth.logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-orange-500 transition-colors"
          >
            <span>🚗</span> AutoLoc
          </Link>
          <nav className="flex items-center gap-3">
            {loggedIn ? (
              <>
                <Link
                  to="/mes-reservations"
                  className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
                >
                  Mes réservations
                </Link>
                <span className="text-sm text-gray-500 hidden sm:block">
                  {user?.prenom} {user?.nom}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm px-4 py-1.5 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
              >
                Connexion
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
