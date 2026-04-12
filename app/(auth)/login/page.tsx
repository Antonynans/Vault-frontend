"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, CreditCard } from "lucide-react";
import { authApi, authCookies, tokenStore } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/components/ui/Toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { add } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const data = res.data?.data || res.data;

      tokenStore.set(data.accessToken);
      authCookies.setRefresh(data.refreshToken, data.user.id); // ← store both

      setUser(data.user);
      add("success", "Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      add("error", err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Left panel — branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative overflow-hidden"
        style={{
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* BG orbs */}
        <div
          className="absolute top-1/4 -left-20 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-1/4 right-0 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(0,200,150,0.06) 0%, transparent 70%)",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center animate-glow-pulse"
            style={{
              background: "var(--gold-dim)",
              border: "1px solid var(--border-active)",
            }}
          >
            <CreditCard size={20} style={{ color: "var(--gold)" }} />
          </div>
          <span
            className="font-display text-2xl"
            style={{ color: "var(--text-primary)" }}
          >
            Vault
          </span>
        </div>

        <div>
          <p
            className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
            style={{ color: "var(--gold)" }}
          >
            SECURE BANKING
          </p>
          <h2
            className="font-display text-5xl leading-tight mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Your money,
            <br />
            <em className="gold-text not-italic">protected.</em>
          </h2>
          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Multi-currency accounts, real-time transfers, and enterprise-grade
            security — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            ["₦2M+", "Transactions"],
            ["99.9%", "Uptime"],
            ["3", "Currencies"],
          ].map(([v, l]) => (
            <div key={l} className="glass rounded-xl p-4">
              <p className="font-display text-xl gold-text">{v}</p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                {l}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <CreditCard size={20} style={{ color: "var(--gold)" }} />
              <span
                className="font-display text-xl"
                style={{ color: "var(--text-primary)" }}
              >
                Vault
              </span>
            </div>
            <h1
              className="font-display text-3xl mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Sign in to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail size={16} />}
              autoComplete="email"
            />
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                Password
              </label>
              <div className="relative">
                <div
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Lock size={16} />
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="vault-input w-full rounded-xl px-4 py-3 text-sm pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs" style={{ color: "var(--red)" }}>
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-6"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <p
            className="text-center text-sm mt-6"
            style={{ color: "var(--text-muted)" }}
          >
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold hover:opacity-80 transition-opacity"
              style={{ color: "var(--gold)" }}
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
