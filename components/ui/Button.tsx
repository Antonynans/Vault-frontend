import { cn } from "@/lib/utils";
import Spinner from "./Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "ghost" | "danger";
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export default function Button({
  variant = "gold",
  loading,
  size = "md",
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };
  const variantClass =
    variant === "gold"
      ? "btn-gold"
      : variant === "danger"
        ? "bg-[var(--red-dim)] text-[var(--red)] border border-[var(--red)]/30 hover:bg-[var(--red)]/20 transition-all font-semibold font-sans"
        : "btn-ghost";
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "rounded-xl font-semibold inline-flex items-center justify-center gap-2 transition-all",
        variantClass,
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner
          size={16}
          color={variant === "gold" ? "#000" : "var(--gold)"}
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
