"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Wallet } from "lucide-react";
import { accountsApi, walletsApi } from "@/lib/api";
import { Account } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import AppShell from "@/components/layout/AppShell";
import AccountCard from "@/components/dashboard/AccountCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function AccountsPage() {
  const { add } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [limits, setLimits] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [currency, setCurrency] = useState("NGN");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await accountsApi.list();
      const accs: Account[] = res.data?.data || res.data || [];
      setAccounts(accs);
      // Fetch limits for each account
      const limitsMap: Record<string, any> = {};
      await Promise.all(
        accs.map(async (a) => {
          try {
            const lr = await walletsApi.limits(a.id);
            limitsMap[a.id] = lr.data?.data || lr.data;
          } catch {}
        }),
      );
      setLimits(limitsMap);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await accountsApi.create({ currency, name: name || undefined });
      add("success", `${currency} account created!`);
      setShowCreate(false);
      setCurrency("NGN");
      setName("");
      fetchAccounts();
    } catch (err: any) {
      add("error", err?.response?.data?.message || "Failed");
    } finally {
      setCreating(false);
    }
  };

  const handleFreeze = async (id: string) => {
    try {
      await accountsApi.freeze(id);
      add("success", "Account frozen");
      fetchAccounts();
    } catch {
      add("error", "Failed");
    }
  };
  const handleUnfreeze = async (id: string) => {
    try {
      await accountsApi.unfreeze(id);
      add("success", "Account unfrozen");
      fetchAccounts();
    } catch {
      add("error", "Failed");
    }
  };

  const totalNGN = accounts
    .filter((a) => a.currency === "NGN")
    .reduce((s, a) => s + a.balance, 0);

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1
            className="font-display text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            Accounts
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {accounts.length} accounts · {formatCurrency(totalNGN)} NGN total
          </p>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => setShowCreate(true)}>
          Open Account
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-52 rounded-2xl" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Wallet
            size={48}
            className="mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <h2
            className="font-display text-2xl mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No accounts yet
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Open your first account to get started
          </p>
          <Button onClick={() => setShowCreate(true)}>Open Account</Button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {accounts.map((a, i) => (
              <AccountCard
                key={a.id}
                account={a}
                delay={i * 0.06}
                onFreeze={handleFreeze}
                onUnfreeze={handleUnfreeze}
              />
            ))}
          </div>

          {/* Limits table */}
          {Object.keys(limits).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl overflow-hidden"
            >
              <div
                className="px-6 py-5"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <h2
                  className="font-display text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  Wallet Limits
                </h2>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Per-account transaction limits by tier
                </p>
              </div>
              <table className="w-full vault-table">
                <thead>
                  <tr>
                    <th className="text-left">Account</th>
                    <th className="text-left">Tier</th>
                    <th className="text-right">Single TX Limit</th>
                    <th className="text-right">Monthly Limit</th>
                    <th className="text-right hidden md:table-cell">
                      Used This Month
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accounts
                    .filter((a) => limits[a.id])
                    .map((a) => {
                      const l = limits[a.id];
                      const tierColor =
                        l?.tier === "Premium"
                          ? "var(--gold)"
                          : l?.tier === "Standard"
                            ? "var(--blue)"
                            : "var(--text-muted)";
                      return (
                        <tr key={a.id}>
                          <td>
                            <p
                              className="text-sm font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {a.currency} ···{a.id.slice(-6)}
                            </p>
                          </td>
                          <td>
                            <span
                              className="text-sm font-semibold"
                              style={{ color: tierColor }}
                            >
                              {l?.tier || "Basic"}
                            </span>
                          </td>
                          <td
                            className="text-right font-mono text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {formatCurrency(l?.singleTxLimit || 0, a.currency)}
                          </td>
                          <td
                            className="text-right font-mono text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {formatCurrency(l?.monthlyLimit || 0, a.currency)}
                          </td>
                          <td
                            className="text-right font-mono text-sm hidden md:table-cell"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {formatCurrency(l?.usedThisMonth || 0, a.currency)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      )}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Open New Account"
      >
        <div className="space-y-4">
          <Select
            label="Currency"
            options={["NGN", "USD", "GBP", "EUR"].map((c) => ({
              value: c,
              label: `${c} — ${c === "NGN" ? "Nigerian Naira" : c === "USD" ? "US Dollar" : c === "GBP" ? "British Pound" : "Euro"}`,
            }))}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
          <Input
            label="Account Name (optional)"
            placeholder="e.g. Savings, Business…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div
            className="glass rounded-xl p-4 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <p>
              New accounts start with{" "}
              <strong style={{ color: "var(--gold)" }}>Basic</strong> wallet
              tier. Complete KYC to upgrade limits.
            </p>
          </div>
          <Button loading={creating} onClick={handleCreate} className="w-full">
            Open Account
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
