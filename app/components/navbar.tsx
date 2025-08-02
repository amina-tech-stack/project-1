"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import styles from "./Form.module.css"; // Reuse existing CSS module or create a new one

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch("/api/session", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) {
            setUser(data.user);
          } else {
            localStorage.removeItem("token");
            setUser(null);
          }
        } catch {
          localStorage.removeItem("token");
          setUser(null);
        }
      }
    };
    fetchSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  };

  return (
    <header className="px-4 py-2 bg-gray-900 text-white shadow-lg font-work-sans sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center h-12">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="NexTech Innovations logo"
              width={80}
              height={26}
              className="hover:opacity-80 transition-opacity duration-200 object-contain"
            />
          </Link>
          <Link href="/" className="text-lg font-semibold">
            <span className="bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
              NexTech Innovations
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/create"
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-200 hover:text-white hover:bg-gray-800 rounded-md transition-colors duration-200"
              >
                <span className="max-sm:hidden">Créer</span>
                <User className="size-5 sm:hidden" />
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-200 hover:text-red-400 hover:bg-gray-800 rounded-md transition-colors duration-200"
              >
                <span className="max-sm:hidden">Déconnexion</span>
                <LogOut className="size-5 sm:hidden text-red-400" />
              </button>
              <Link href={`/user/${user._id}`} className="flex items-center">
                <div className="size-9 rounded-full bg-gray-700 text-white flex items-center justify-center">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-1.5 text-sm font-medium bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors duration-200"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
