// AppShell.tsx — stop calling hydrate() here, AuthProvider already did it
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { notificationsApi } from "@/lib/api";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { ToastContainer } from "@/components/ui/Toast";
import Spinner from "@/components/ui/Spinner";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isLoading } = useAuthStore(); // ← no hydrate here
  const router = useRouter();

  // Redirect once hydration (done in AuthProvider) settles
  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user]);

  useEffect(() => {
    if (!user) return;
    const fetchCount = () =>
      notificationsApi
        .unreadCount()
        .then((res) =>
          setUnreadCount(res.data?.data?.count ?? res.data?.count ?? 0),
        )
        .catch(() => {});

    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [user]);

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center animate-glow-pulse"
            style={{
              background: "var(--gold-dim)",
              border: "1px solid var(--border-active)",
            }}
          >
            <span className="font-display text-2xl gold-text">V</span>
          </div>
          <Spinner size={24} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          unreadCount={unreadCount}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
