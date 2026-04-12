"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search, UserX, RefreshCw, MoreVertical } from "lucide-react";
import { usersApi } from "@/lib/api";
import { User } from "@/lib/types";
import { formatDate, getInitials } from "@/lib/utils";
import AppShell from "@/components/layout/AppShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function AdminUsersPage() {
  const { add } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const limit = 20;

  useEffect(() => {
    fetchUsers();
  }, [page]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-dropdown]")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.list(page, limit);
      const d = res.data?.data;
      setUsers(d?.data || d || []);
      setTotal(d?.total || 0);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const handleDeactivate = async () => {
    if (!confirmUser) return;
    setDeactivating(true);
    try {
      await usersApi.deactivate(confirmUser.id);
      add("success", `${confirmUser.firstName} deactivated`);
      setConfirmUser(null);
      fetchUsers();
    } catch (err: any) {
      add("error", err?.response?.data?.message || "Failed");
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
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
              Users
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {total} registered users
          </p>
        </div>
        <Button
          variant="ghost"
          icon={<RefreshCw size={15} />}
          onClick={fetchUsers}
        >
          Refresh
        </Button>
      </div>

      <div className="glass rounded-2xl p-4 mb-6">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="vault-input w-full rounded-xl pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl overflow-hidden"
      >
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full vault-table">
              <thead>
                <tr>
                  <th className="text-left">User</th>
                  <th className="text-left hidden md:table-cell">Email</th>
                  <th className="text-left hidden sm:table-cell">Role</th>
                  <th className="text-left hidden lg:table-cell">Joined</th>
                  <th className="text-left">Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: "var(--gold)", color: "#000" }}
                        >
                          {getInitials(u.firstName, u.lastName)}
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {u.firstName} {u.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {u.email}
                      </p>
                    </td>
                    <td className="hidden sm:table-cell">
                      <Badge variant={u.role === "admin" ? "gold" : "inactive"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="hidden lg:table-cell">
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {formatDate(u.createdAt)}
                      </p>
                    </td>
                    <td>
                      <Badge variant={u.isActive ? "active" : "inactive"}>
                        {u.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <div className="relative" data-dropdown>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(
                              openDropdown === u.id ? null : u.id,
                            );
                          }}
                          className="p-2"
                        >
                          <MoreVertical size={15} />
                        </Button>

                        {openDropdown === u.id && (
                          <div
                            className="absolute right-0 top-full mt-1 w-40 rounded-xl shadow-xl z-20 overflow-hidden"
                            style={{
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--border)",
                              animation: "fadeSlideDown 0.12s ease",
                            }}
                          >
                            {/* Deactivate — only for active non-admins */}
                            {u.isActive && u.role !== "admin" ? (
                              <button
                                onClick={() => {
                                  setConfirmUser(u);
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors hover:bg-red-500/10 group"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                <UserX
                                  size={14}
                                  className="group-hover:text-red-400 transition-colors"
                                  style={{ color: "var(--text-muted)" }}
                                />
                                <span className="group-hover:text-red-400 transition-colors">
                                  Deactivate
                                </span>
                              </button>
                            ) : (
                              <div
                                className="px-3 py-2.5 text-sm"
                                style={{ color: "var(--text-muted)" }}
                              >
                                No actions
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > limit && (
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Page {page} of {Math.ceil(total / limit)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= Math.ceil(total / limit)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      <Modal
        open={!!confirmUser}
        onClose={() => setConfirmUser(null)}
        title="Deactivate User"
      >
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Are you sure you want to deactivate{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {confirmUser?.firstName} {confirmUser?.lastName}
          </strong>
          ? They will lose access to their account.
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => setConfirmUser(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            loading={deactivating}
            onClick={handleDeactivate}
          >
            Deactivate
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
