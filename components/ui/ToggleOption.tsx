"use client";

import { cn } from "@/lib/utils";

export function ToggleOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
        selected
          ? "border-green-600 bg-green-50 text-green-700"
          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
      )}
    >
      {label}
    </button>
  );
}
