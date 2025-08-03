"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
    } catch (err) {
      console.error("Erreur lors de la déconnexion", err);
    }
  };

  if (status === "loading") {
    return <div className="text-center">Chargement...</div>;
  }

  if (!session?.user) {
    return null; // Redirect will handle unauthenticated state
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Bienvenue, {session.user.name} !
        </h2>
        <p className="text-center mb-6">Email: {session.user.email}</p>
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}
