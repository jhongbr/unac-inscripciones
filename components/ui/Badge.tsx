import { cn } from "@/lib/utils";

type BadgeColor = "green" | "blue" | "amber" | "red" | "gray";

const colorClasses: Record<BadgeColor, string> = {
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-600",
};

export function Badge({
  color = "gray",
  children,
}: {
  color?: BadgeColor;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        colorClasses[color]
      )}
    >
      {children}
    </span>
  );
}
