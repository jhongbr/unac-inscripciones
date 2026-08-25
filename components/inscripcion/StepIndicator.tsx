"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PASOS = [
  { path: "/inscripcion/requisitos", titulo: "Requisitos" },
  { path: "/inscripcion/formulario", titulo: "Formulario" },
  { path: "/inscripcion/documentos", titulo: "Documentos" },
  { path: "/inscripcion/pago", titulo: "Pago" },
  { path: "/inscripcion/confirmacion", titulo: "Confirmación" },
];

export function StepIndicator() {
  const pathname = usePathname();
  const pasoActual = PASOS.findIndex((paso) => paso.path === pathname);

  return (
    <ol className="mx-auto flex w-full max-w-3xl items-center">
      {PASOS.map((paso, i) => {
        const completado = pasoActual > i;
        const activo = pasoActual === i;
        return (
          <li key={paso.path} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                  activo && "bg-navy-900 text-white",
                  completado && "bg-green-600 text-white",
                  !activo && !completado && "bg-gray-200 text-gray-500"
                )}
              >
                {completado ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs sm:block",
                  activo ? "font-medium text-navy-900" : "text-gray-500"
                )}
              >
                {paso.titulo}
              </span>
            </div>
            {i < PASOS.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1",
                  completado ? "bg-green-600" : "bg-gray-200"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
