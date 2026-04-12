import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "vault-input w-full rounded-xl px-4 py-3 text-sm appearance-none cursor-pointer",
            className,
          )}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
          {...props}
        >
          {options.map((o) => (
            <option
              key={o.value}
              value={o.value}
              style={{
                background: "var(--bg-card)",
                color: "var(--text-primary)",
              }}
            >
              {o.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs" style={{ color: "var(--red)" }}>
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";
export default Select;
