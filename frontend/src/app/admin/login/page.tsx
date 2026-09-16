"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f5]">
        <div className="text-xs font-semibold uppercase tracking-widest text-[#8a948c] animate-pulse">
          Authenticating...
        </div>
      </div>
    );
  }

  if (user) {
    router.push("/admin");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f5] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#ede8dd] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-2xl font-bold tracking-tight text-[#1e3d2f]">
            Wild<span className="text-[#c98a2c]">Hive</span>
          </Link>
          <div className="mt-2 inline-block rounded-full bg-[#1e3d2f]/5 px-3 py-1 text-[11px] font-semibold tracking-wider text-[#1e3d2f] uppercase">
            Management Portal
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6b7770]">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[#ede8dd] bg-[#faf9f5] px-3.5 py-2.5 text-sm text-[#1c2e24] outline-none transition placeholder:text-[#8a948c] focus:border-[#1e3d2f] focus:bg-white"
              placeholder="admin@wildhive.com"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b7770]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-medium text-[#c98a2c] hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-[#ede8dd] bg-[#faf9f5] px-3.5 py-2.5 text-sm text-[#1c2e24] outline-none transition placeholder:text-[#8a948c] focus:border-[#1e3d2f] focus:bg-white"
              placeholder="••••••••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-2.5 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#1e3d2f] py-3 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#152c22] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In to Admin"}
          </button>
        </form>

        <div className="mt-8 border-t border-[#ede8dd] pt-4 text-center">
          <Link href="/" className="text-xs font-medium text-[#8a948c] transition hover:text-[#1e3d2f]">
            ← Return to WildHive Public Store
          </Link>
        </div>
      </div>
    </div>
  );
}
