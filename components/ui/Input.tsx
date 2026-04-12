import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, icon, className, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn("vault-input w-full rounded-xl px-4 py-3 text-sm", icon && "pl-10", className)}
          {...props}
        />
      </div>
      {error && <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>}
    </div>
  );
});
Input.displayName = "Input";
export default Input;
