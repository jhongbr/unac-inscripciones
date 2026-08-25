import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface RadioCardProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export const RadioCard = forwardRef<HTMLInputElement, RadioCardProps>(
  ({ label, description, id, className, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 has-[:checked]:border-green-600 has-[:checked]:bg-green-50",
          className
        )}
      >
        <input
          ref={ref}
          id={id}
          type="radio"
          className="mt-0.5 h-4 w-4 shrink-0 border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
          {...props}
        />
        <span>
          <span className="block text-sm font-medium text-navy-900">{label}</span>
          {description && (
            <span className="mt-0.5 block text-xs text-gray-500">{description}</span>
          )}
        </span>
      </label>
    );
  }
);

RadioCard.displayName = "RadioCard";
