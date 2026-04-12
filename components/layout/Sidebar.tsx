"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Wallet, ArrowLeftRight, Users, ShieldCheck,
  Bell, BarChart3, Settings, LogOut, X, ChevronRight, CreditCard,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

const userNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/accounts", icon: Wallet, label: "Accounts" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/kyc", icon: ShieldCheck, label: "KYC Verification" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
];

const adminNav = [
  { href: "/admin", icon: BarChart3, label: "Admin Dashboard" },
  { href: "/admin/users", icon: Users, label: "User Management" },
  { href: "/admin/kyc", icon: ShieldCheck, label: "KYC Reviews" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  unreadCount?: number;
}

export default function Sidebar({ open, onClose, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center animate-glow-pulse" style={{ background: "var(--gold-dim)", border: "1px solid var(--border-active)" }}>
            <CreditCard size={16} style={{ color: "var(--gold)" }} />
          </div>
          <span className="font-display text-xl tracking-wide" style={{ color: "var(--text-primary)" }}>Vault</span>
        </div>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: "var(--text-muted)" }}>
          <X size={18} />
        </button>
      </div>

      {/* User card */}
      {user && (
        <div className="mx-3 mb-4 p-3 rounded-xl" style={{ background: "var(--gold-dim)", border: "1px solid var(--border-active)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "var(--gold)", color: "#000" }}>
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{user.firstName} {user.lastName}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user.email}</p>
            </div>
            {isAdmin && (
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full" style={{ background: "var(--gold)", color: "#000" }}>
                ADMIN
              </span>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {userNav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn("sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium", active && "active")}
              style={{ color: active ? "var(--gold)" : "var(--text-secondary)" }}
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {label === "Notifications" && unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full" style={{ background: "var(--gold)", color: "#000" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2 px-3">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "var(--text-muted)" }}>Admin</p>
            </div>
            {adminNav.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href);
              return (
                <Link key={href} href={href} onClick={onClose}
                  className={cn("sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium", active && "active")}
                  style={{ color: active ? "var(--gold)" : "var(--text-secondary)" }}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-6 space-y-0.5 mt-4">
        <Link href="/settings" onClick={onClose}
          className={cn("sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium", pathname === "/settings" && "active")}
          style={{ color: pathname === "/settings" ? "var(--gold)" : "var(--text-secondary)" }}
        >
          <Settings size={17} />
          <span>Settings</span>
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-(--red-dim) group"
          style={{ color: "var(--text-secondary)" }}
        >
          <LogOut size={17} className="group-hover:text-(--red) transition-colors" />
          <span className="group-hover:text-(--red) transition-colors">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0" style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(8,10,14,0.7)", backdropFilter: "blur(4px)" }}
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 lg:hidden flex flex-col"
              style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
