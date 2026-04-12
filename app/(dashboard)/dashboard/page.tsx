"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  Users,
  Plus,
  Send,
  Download,
} from "lucide-react";
import { accountsApi, transactionsApi, adminApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Account, Transaction } from "@/lib/types";
import { formatCurrency, formatRelative } from "@/lib/utils";
import StatCard from "@/components/dashboard/StatCard";
import AccountCard from "@/components/dashboard/AccountCard";
import TransactionRow from "@/components/dashboard/TransactionRow";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import AppShell from "@/components/layout/AppShell";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { add } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [newCurrency, setNewCurrency] = useState("NGN");
  const [newName, setNewName] = useState("");
  const [depositForm, setDepositForm] = useState({ accountId: "", amount: "" });
  const [transferForm, setTransferForm] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    description: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fake chart data
  const chartData = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    inflow: Math.floor(Math.random() * 500000 + 100000),
    outflow: Math.floor(Math.random() * 300000 + 50000),
  }));

  useEffect(() => {
    fetchData();
    if (user?.role === "admin") {
      adminApi
        .stats()
        .then((r) => setAdminStats(r.data?.data || r.data))
        .catch(() => {});
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const accRes = await accountsApi.list();
      const accs: Account[] = accRes.data?.data || accRes.data || [];
      setAccounts(accs);
      if (accs.length > 0) {
        const txRes = await transactionsApi.history(accs[0].id, 1, 8);
        setRecentTx(txRes.data?.data?.data || txRes.data?.data || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce(
    (s, a) => s + (a.currency === "NGN" ? a.balance : 0),
    0,
  );

  const handleCreateAccount = async () => {
    setFormLoading(true);
    try {
      await accountsApi.create({
        currency: newCurrency,
        name: newName || undefined,
      });
      add("success", `${newCurrency} account created!`);
      setShowCreateAccount(false);
      fetchData();
    } catch (err: any) {
      add("error", err?.response?.data?.message || "Failed to create account");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositForm.accountId || !depositForm.amount) return;
    setFormLoading(true);
    try {
      await transactionsApi.deposit({
        accountId: depositForm.accountId,
        amount: parseFloat(depositForm.amount) * 100,
      });
      add("success", "Deposit successful!");
      setShowDeposit(false);
      setDepositForm({ accountId: "", amount: "" });
      fetchData();
    } catch (err: any) {
      add("error", err?.response?.data?.message || "Deposit failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (
      !transferForm.fromAccountId ||
      !transferForm.toAccountId ||
      !transferForm.amount
    )
      return;
    setFormLoading(true);
    try {
      await transactionsApi.transfer({
        fromAccountId: transferForm.fromAccountId,
        toAccountId: transferForm.toAccountId,
        amount: parseFloat(transferForm.amount) * 100,
        description: transferForm.description,
      });
      add("success", "Transfer successful!");
      setShowTransfer(false);
      setTransferForm({
        fromAccountId: "",
        toAccountId: "",
        amount: "",
        description: "",
      });
      fetchData();
    } catch (err: any) {
      add("error", err?.response?.data?.message || "Transfer failed");
    } finally {
      setFormLoading(false);
    }
  };

  const accountOptions = accounts.map((a) => ({
    value: a.id,
    label: `${a.currency} — ${formatCurrency(a.balance, a.currency)}`,
  }));

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl lg:text-4xl"
            style={{ color: "var(--text-primary)" }}
          >
            Hello, {user?.firstName} 👋
          </motion.h1>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 flex-wrap"
        >
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus size={15} />}
            onClick={() => setShowCreateAccount(true)}
          >
            New Account
          </Button>
          <Button
            size="sm"
            icon={<Download size={15} />}
            onClick={() => setShowDeposit(true)}
          >
            Deposit
          </Button>
          <Button
            size="sm"
            icon={<Send size={15} />}
            onClick={() => setShowTransfer(true)}
          >
            Transfer
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="NGN Balance"
          value={loading ? "—" : formatCurrency(totalBalance)}
          subValue="Across all NGN accounts"
          icon={<Wallet size={18} />}
          delay={0}
          trend={2.4}
        />
        <StatCard
          label="Accounts"
          value={String(accounts.length)}
          subValue={`${accounts.filter((a) => a.status === "active").length} active`}
          icon={<Wallet size={18} />}
          delay={0.05}
          accentColor="var(--blue)"
        />
        <StatCard
          label="Transactions"
          value={String(recentTx.length)}
          subValue="Last 7 days"
          icon={<ArrowLeftRight size={18} />}
          delay={0.1}
          accentColor="var(--green)"
          trend={-1.2}
        />
        {user?.role === "admin" && adminStats ? (
          <StatCard
            label="Total Users"
            value={String(adminStats.totalUsers || 0)}
            icon={<Users size={18} />}
            delay={0.15}
            accentColor="var(--gold)"
          />
        ) : (
          <StatCard
            label="TX Volume"
            value={
              recentTx.reduce((s, t) => s + t.amount, 0) > 0
                ? formatCurrency(recentTx.reduce((s, t) => s + t.amount, 0))
                : "₦0"
            }
            icon={<TrendingUp size={18} />}
            delay={0.15}
            accentColor="var(--gold)"
          />
        )}
      </div>

      {/* Chart + accounts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="font-display text-lg"
                style={{ color: "var(--text-primary)" }}
              >
                Cash Flow
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Inflow vs outflow this week
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: "var(--green)" }}
                />
                Inflow
              </span>
              <span
                className="flex items-center gap-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: "var(--red)" }}
                />
                Outflow
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c896" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00c896" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="day"
                stroke="var(--text-muted)"
                tick={{ fontSize: 11, fontFamily: "Syne" }}
              />
              <YAxis
                stroke="var(--text-muted)"
                tick={{ fontSize: 11, fontFamily: "Syne" }}
                tickFormatter={(v) => `₦${(v / 100000).toFixed(0)}k`}
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
                itemStyle={{ color: "var(--text-secondary)" }}
                formatter={(v) => formatCurrency(Number(v))}
              />
              <Area
                type="monotone"
                dataKey="inflow"
                stroke="#00c896"
                strokeWidth={2}
                fill="url(#inGrad)"
              />
              <Area
                type="monotone"
                dataKey="outflow"
                stroke="#ff4d6d"
                strokeWidth={2}
                fill="url(#outGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick accounts list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 flex flex-col"
        >
          <h2
            className="font-display text-lg mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Accounts
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <Wallet
                size={32}
                style={{ color: "var(--text-muted)" }}
                className="mb-3"
              />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No accounts yet
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setShowCreateAccount(true)}
              >
                Create Account
              </Button>
            </div>
          ) : (
            <div className="space-y-2 flex-1 overflow-y-auto">
              {accounts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-xl glass-hover transition-all cursor-default"
                >
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {a.currency}
                    </p>
                    <p
                      className="text-xs font-mono"
                      style={{ color: "var(--text-muted)" }}
                    >
                      ···{a.id.slice(-6)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-semibold font-mono"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {formatCurrency(a.balance, a.currency)}
                    </p>
                    <Badge
                      variant={a.status === "active" ? "active" : "inactive"}
                      className="text-[10px]"
                    >
                      {a.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Full account cards */}
      {accounts.length > 0 && (
        <div className="mb-8">
          <h2
            className="font-display text-xl mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Your Accounts
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {accounts.map((a, i) => (
              <AccountCard
                key={a.id}
                account={a}
                delay={i * 0.06}
                onFreeze={async (id) => {
                  try {
                    await accountsApi.freeze(id);
                    add("success", "Account frozen");
                    fetchData();
                  } catch {
                    add("error", "Failed");
                  }
                }}
                onUnfreeze={async (id) => {
                  try {
                    await accountsApi.unfreeze(id);
                    add("success", "Account unfrozen");
                    fetchData();
                  } catch {
                    add("error", "Failed");
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2
            className="font-display text-lg"
            style={{ color: "var(--text-primary)" }}
          >
            Recent Transactions
          </h2>
          <a
            href="/transactions"
            className="text-xs font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "var(--gold)" }}
          >
            View all
          </a>
        </div>
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : recentTx.length === 0 ? (
          <div className="p-12 text-center">
            <p style={{ color: "var(--text-muted)" }}>No transactions yet</p>
          </div>
        ) : (
          <table className="w-full vault-table">
            <thead>
              <tr>
                <th className="text-left">Transaction</th>
                <th className="text-left hidden md:table-cell">Description</th>
                <th className="text-left">Amount</th>
                <th className="text-left hidden sm:table-cell">Status</th>
                <th className="text-left hidden lg:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Modals */}
      <Modal
        open={showCreateAccount}
        onClose={() => setShowCreateAccount(false)}
        title="Open New Account"
      >
        <div className="space-y-4">
          <Select
            label="Currency"
            options={["NGN", "USD", "GBP", "EUR"].map((c) => ({
              value: c,
              label: c,
            }))}
            value={newCurrency}
            onChange={(e) => setNewCurrency(e.target.value)}
          />
          <Input
            label="Account Name (optional)"
            placeholder="e.g. Savings, Business..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button
            loading={formLoading}
            onClick={handleCreateAccount}
            className="w-full"
          >
            Open Account
          </Button>
        </div>
      </Modal>

      <Modal
        open={showDeposit}
        onClose={() => setShowDeposit(false)}
        title="Deposit Funds"
      >
        <div className="space-y-4">
          <Select
            label="Account"
            options={[
              { value: "", label: "Select account..." },
              ...accountOptions,
            ]}
            value={depositForm.accountId}
            onChange={(e) =>
              setDepositForm((f) => ({ ...f, accountId: e.target.value }))
            }
          />
          <Input
            label="Amount (₦)"
            type="number"
            placeholder="0.00"
            value={depositForm.amount}
            onChange={(e) =>
              setDepositForm((f) => ({ ...f, amount: e.target.value }))
            }
          />
          <Button
            loading={formLoading}
            onClick={handleDeposit}
            className="w-full"
          >
            Deposit
          </Button>
        </div>
      </Modal>

      <Modal
        open={showTransfer}
        onClose={() => setShowTransfer(false)}
        title="Transfer Funds"
      >
        <div className="space-y-4">
          <Select
            label="From Account"
            options={[
              { value: "", label: "Select account..." },
              ...accountOptions,
            ]}
            value={transferForm.fromAccountId}
            onChange={(e) =>
              setTransferForm((f) => ({ ...f, fromAccountId: e.target.value }))
            }
          />
          <Input
            label="To Account ID"
            placeholder="Recipient account ID"
            value={transferForm.toAccountId}
            onChange={(e) =>
              setTransferForm((f) => ({ ...f, toAccountId: e.target.value }))
            }
          />
          <Input
            label="Amount"
            type="number"
            placeholder="0.00"
            value={transferForm.amount}
            onChange={(e) =>
              setTransferForm((f) => ({ ...f, amount: e.target.value }))
            }
          />
          <Input
            label="Description (optional)"
            placeholder="What's this for?"
            value={transferForm.description}
            onChange={(e) =>
              setTransferForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <Button
            loading={formLoading}
            onClick={handleTransfer}
            className="w-full"
          >
            Send Transfer
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
