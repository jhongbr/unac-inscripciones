import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50",
          hasError
            ? "border-red-400 focus:ring-red-500"
            : "border-gray-300 focus:ring-green-500",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
