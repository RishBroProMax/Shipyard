"use client";

import { useState, useEffect } from "react";
import {
  Anchor,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  Terminal,
  CheckCircle2,
  Sparkles,
  KeyRound,
  Server,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Redirect if already authenticated — use hard navigation to respect cookie
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((res) => {
        if (res.ok) {
          window.location.href = "/";
        }
      })
      .catch(() => {})
      .finally(() => setIsCheckingAuth(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "same-origin" ensures the Set-Cookie header is applied
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials. Please verify your email and password.");
      }

      // Use a hard navigation (not client-side router.push) so the browser
      // sends the newly-set session cookie on the very next request.
      // router.push() does a SPA navigation which may fire before the cookie
      // is committed, causing the middleware to redirect back to /login.
      window.location.href = "/";
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  const handleUseDefaultEmail = () => {
    setEmail("admin@shipyard.local");
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
          <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span>Verifying appliance session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center p-4 selection:bg-cyan-500/20 selection:text-cyan-200 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Background Grid */}
      <div className="absolute inset-0 bg-grid-subtle opacity-40 pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700/80 text-cyan-400 shadow-xl shadow-cyan-950/30 group">
            <Anchor className="w-7 h-7 group-hover:scale-105 transition-transform" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-white font-mono">
                SHIPYARD
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 font-semibold tracking-wide uppercase">
                Appliance
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Zero-Configuration Self-Hosted Control Plane
            </p>
          </div>

          {/* Online Gateway Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 shadow-sm backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Control Plane Authentication Gateway</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#0e0f14]/90 backdrop-blur-xl border border-zinc-800/90 rounded-2xl p-7 shadow-2xl space-y-5 ring-1 ring-white/5">
          <div className="border-b border-zinc-800/70 pb-4">
            <h2 className="text-sm font-semibold text-white">Sign In to Dashboard</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Enter your administrator credentials to access this node.
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span>{error}</span>
                <div className="mt-2 space-y-1.5 text-[11px] text-red-300/80 border-t border-red-800/40 pt-2">
                  <p>Check your credentials in the secrets file on the VPS:</p>
                  <code className="block bg-black/60 px-2 py-1 rounded font-mono text-red-200 text-[10px]">
                    cat /var/lib/shipyard/data/secrets/shipyard.secret.json
                  </code>
                  <p className="mt-1">Or check the auth diagnostics at:</p>
                  <code className="block bg-black/60 px-2 py-1 rounded font-mono text-red-200 text-[10px]">
                    {typeof window !== "undefined" ? window.location.origin : ""}/api/auth/debug
                  </code>
                </div>
              </div>
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">
                  Administrator Email
                </label>
                {!email && (
                  <button
                    type="button"
                    onClick={handleUseDefaultEmail}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors underline"
                  >
                    Use default
                  </button>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@shipyard.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-900/90 border border-zinc-750 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Administrator Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-900/90 border border-zinc-750 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-400 hover:text-zinc-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Stay signed in for 14 days</span>
              </label>

              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Need help?</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-zinc-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Control Plane</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* First-Time Setup & Credential Helper Accordion */}
          {showHelp && (
            <div className="pt-3 border-t border-zinc-800 text-xs space-y-2 text-zinc-400 animate-in fade-in duration-200">
              <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>First-Time Setup Credentials</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Your credentials were created when running <code className="text-zinc-200">install.sh</code>.
                They are securely stored on your VPS at:
              </p>
              <pre className="p-2 bg-black rounded border border-zinc-800 text-[10px] text-zinc-300 font-mono overflow-x-auto">
cat /var/lib/shipyard/data/secrets/shipyard.secret.json
              </pre>

              <div className="pt-1">
                <span className="text-[11px] font-semibold text-zinc-300 block mb-1">
                  Reset password from host terminal:
                </span>
                <pre className="p-2 bg-black rounded border border-zinc-800 text-[10px] text-cyan-300 font-mono overflow-x-auto">
shipyard reset-password
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice Footer */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AES-256-GCM Session Tokens · HttpOnly Secure Cookies</span>
          </p>
          <p className="text-[10px] text-zinc-600">
            Protected self-contained appliance on this machine.
          </p>
        </div>
      </div>
    </div>
  );
}
