"use client";
import { motion } from "framer-motion";
import { Snowflake, Eye, EyeOff, MoreVertical, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Account } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

const currencyFlags: Record<string, string> = { NGN: "🇳🇬", USD: "🇺🇸", GBP: "🇬🇧", EUR: "🇪🇺" };
const currencyGradients: Record<string, string> = {
  NGN: "from-[#00c896]/20 to-transparent",
  USD: "from-[#4d9fff]/20 to-transparent",
  GBP: "from-[#a855f7]/20 to-transparent",
  EUR: "from-[#d4af37]/20 to-transparent",
};

interface AccountCardProps {
  account: Account;
  delay?: number;
  onFreeze?: (id: string) => void;
  onUnfreeze?: (id: string) => void;
}

export default function AccountCard({ account, delay = 0, onFreeze, onUnfreeze }: AccountCardProps) {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isFrozen = account.status === "frozen";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl overflow-hidden p-6 cursor-default"
      style={{
        background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-hover) 100%)",
        border: isFrozen ? "1px solid rgba(77,159,255,0.3)" : "1px solid var(--border)",
        boxShadow: isFrozen ? "0 0 30px rgba(77,159,255,0.06)" : "none",
      }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-linear-to-br ${currencyGradients[account.currency] || currencyGradients.NGN} pointer-events-none`} />

      {/* Shimmer overlay */}
      {!isFrozen && <div className="absolute inset-0 shimmer pointer-events-none" />}

      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{currencyFlags[account.currency]}</span>
              <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{account.currency} Account</span>
            </div>
            {account.name && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{account.name}</p>}
          </div>
          <div className="flex items-center gap-2">
            {isFrozen && (
              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(77,159,255,0.12)", color: "var(--blue)" }}>
                <Snowflake size={12} />
                <span>Frozen</span>
              </div>
            )}
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: "var(--text-muted)" }}>
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 w-44 rounded-xl overflow-hidden z-10 shadow-xl"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-active)" }}>
                  {isFrozen
                    ? <button onClick={() => { onUnfreeze?.(account.id); setMenuOpen(false); }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors" style={{ color: "var(--green)" }}>Unfreeze Account</button>
                    : <button onClick={() => { onFreeze?.(account.id); setMenuOpen(false); }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors" style={{ color: "var(--blue)" }}>Freeze Account</button>
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>Available Balance</p>
          <div className="flex items-center gap-2">
            <p className="font-display text-3xl" style={{ color: "var(--text-primary)", filter: hidden ? "blur(10px)" : "none", transition: "filter 0.3s" }}>
              {hidden ? "₦ ••••••" : formatCurrency(account.balance, account.currency)}
            </p>
            <button onClick={() => setHidden(!hidden)} className="p-1 hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }}>
              {hidden ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            ···· {account.id.slice(-8).toUpperCase()}
          </p>
          <Badge variant={account.status === "active" ? "active" : account.status === "frozen" ? "inactive" : "failed"}>
            {account.status}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}
