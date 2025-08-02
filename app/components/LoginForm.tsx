"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Github, Chrome } from "lucide-react";
import { signIn, useSession, signOut } from "next-auth/react";

interface FormData {
  email: string;
  password: string;
}

interface TokenValidationResponse {
  valid: boolean;
  user?: { id: string; name: string; email: string };
  error?: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check token validity on component mount
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch("/api/validate-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const data: TokenValidationResponse = await res.json();
          if (data.valid && data.user) {
            setIsTokenValid(true);
            setUser(data.user);
          } else {
            setIsTokenValid(false);
            localStorage.removeItem("token");
            document.cookie = "token=; path=/; max-age=0; SameSite=Strict";
          }
        } catch (err) {
          setIsTokenValid(false);
          localStorage.removeItem("token");
          document.cookie = "token=; path=/; max-age=0; SameSite=Strict";
        }
      }
    };

    validateToken();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle form submission for credentials login
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la connexion");
      }

      localStorage.setItem("token", data.token);
      document.cookie = `token=${data.token}; path=/; max-age=3600; SameSite=Strict`;
      setMessage("Connexion réussie !");
      setFormData({ email: "", password: "" });
      setIsTokenValid(true);
      setUser(data.user || { id: "1", name: "User", email: formData.email });
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur inconnue est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle provider-based login (Google, GitHub)
  const handleProviderLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("Erreur lors de la connexion avec " + provider);
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Clear next-auth session if exists
      if (status === "authenticated") {
        await signOut({ redirect: false });
      }
      // Clear custom token
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; max-age=0; SameSite=Strict";
      setIsTokenValid(false);
      setUser(null);
      setMessage("Déconnexion réussie !");
      router.push("/login");
    } catch (err) {
      setError("Erreur lors de la déconnexion");
    } finally {
      setIsLoading(false);
    }
  };

  // If user is logged in (via next-auth or custom token)
  if (status === "authenticated" || isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-gradient-bg">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-500 hover:scale-105">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="NexTech Innovations logo"
                width={160}
                height={40}
                className="hover:opacity-90 transition-opacity duration-300"
              />
            </Link>
          </div>
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6 animate-fade-in-down">
            Vous êtes connecté !
          </h2>
          <p className="text-center text-gray-600 mb-4">
            Bienvenue, {session?.user?.name || user?.name || "Utilisateur"} !
          </p>
          <div className="space-y-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300"
            >
              Aller au tableau de bord
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Déconnexion en cours..." : "Déconnexion"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render login form if not authenticated
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-gradient-bg">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-500 hover:scale-105">
        <div className="flex justify-center mb-6">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="NexTech Innovations logo"
              width={160}
              height={40}
              className="hover:opacity-90 transition-opacity duration-300"
            />
          </Link>
        </div>
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6 animate-fade-in-down">
          Connexion à NexTech
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Adresse e-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
              placeholder="exemple@domaine.com"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                placeholder="Entrez votre mot de passe"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {message && (
            <p className="text-green-600 text-center text-sm font-medium animate-fade-in">
              {message}
            </p>
          )}
          {error && (
            <p className="text-red-600 text-center text-sm font-medium animate-fade-in">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Ou continuer avec
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <button
              onClick={() => handleProviderLogin("google")}
              disabled={isLoading}
              className="flex items-center justify-center py-2 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Chrome className="h-5 w-5 mr-2 text-gray-700" />
              Google
            </button>
            <button
              onClick={() => handleProviderLogin("github")}
              disabled={isLoading}
              className="flex items-center justify-center py-2 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Github className="h-5 w-5 mr-2 text-gray-700" />
              GitHub
            </button>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Pas de compte ?{" "}
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              S’inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
