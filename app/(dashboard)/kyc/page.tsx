"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldX, Clock, Upload, AlertCircle } from "lucide-react";
import { kycApi } from "@/lib/api";
import { KycRecord } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";

const KYC_STEPS = [
  { title: "Personal Details", desc: "Verify your identity" },
  { title: "Document Upload", desc: "Provide government ID" },
  { title: "Review", desc: "Under review" },
];

export default function KycPage() {
  const { add } = useToast();
  const [kyc, setKyc] = useState<KycRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    documentType: "national_id",
    documentNumber: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    address: "",
  });

  useEffect(() => {
    kycApi
      .me()
      .then((r) => setKyc(r.data?.data || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await kycApi.submit(form);
      add("success", "KYC submitted for review!");
      const r = await kycApi.me();
      setKyc(r.data?.data || r.data);
    } catch (err: any) {
      add("error", err?.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  if (loading)
    return (
      <AppShell>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      </AppShell>
    );

  const status = kyc?.status || "not_submitted";
  const statusConfig = {
    approved: {
      icon: ShieldCheck,
      color: "var(--green)",
      bg: "var(--green-dim)",
      title: "KYC Verified",
      desc: "Your identity has been verified. You have full access.",
    },
    pending: {
      icon: Clock,
      color: "var(--gold)",
      bg: "var(--gold-dim)",
      title: "Under Review",
      desc: "Your documents are being reviewed. This usually takes 1–3 business days.",
    },
    rejected: {
      icon: ShieldX,
      color: "var(--red)",
      bg: "var(--red-dim)",
      title: "KYC Rejected",
      desc: `Reason: ${kyc?.note || "Please resubmit with valid documents."}`,
    },
    not_submitted: {
      icon: AlertCircle,
      color: "var(--blue)",
      bg: "var(--blue-dim)",
      title: "Verify Your Identity",
      desc: "Complete KYC to unlock higher transaction limits and Premium wallet tier.",
    },
  };

  const cfg =
    statusConfig[status as keyof typeof statusConfig] ||
    statusConfig.not_submitted;
  const Icon = cfg.icon;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          KYC Verification
        </motion.h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          Verify your identity to unlock full access
        </p>

        {/* Status banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 mb-8 flex items-start gap-4"
          style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${cfg.color}20` }}
          >
            <Icon size={24} style={{ color: cfg.color }} />
          </div>
          <div>
            <h2
              className="font-semibold text-lg mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {cfg.title}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {cfg.desc}
            </p>
          </div>
        </motion.div>

        {/* Progress steps */}
        <div className="flex items-center justify-between mb-8">
          {KYC_STEPS.map((step, i) => {
            const done =
              (status === "approved" && i <= 2) ||
              (status === "pending" && i <= 1) ||
              (status === "rejected" && i <= 1);
            const active = status === "not_submitted" && i === 0;
            return (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${done ? "text-black" : active ? "border-2" : ""}`}
                    style={{
                      background: done
                        ? "var(--gold)"
                        : active
                          ? "var(--gold-dim)"
                          : "var(--bg-card)",
                      border: done
                        ? "none"
                        : `1px solid ${active ? "var(--gold)" : "var(--border)"}`,
                      color: done
                        ? "#000"
                        : active
                          ? "var(--gold)"
                          : "var(--text-muted)",
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <p
                    className="text-xs mt-1.5 text-center hidden sm:block"
                    style={{
                      color:
                        done || active
                          ? "var(--text-primary)"
                          : "var(--text-muted)",
                    }}
                  >
                    {step.title}
                  </p>
                </div>
                {i < KYC_STEPS.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-2"
                    style={{
                      background: done ? "var(--gold)" : "var(--border)",
                      transition: "background 0.3s",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form — only show if not_submitted or rejected */}
        {(status === "not_submitted" || status === "rejected") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-8"
          >
            <h2
              className="font-display text-xl mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Submit KYC Documents
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="John"
                  value={form.firstName}
                  onChange={set("firstName") as any}
                  required
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={set("lastName") as any}
                  required
                />
              </div>
              <Select
                label="Document Type"
                options={[
                  { value: "national_id", label: "National ID" },
                  { value: "passport", label: "Passport" },
                  { value: "drivers_license", label: "Driver's License" },
                ]}
                value={form.documentType}
                onChange={set("documentType") as any}
              />
              <Input
                label="Document Number"
                placeholder="e.g. A12345678"
                value={form.documentNumber}
                onChange={set("documentNumber") as any}
                required
              />
              <Input
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={set("dateOfBirth") as any}
                required
              />
              <Input
                label="Address"
                placeholder="123 Main St, Lagos, Nigeria"
                value={form.address}
                onChange={set("address") as any}
              />

              {/* Mock file upload */}
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-(--gold) transition-colors"
                style={{
                  borderColor: "var(--border)",
                  background: "rgba(255,255,255,0.01)",
                }}
              >
                <Upload
                  size={28}
                  className="mx-auto mb-3"
                  style={{ color: "var(--text-muted)" }}
                />
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Upload document photo
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  PNG, JPG or PDF · max 5MB
                </p>
              </div>

              <Button
                type="submit"
                loading={submitting}
                className="w-full"
                size="lg"
              >
                {status === "rejected" ? "Resubmit KYC" : "Submit for Review"}
              </Button>
            </form>
          </motion.div>
        )}

        {/* Wallet tiers info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl overflow-hidden mt-6"
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h3
              className="font-display text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              Wallet Tiers
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {[
              {
                tier: "Basic",
                kyc: "None",
                single: "₦50,000",
                monthly: "₦500,000",
                color: "var(--text-muted)",
                active: status === "not_submitted",
              },
              {
                tier: "Standard",
                kyc: "Soft KYC",
                single: "₦200,000",
                monthly: "₦2,000,000",
                color: "var(--blue)",
                active: status === "pending",
              },
              {
                tier: "Premium",
                kyc: "Full KYC",
                single: "₦2,000,000",
                monthly: "₦20,000,000",
                color: "var(--gold)",
                active: status === "approved",
              },
            ].map(({ tier, kyc: k, single, monthly, color, active }) => (
              <div
                key={tier}
                className="flex items-center justify-between px-6 py-4"
                style={{
                  background: active ? "rgba(212,175,55,0.03)" : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${color}20`,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    <ShieldCheck size={15} style={{ color }} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: active ? color : "var(--text-primary)" }}
                    >
                      {tier} {active && "✓"}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Requires: {k}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-xs font-mono"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {single} / tx
                  </p>
                  <p
                    className="text-xs font-mono"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {monthly} / month
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
