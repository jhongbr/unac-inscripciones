import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Aviso explícito de que una función aún no tiene backend real detrás. */
export function PendienteIntegracion({
  titulo = "Pendiente de integración con el backend",
  children,
  className,
}: {
  titulo?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      data-testid="pendiente-integracion"
      className={cn("rounded-xl border border-dashed border-amber-300 bg-amber-50 p-5", className)}
    >
      <p className="text-sm font-semibold text-amber-900">{titulo}</p>
      {children && <div className="mt-1 text-sm text-amber-800">{children}</div>}
    </div>
  );
}
