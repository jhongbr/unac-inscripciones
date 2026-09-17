import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "outline" | "warning";

type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  pill?: boolean;
  loading?: boolean;
  arrow?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-green-600 hover:bg-green-700 text-white disabled:hover:bg-green-600",
  secondary:
    "bg-navy-900 hover:bg-navy-800 text-white disabled:hover:bg-navy-900",
  outline:
    "border border-gray-300 bg-white text-navy-900 hover:bg-gray-50 disabled:hover:bg-white",
  warning:
    "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 disabled:hover:bg-amber-50",
};

const sizeClasses: Record<Size, string> = {
  md: "px-5 py-3 text-sm font-medium",
  lg: "px-6 py-4 text-base font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      pill,
      loading,
      arrow,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          pill ? "rounded-full" : "rounded-lg",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {loading && <Spinner className="h-4 w-4" />}
        {children}
        {arrow && !loading && <span aria-hidden="true">→</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
