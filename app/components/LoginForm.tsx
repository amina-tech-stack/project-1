"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Github, Chrome } from "lucide-react";
import { signIn, useSession, signOut } from "next-auth/react";

interface FormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email.trim(),
        password: formData.password.trim(),
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      setMessage("Login successful!");
      setFormData({ email: "", password: "" });
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (err) {
      setError(`Error logging in with ${provider}`);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      setMessage("Logout successful!");
      router.push("/login");
    } catch (err) {
      setError("Error logging out");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "authenticated") {
    return (
      <div className="text-center text-gray-200 font-mono tracking-wide text-base">
        Redirecting to dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-4">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="NexTech Innovations logo"
            width={120}
            height={30}
            className="hover:opacity-90 transition-opacity duration-300"
          />
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-200 font-mono"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border border-green-500/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300 bg-gray-900/60 hover:bg-gray-900 text-gray-200 font-mono text-base"
            placeholder="example@domain.com"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-200 font-mono"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border border-green-500/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300 bg-gray-900/60 hover:bg-gray-900 text-gray-200 font-mono text-base"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-400 transition-colors duration-200"
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
          <p className="text-green-400 text-center text-sm font-medium font-mono">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-500 text-center text-sm font-medium font-mono">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-lg hover:from-green-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-base"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div className="mt-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-green-500/60" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800/90 text-gray-200 font-mono">
              Or continue with
            </span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            onClick={() => handleProviderLogin("google")}
            disabled={isLoading}
            className="flex items-center justify-center py-2 px-4 bg-gray-900/60 border border-green-500/60 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 font-mono text-sm"
          >
            <Chrome className="h-5 w-5 mr-2 text-green-400" />
            Google
          </button>
          <button
            onClick={() => handleProviderLogin("github")}
            disabled={isLoading}
            className="flex items-center justify-center py-2 px-4 bg-gray-900/60 border border-green-500/60 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 font-mono text-sm"
          >
            <Github className="h-5 w-5 mr-2 text-green-400" />
            GitHub
          </button>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-200 font-mono">
          No account?{" "}
          <Link
            href="/signup"
            className="text-green-400 hover:text-green-500 font-medium transition-colors duration-200"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
