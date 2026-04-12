"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldX, Clock } from "lucide-react";
import { kycApi } from "@/lib/api";
import { KycRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import AppShell from "@/components/layout/AppShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function AdminKycPage() {
  const { add } = useToast();
  const [records, setRecords] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<KycRecord | null>(null);
  const [note, setNote] = useState("");
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    kycApi
      .pending()
      .then((r) => setRecords(r.data?.data || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const review = async (status: "approved" | "rejected") => {
    if (!selected) return;
    setReviewing(true);
    try {
      await kycApi.review(selected.id, { status, note });
      add("success", `KYC ${status}`);
      setRecords((rs) => rs.filter((r) => r.id !== selected.id));
      setSelected(null);
      setNote("");
    } catch (err: any) {
      add("error", err?.response?.data?.message || "Failed");
    } finally {
      setReviewing(false);
    }
  };

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded"
            style={{ background: "var(--gold-dim)", color: "var(--gold)" }}
          >
            ADMIN
          </span>
          <h1
            className="font-display text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            KYC Reviews
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {records.length} pending submissions
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl overflow-hidden"
      >
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="py-20 text-center">
            <ShieldCheck
              size={40}
              className="mx-auto mb-4"
              style={{ color: "var(--green)" }}
            />
            <p
              className="font-display text-xl"
              style={{ color: "var(--text-primary)" }}
            >
              All clear!
            </p>
            <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
              No pending KYC submissions
            </p>
          </div>
        ) : (
          <table className="w-full vault-table">
            <thead>
              <tr>
                <th className="text-left">User ID</th>
                <th className="text-left hidden sm:table-cell">
                  Document Type
                </th>
                <th className="text-left hidden md:table-cell">Submitted</th>
                <th className="text-left">Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td>
                    <p
                      className="font-mono text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {r.userId?.slice(0, 16)}…
                    </p>
                  </td>
                  <td className="hidden sm:table-cell capitalize">
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {r.documentType?.replace(/_/g, " ") || "—"}
                    </p>
                  </td>
                  <td className="hidden md:table-cell">
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {r.submittedAt ? formatDate(r.submittedAt) : "—"}
                    </p>
                  </td>
                  <td>
                    <Badge variant="pending">
                      <Clock size={10} className="inline mr-1" />
                      Pending
                    </Badge>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => setSelected(r)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all hover:bg-(--gold-dim)"
                      style={{
                        color: "var(--gold)",
                        border: "1px solid var(--border-active)",
                      }}
                    >
                      Review
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      <Modal
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setNote("");
        }}
        title="Review KYC Submission"
      >
        {selected && (
          <div className="space-y-5">
            <div className="glass rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>User ID</span>
                <span
                  className="font-mono text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {selected.userId}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>
                  Document Type
                </span>
                <span
                  className="capitalize"
                  style={{ color: "var(--text-primary)" }}
                >
                  {selected.documentType?.replace(/_/g, " ") || "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Submitted</span>
                <span style={{ color: "var(--text-primary)" }}>
                  {selected.submittedAt
                    ? formatDate(selected.submittedAt)
                    : "—"}
                </span>
              </div>
            </div>
            <Input
              label="Review Note (optional)"
              placeholder="Reason for rejection or approval note…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex gap-3">
              <Button
                variant="danger"
                className="flex-1"
                loading={reviewing}
                icon={<ShieldX size={15} />}
                onClick={() => review("rejected")}
              >
                Reject
              </Button>
              <Button
                className="flex-1"
                loading={reviewing}
                icon={<ShieldCheck size={15} />}
                onClick={() => review("approved")}
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
