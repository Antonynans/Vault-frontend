"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: number;
  icon: React.ReactNode;
  delay?: number;
  accentColor?: string;
}

export default function StatCard({ label, value, subValue, trend, icon, delay = 0, accentColor = "var(--gold)" }: StatCardProps) {
  const positive = trend !== undefined && trend >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass glass-hover rounded-2xl p-6 cursor-default transition-all duration-300"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accentColor}08 0%, transparent 70%)`, transform: "translate(30%, -30%)" }} />
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl" style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}>
          <div style={{ color: accentColor }}>{icon}</div>
        </div>
        {trend !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg", positive ? "text-(--green) bg-(--green-dim)" : "text-(--red) bg-(--red-dim)")}>
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="font-display text-2xl lg:text-3xl" style={{ color: "var(--text-primary)" }}>{value}</p>
      {subValue && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{subValue}</p>}
    </motion.div>
  );
}
