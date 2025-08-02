"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("/api/session", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.error || "Erreur lors de la vérification de la session"
          );
        }
        setUser(data.user);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Une erreur inconnue est survenue");
        }
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; max-age=0; SameSite=Strict";
        router.push("/login");
      }
    };

    fetchSession();
  }, [router]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; max-age=0; SameSite=Strict";
      setUser(null);
      router.push("/login");
    } catch (err) {
      setError("Erreur lors de la déconnexion");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <div className="text-red-600 text-center">{error}</div>;
  }

  if (!user) {
    return <div className="text-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Bienvenue, {user.name} !
        </h2>
        <p className="text-center mb-6">Email: {user.email}</p>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Déconnexion en cours..." : "Déconnexion"}
        </button>
      </div>
    </div>
  );
}
