"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { CreditCard } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)",
          }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center relative"
      >
        <div className="flex items-center justify-center gap-3 mb-10">
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
        <p
          className="font-display text-[120px] lg:text-[180px] leading-none gold-text mb-4"
          style={{ opacity: 0.15 }}
        >
          404
        </p>
        <h1
          className="font-display text-3xl mb-3 -mt-8"
          style={{ color: "var(--text-primary)" }}
        >
          Page not found
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
        >
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
