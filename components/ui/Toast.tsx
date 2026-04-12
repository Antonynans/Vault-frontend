"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { create } from "zustand";

type ToastType = "success" | "error" | "info";
interface Toast { id: string; type: ToastType; message: string; }
interface ToastStore { toasts: Toast[]; add: (type: ToastType, message: string) => void; remove: (id: string) => void; }

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const icons = {
  success: <CheckCircle size={18} style={{ color: "var(--green)" }} />,
  error: <XCircle size={18} style={{ color: "var(--red)" }} />,
  info: <AlertCircle size={18} style={{ color: "var(--blue)" }} />,
};

export function ToastContainer() {
  const { toasts, remove } = useToast();
  return (
    <div className="fixed top-5 right-5 z-9999 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-active)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
              color: "var(--text-primary)",
              minWidth: 280,
            }}
          >
            {icons[t.type]}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="ml-2 opacity-40 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}