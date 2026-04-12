import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "active" | "pending" | "inactive" | "failed" | "gold";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = "active",
  children,
  className,
}: BadgeProps) {
  const variants = {
    active: "status-active",
    pending: "status-pending",
    inactive: "status-inactive",
    failed: "status-failed",
    gold: "text-gold bg-[var(--gold-dim)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
