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
        "rounded-md px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? "bg-green-600 text-white"
          : "bg-gray-200 text-gray-500 hover:bg-gray-300"
      )}
    >
      {label}
      {selected && " ✓"}
    </button>
  );
}
