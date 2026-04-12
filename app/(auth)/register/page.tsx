"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Phone, CreditCard, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const { add } = useToast();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.firstName) e.firstName = "Required";
    if (!form.lastName) e.lastName = "Required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email required";
    if (!form.password || form.password.length < 8)
      e.password = "Min 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.register(form);
      add("success", "Account created! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      add("error", err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,200,150,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
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
          <h1
            className="font-display text-3xl mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Create your account
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Start managing your finances today
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                value={form.firstName}
                onChange={set("firstName")}
                error={errors.firstName}
                icon={<User size={15} />}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={form.lastName}
                onChange={set("lastName")}
                error={errors.lastName}
                icon={<User size={15} />}
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              error={errors.email}
              icon={<Mail size={15} />}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+234 800 000 0000"
              value={form.phoneNumber}
              onChange={set("phoneNumber")}
              icon={<Phone size={15} />}
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
                  <Lock size={15} />
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={set("password")}
                  className="vault-input w-full rounded-xl px-4 py-3 text-sm pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs" style={{ color: "var(--red)" }}>
                  {errors.password}
                </p>
              )}
              {form.password && (
                <div className="flex gap-1 mt-1">
                  {[4, 7, 10].map((min, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all"
                      style={{
                        background:
                          form.password.length >= min
                            ? ["var(--red)", "var(--gold)", "var(--green)"][i]
                            : "var(--border)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              size="lg"
            >
              Create Account
            </Button>
          </form>
        </div>

        <p
          className="text-center text-sm mt-5"
          style={{ color: "var(--text-muted)" }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "var(--gold)" }}
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
