import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import toast from "react-hot-toast";
import { client } from "../api/client";
import { auth } from "../auth";
import { Spinner } from "../components/Spinner";

type Tab = "login" | "register";

type ApiError = {
  response?: { status?: number; data?: { message?: string } };
};

export default function LoginPage() {
  const navigate        = useNavigate();
  const [params]        = useSearchParams();
  const redirect        = params.get("redirect") ?? "/";
  const [tab, setTab]   = useState<Tab>("login");

  useEffect(() => {
    if (auth.isLoggedIn()) navigate(redirect, { replace: true });
  }, [navigate, redirect]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Espace Client</h1>
          <p className="text-gray-500 text-sm mt-1">
            Connectez-vous ou créez un compte pour réserver
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  tab === t
                    ? "text-orange-500 border-b-2 border-orange-500 bg-orange-50/50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === "login" ? (
              <LoginForm redirect={redirect} />
            ) : (
              <RegisterForm onSuccess={() => setTab("login")} />
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/" className="text-orange-500 hover:underline">
            ← Retour aux voitures
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginForm({ redirect }: { redirect: string }) {
  const navigate      = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await client.post("auth/login", { email, password });
      auth.setToken(data.access_token as string);
      auth.setUser(data.user);
      navigate(redirect, { replace: true });
    } catch (err) {
      const e = err as ApiError;
      if (e.response?.status === 401) {
        setError("Email ou mot de passe incorrect.");
      } else {
        setError(e.response?.data?.message ?? "Erreur de connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          required
          autoComplete="email"
          className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Spinner size="sm" />}
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.password_confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await client.post("auth/register", form);
      toast.success("Compte créé ! Connectez-vous maintenant.");
      onSuccess();
    } catch (err) {
      const e = err as ApiError;
      setError(e.response?.data?.message ?? "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400";

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom
          </label>
          <input
            value={form.prenom}
            onChange={set("prenom")}
            placeholder="Ali"
            required
            autoComplete="given-name"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom
          </label>
          <input
            value={form.nom}
            onChange={set("nom")}
            placeholder="Alami"
            required
            autoComplete="family-name"
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="votre@email.com"
          required
          autoComplete="email"
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone
        </label>
        <input
          type="tel"
          value={form.telephone}
          onChange={set("telephone")}
          placeholder="06 12 34 56 78"
          autoComplete="tel"
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe
        </label>
        <input
          type="password"
          value={form.password}
          onChange={set("password")}
          placeholder="••••••••"
          required
          autoComplete="new-password"
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmer le mot de passe
        </label>
        <input
          type="password"
          value={form.password_confirmation}
          onChange={set("password_confirmation")}
          placeholder="••••••••"
          required
          autoComplete="new-password"
          className={inputCls}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Spinner size="sm" />}
        {loading ? "Création…" : "Créer mon compte"}
      </button>
    </form>
  );
}
