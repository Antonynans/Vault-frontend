"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Wallet,
  ArrowLeftRight,
  ShieldCheck,
  TrendingUp,
  Activity,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { AdminStats } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import AppShell from "@/components/layout/AppShell";
import StatCard from "@/components/dashboard/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [growth, setGrowth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.stats(), adminApi.userGrowth()])
      .then(([sRes, gRes]) => {
        setStats(sRes.data?.data || sRes.data);
        const g = gRes.data?.data || gRes.data || [];
        setGrowth(Array.isArray(g) ? g : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const mockGrowth = Array.from({ length: 12 }, (_, i) => ({
    month: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ][i],
    users: Math.floor(Math.random() * 200 + 50 * (i + 1)),
    txVolume: Math.floor(Math.random() * 5000000 + 1000000 * (i + 1)),
  }));

  const chartData = growth.length ? growth : mockGrowth;

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <span
            className="px-2.5 py-1 text-xs font-bold tracking-widest rounded-lg"
            style={{
              background: "var(--gold-dim)",
              color: "var(--gold)",
              border: "1px solid var(--border-active)",
            }}
          >
            ADMIN
          </span>
          <h1
            className="font-display text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            Dashboard
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Platform-wide metrics and analytics
        </p>
      </motion.div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Total Users"
              value={stats.totalUsers?.toLocaleString() || "0"}
              icon={<Users size={18} />}
              delay={0}
              trend={8.2}
            />
            <StatCard
              label="Active Users"
              value={stats.activeUsers?.toLocaleString() || "0"}
              icon={<Activity size={18} />}
              delay={0.05}
              accentColor="var(--green)"
              trend={3.1}
            />
            <StatCard
              label="Total Accounts"
              value={stats.totalAccounts?.toLocaleString() || "0"}
              icon={<Wallet size={18} />}
              delay={0.1}
              accentColor="var(--blue)"
            />
            <StatCard
              label="Total Transactions"
              value={stats.totalTransactions?.toLocaleString() || "0"}
              icon={<ArrowLeftRight size={18} />}
              delay={0.15}
              trend={12.5}
            />
            <StatCard
              label="Total Volume"
              value={formatCurrency(stats.totalVolume || 0)}
              icon={<TrendingUp size={18} />}
              delay={0.2}
              accentColor="var(--gold)"
              trend={15.7}
            />
            <StatCard
              label="Pending KYC"
              value={String(stats.pendingKyc || 0)}
              icon={<ShieldCheck size={18} />}
              delay={0.25}
              accentColor="var(--red)"
            />
          </div>
        )
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User growth chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h2
            className="font-display text-lg mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            User Growth
          </h2>
          <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
            Monthly new registrations
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="month"
                stroke="var(--text-muted)"
                tick={{ fontSize: 11, fontFamily: "Syne" }}
              />
              <YAxis
                stroke="var(--text-muted)"
                tick={{ fontSize: 11, fontFamily: "Syne" }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-active)",
                  borderRadius: 12,
                  fontFamily: "Syne",
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--text-primary)" }}
              />
              <Bar
                dataKey="users"
                fill="var(--gold)"
                radius={[4, 4, 0, 0]}
                opacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Volume trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-6"
        >
          <h2
            className="font-display text-lg mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Transaction Volume
          </h2>
          <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
            Monthly transaction volume (₦)
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="month"
                stroke="var(--text-muted)"
                tick={{ fontSize: 11, fontFamily: "Syne" }}
              />
              <YAxis
                stroke="var(--text-muted)"
                tick={{ fontSize: 11, fontFamily: "Syne" }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-active)",
                  borderRadius: 12,
                  fontFamily: "Syne",
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--text-primary)" }}
                formatter={(v) => formatCurrency(Number(v))}
              />
              <Line
                type="monotone"
                dataKey="txVolume"
                stroke="var(--green)"
                strokeWidth={2.5}
                dot={{ fill: "var(--green)", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 lg:col-span-2"
        >
          <h2
            className="font-display text-lg mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Admin Actions
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                label: "Manage Users",
                desc: "View, search & deactivate users",
                href: "/admin/users",
                color: "var(--blue)",
              },
              {
                label: "Review KYC",
                desc: "Approve or reject pending submissions",
                href: "/admin/kyc",
                color: "var(--gold)",
              },
            
            ].map(({ label, desc, href, color }) => (
              <a
                key={label}
                href={href}
                className="glass-hover rounded-xl p-5 cursor-pointer transition-all block"
                style={{ border: "1px solid var(--border)" }}
              >
                <div
                  className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center"
                  style={{ background: `${color}20` }}
                >
                  <Activity size={16} style={{ color }} />
                </div>
                <p
                  className="font-semibold text-sm mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {label}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {desc}
                </p>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
