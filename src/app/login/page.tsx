"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Anchor, ArrowRight, ShieldCheck, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center p-4 selection:bg-zinc-800">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-md">
            <Anchor className="w-6 h-6 text-zinc-200" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 font-mono">
            SHIPYARD
          </h1>
          <p className="text-xs text-zinc-400">
            Zero-Configuration Self-Hosted Developer Platform
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#0e0e11] border border-zinc-800/80 rounded-lg p-6 shadow-2xl space-y-4">
          <div className="border-b border-zinc-800/60 pb-3">
            <h2 className="text-sm font-medium text-zinc-200">Sign in to Control Plane</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Enter your administrator credentials to access your cluster
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/80 rounded text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@shipyard.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 rounded text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{isLoading ? "Signing in..." : "Sign In"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Security Footer Notice */}
        <div className="text-center">
          <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted at rest with AES-256-GCM | Isolated Worker Nodes</span>
          </p>
        </div>
      </div>
    </div>
  );
}
