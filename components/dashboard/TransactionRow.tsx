"use client";
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { Transaction } from "@/lib/types";
import { formatCurrency, formatRelative } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

const txIcons = {
  deposit: {
    icon: ArrowDownLeft,
    color: "var(--green)",
    bg: "var(--green-dim)",
  },
  withdrawal: { icon: ArrowUpRight, color: "var(--red)", bg: "var(--red-dim)" },
  transfer: { icon: RefreshCw, color: "var(--blue)", bg: "var(--blue-dim)" },
};

export default function TransactionRow({
  tx,
  currentAccountId,
}: {
  tx: Transaction;
  currentAccountId?: string;
}) {
  const config = txIcons[tx.type] || txIcons.transfer;
  const Icon = config.icon;
  const isCredit =
    tx.type === "deposit" ||
    (tx.type === "transfer" && tx.toAccountId === currentAccountId);
  const statusVariant =
    tx.status === "completed"
      ? "active"
      : tx.status === "pending"
        ? "pending"
        : "failed";

  return (
    <tr>
      <td>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: config.bg }}
          >
            <Icon size={14} style={{ color: config.color }} />
          </div>
          <div>
            <p
              className="text-sm font-medium capitalize"
              style={{ color: "var(--text-primary)" }}
            >
              {tx.type}
            </p>
            <p
              className="text-xs font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              {tx.reference?.slice(0, 20)}…
            </p>
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {tx.description || "—"}
        </p>
      </td>
      <td>
        <p
          className={`text-sm font-semibold font-mono ${isCredit ? "text-(--green)" : "text-(--red)"}`}
        >
          {isCredit ? "+" : "-"}
          {formatCurrency(tx.amount, tx.currency)}
        </p>
      </td>
      <td className="hidden sm:table-cell">
        <Badge variant={statusVariant}>{tx.status}</Badge>
      </td>
      <td className="hidden lg:table-cell">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {formatRelative(tx.createdAt)}
        </p>
      </td>
    </tr>
  );
}
