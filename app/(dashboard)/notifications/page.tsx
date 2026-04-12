"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { notificationsApi } from "@/lib/api";
import { Notification } from "@/lib/types";
import { formatRelative } from "@/lib/utils";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function NotificationsPage() {
  const { add } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.list(1, 50);
      setNotifications(res.data?.data?.data || res.data?.data || []);
    } catch {} finally { setLoading(false); }
  };

  const markRead = async (id: string) => {
    try {
      await notificationsApi.read(id);
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      await notificationsApi.readAll();
      setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));
      add("success", "All notifications marked as read");
    } catch { add("error", "Failed"); } finally { setMarking(false); }
  };

  const unread = notifications.filter(n => !n.isRead);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl" style={{ color: "var(--text-primary)" }}>Notifications</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{unread.length} unread</p>
          </div>
          {unread.length > 0 && (
            <Button variant="ghost" size="sm" icon={<CheckCheck size={15} />} loading={marking} onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>

        {loading
          ? <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
          : notifications.length === 0
            ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                <BellOff size={40} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
                <p className="font-display text-xl mb-2" style={{ color: "var(--text-primary)" }}>All caught up</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No notifications yet</p>
              </motion.div>
            : <div className="space-y-2">
                <AnimatePresence>
                  {notifications.map((n, i) => (
                    <motion.div key={n.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      onClick={() => !n.isRead && markRead(n.id)}
                      className={`glass glass-hover rounded-2xl p-5 cursor-pointer transition-all ${!n.isRead ? "border-(--border-active)" : ""}`}
                      style={{ borderColor: !n.isRead ? "var(--border-active)" : "var(--border)", background: !n.isRead ? "var(--gold-glow)" : undefined }}>
                      <div className="flex items-start gap-4">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5`}
                          style={{ background: n.isRead ? "rgba(255,255,255,0.05)" : "var(--gold-dim)" }}>
                          <Bell size={16} style={{ color: n.isRead ? "var(--text-muted)" : "var(--gold)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-semibold ${!n.isRead ? "text-(--text-primary)" : "text-(--text-secondary)"}`}>{n.title}</p>
                            <div className="flex items-center gap-2 shrink-0">
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{formatRelative(n.createdAt)}</p>
                              {!n.isRead && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--gold)" }} />}
                            </div>
                          </div>
                          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{n.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
        }
      </div>
    </AppShell>
  );
}
