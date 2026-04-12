"use client";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Bell,
  Sun,
  Moon,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { getInitials } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TopbarProps {
  onMenuClick: () => void;
  unreadCount?: number;
  title?: string;
}

type Theme = "dark" | "light";

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("vault_theme") as Theme) ?? "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("vault_theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
}

export default function Topbar({
  onMenuClick,
  unreadCount = 0,
  title,
}: TopbarProps) {
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push("/login");
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-5 py-3"
      style={{
        background: "rgba(8,10,14,0.85)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <Menu size={20} />
        </button>
        {title && (
          <h1
            className="font-display text-xl hidden sm:block"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h1>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-xl hover:bg-white/5 transition-all duration-200 group"
          style={{ color: "var(--text-muted)" }}
          aria-label="Toggle theme"
        >
          <span className="block transition-transform duration-300 group-hover:rotate-12">
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </span>
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl hover:bg-white/5 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full"
              style={{ background: "var(--gold)", color: "#000" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar + dropdown */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/5 transition-all duration-200"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{ background: "var(--gold)", color: "#000" }}
              >
                {getInitials(user.firstName, user.lastName)}
              </div>
              <span
                className="hidden sm:block text-sm font-medium max-w-25 truncate"
                style={{ color: "var(--text-secondary)" }}
              >
                {user.firstName}
              </span>
              <ChevronDown
                size={13}
                className="transition-transform duration-200"
                style={{
                  color: "var(--text-muted)",
                  transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  animation: "fadeSlideDown 0.15s ease",
                }}
              >
                {/* User info */}
                <div
                  className="px-4 py-3"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user.firstName} {user.lastName}
                  </p>
                  <p
                    className="text-xs truncate mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {user.email}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Settings
                      size={14}
                      style={{ color: "var(--text-muted)" }}
                    />
                    Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-red-500/10 group"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <LogOut
                      size={14}
                      className="transition-colors group-hover:text-red-400"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <span className="group-hover:text-red-400 transition-colors">
                      Sign out
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeSlideDown {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}
