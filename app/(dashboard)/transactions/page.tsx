"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Filter, Download, Search, RefreshCw, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { transactionsApi, accountsApi, statementsApi } from "@/lib/api";
import { Account, Transaction } from "@/lib/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import AppShell from "@/components/layout/AppShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";

export default function TransactionsPage() {
  const { add } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<"all" | "transfer" | "deposit" | "withdrawal">("all");
  const [search, setSearch] = useState("");
  const limit = 20;

  useEffect(() => {
    accountsApi.list().then((r) => {
      const accs = r.data?.data || r.data || [];
      setAccounts(accs);
      if (accs.length > 0) setSelectedAccount(accs[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedAccount) return;
    fetchTx();
  }, [selectedAccount, page]);

  const fetchTx = async () => {
    setLoading(true);
    try {
      const res = await transactionsApi.history(selectedAccount, page, limit);
      const d = res.data?.data;
      setTransactions(d?.data || d || []);
      setTotal(d?.total || 0);
    } catch {}
    finally { setLoading(false); }
  };

  const filtered = transactions.filter((t) => {
    if (filter !== "all" && t.type !== filter) return false;
    if (search && !t.reference?.toLowerCase().includes(search.toLowerCase()) && !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleExport = async () => {
    if (!selectedAccount) return;
    try {
      const res = await statementsApi.csv(selectedAccount);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a"); a.href = url; a.download = `statement-${selectedAccount}.csv`; a.click();
      add("success", "Statement downloaded!");
    } catch { add("error", "Export failed"); }
  };

  const txTypeIcon = (type: string) => {
    if (type === "deposit") return <ArrowDownLeft size={15} style={{ color: "var(--green)" }} />;
    if (type === "withdrawal") return <ArrowUpRight size={15} style={{ color: "var(--red)" }} />;
    return <RefreshCw size={15} style={{ color: "var(--blue)" }} />;
  };

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl" style={{ color: "var(--text-primary)" }}>Transactions</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{total} total transactions</p>
        </div>
        <Button variant="ghost" icon={<Download size={15} />} onClick={handleExport}>Export CSV</Button>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input placeholder="Search by reference or description…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="vault-input w-full rounded-xl pl-9 pr-4 py-2.5 text-sm" />
          </div>
          <Select options={accounts.map(a => ({ value: a.id, label: `${a.currency} ···${a.id.slice(-6)}` }))}
            value={selectedAccount} onChange={(e) => { setSelectedAccount(e.target.value); setPage(1); }} className="sm:w-52" />
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
            {(["all", "transfer", "deposit", "withdrawal"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                style={{ background: filter === f ? "var(--gold-dim)" : "transparent", color: filter === f ? "var(--gold)" : "var(--text-muted)", border: filter === f ? "1px solid var(--border-active)" : "1px solid transparent" }}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl overflow-hidden">
        {loading
          ? <div className="p-8 space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
          : filtered.length === 0
            ? <div className="py-20 text-center">
                <RefreshCw size={36} style={{ color: "var(--text-muted)" }} className="mx-auto mb-4" />
                <p className="text-lg font-display mb-1" style={{ color: "var(--text-primary)" }}>No transactions found</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Try adjusting your filters</p>
              </div>
            : <div className="overflow-x-auto">
                <table className="w-full vault-table">
                  <thead><tr>
                    <th className="text-left">Type</th>
                    <th className="text-left">Reference</th>
                    <th className="text-left hidden md:table-cell">Description</th>
                    <th className="text-right">Amount</th>
                    <th className="text-left hidden sm:table-cell">Status</th>
                    <th className="text-left hidden lg:table-cell">Date</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map((tx, i) => {
                      const isCredit = tx.type === "deposit";
                      const statusVariant = tx.status === "completed" ? "active" : tx.status === "pending" ? "pending" : "failed";
                      return (
                        <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                style={{ background: tx.type === "deposit" ? "var(--green-dim)" : tx.type === "withdrawal" ? "var(--red-dim)" : "var(--blue-dim)" }}>
                                {txTypeIcon(tx.type)}
                              </div>
                              <span className="capitalize text-sm font-medium" style={{ color: "var(--text-primary)" }}>{tx.type}</span>
                            </div>
                          </td>
                          <td><p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{tx.reference}</p></td>
                          <td className="hidden md:table-cell"><p className="text-sm" style={{ color: "var(--text-secondary)" }}>{tx.description || "—"}</p></td>
                          <td className="text-right">
                            <p className={`font-mono text-sm font-semibold ${isCredit ? "text-(--green)" : "text-(--red)"}`}>
                              {isCredit ? "+" : "-"}{formatCurrency(tx.amount, tx.currency)}
                            </p>
                          </td>
                          <td className="hidden sm:table-cell"><Badge variant={statusVariant}>{tx.status}</Badge></td>
                          <td className="hidden lg:table-cell">
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(tx.createdAt)}</p>
                            <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{formatTime(tx.createdAt)}</p>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
        }

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Page {page} of {Math.ceil(total / limit)}</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="ghost" size="sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}
