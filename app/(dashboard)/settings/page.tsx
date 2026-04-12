"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Key, Shield, User } from "lucide-react";
import { pinApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { getInitials } from "@/lib/utils";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { add } = useToast();
  const [tab, setTab] = useState<"profile" | "pin" | "security">("profile");
  const [pinForm, setPinForm] = useState({ pin: "", oldPin: "", newPin: "" });
  const [pinLoading, setPinLoading] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinForm.pin || pinForm.pin.length !== 4) { add("error", "PIN must be 4 digits"); return; }
    setPinLoading(true);
    try {
      await pinApi.set({ pin: pinForm.pin });
      add("success", "Transaction PIN set!");
      setHasPin(true);
      setPinForm(f => ({ ...f, pin: "" }));
    } catch (err: any) { add("error", err?.response?.data?.message || "Failed"); }
    finally { setPinLoading(false); }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinForm.oldPin || !pinForm.newPin || pinForm.newPin.length !== 4) { add("error", "New PIN must be 4 digits"); return; }
    setPinLoading(true);
    try {
      await pinApi.change({ oldPin: pinForm.oldPin, newPin: pinForm.newPin });
      add("success", "PIN changed!");
      setPinForm({ pin: "", oldPin: "", newPin: "" });
    } catch (err: any) { add("error", err?.response?.data?.message || "Failed"); }
    finally { setPinLoading(false); }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "pin", label: "Transaction PIN", icon: Key },
    { id: "security", label: "Security", icon: Shield },
  ] as const;

  return (
    <AppShell>
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl mb-8" style={{ color: "var(--text-primary)" }}>
        Settings
      </motion.h1>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tab nav */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
          <div className="glass rounded-2xl p-2 space-y-0.5">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left sidebar-item ${tab === id ? "active" : ""}`}
                style={{ color: tab === id ? "var(--gold)" : "var(--text-secondary)" }}>
                <Icon size={16} />{label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-3">
          {tab === "profile" && user && (
            <div className="glass rounded-2xl p-8 space-y-6">
              <h2 className="font-display text-xl" style={{ color: "var(--text-primary)" }}>Profile Information</h2>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: "var(--gold)", color: "#000" }}>
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div>
                  <p className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>{user.firstName} {user.lastName}</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user.email}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: "var(--gold-dim)", color: "var(--gold)" }}>{user.role}</span>
                </div>
              </div>
              <div className="grid gap-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <Input label="First Name" value={user.firstName} readOnly className="opacity-60 cursor-not-allowed" />
                <Input label="Last Name" value={user.lastName} readOnly className="opacity-60 cursor-not-allowed" />
                <Input label="Email" value={user.email} readOnly className="opacity-60 cursor-not-allowed" />
                {user.phone && <Input label="Phone" value={user.phone} readOnly className="opacity-60 cursor-not-allowed" />}
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Profile editing coming soon. Contact support to update your details.</p>
            </div>
          )}

          {tab === "pin" && (
            <div className="glass rounded-2xl p-8">
              <h2 className="font-display text-xl mb-2" style={{ color: "var(--text-primary)" }}>Transaction PIN</h2>
              <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>Your 4-digit PIN is required for all transfers and withdrawals.</p>

              <div className="grid gap-8">
                <form onSubmit={handleSetPin} className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gold-dim)" }}><Key size={15} style={{ color: "var(--gold)" }} /></div>
                    <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Set PIN</h3>
                  </div>
                  <Input label="New 4-digit PIN" type="password" inputMode="numeric" maxLength={4} placeholder="••••"
                    value={pinForm.pin} onChange={(e) => setPinForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, "") }))} />
                  <Button type="submit" loading={pinLoading} size="md">Set PIN</Button>
                </form>

                <div style={{ borderTop: "1px solid var(--border)" }} className="pt-8">
                  <form onSubmit={handleChangePin} className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--blue-dim)" }}><Lock size={15} style={{ color: "var(--blue)" }} /></div>
                      <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Change PIN</h3>
                    </div>
                    <Input label="Current PIN" type="password" inputMode="numeric" maxLength={4} placeholder="••••"
                      value={pinForm.oldPin} onChange={(e) => setPinForm(f => ({ ...f, oldPin: e.target.value.replace(/\D/g, "") }))} />
                    <Input label="New PIN" type="password" inputMode="numeric" maxLength={4} placeholder="••••"
                      value={pinForm.newPin} onChange={(e) => setPinForm(f => ({ ...f, newPin: e.target.value.replace(/\D/g, "") }))} />
                    <Button type="submit" variant="ghost" loading={pinLoading} size="md">Change PIN</Button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {tab === "security" && (
            <div className="glass rounded-2xl p-8 space-y-6">
              <h2 className="font-display text-xl" style={{ color: "var(--text-primary)" }}>Security</h2>
              {[
                { label: "JWT Auth", desc: "15-minute access tokens with 7-day refresh", active: true },
                { label: "Rate Limiting", desc: "Global throttle protection on all endpoints", active: true },
                { label: "KYC Required", desc: "Identity verification for Premium tier", active: true },
                { label: "Idempotency Guard", desc: "Duplicate transaction prevention", active: true },
              ].map(({ label, desc, active }) => (
                <div key={label} className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: active ? "var(--green)" : "var(--text-muted)" }} />
                    <span className="text-xs font-medium" style={{ color: active ? "var(--green)" : "var(--text-muted)" }}>{active ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}
