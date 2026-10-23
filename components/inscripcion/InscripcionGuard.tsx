"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ApiError, consultarMiEstado } from "@/lib/api";
import { useSesion } from "@/lib/auth";
import { rutaPermitida } from "@/lib/inscripcion";
import { requisitosCumplidos, useInscripcionStore } from "@/store/inscripcionStore";
import type { EstadoInscripcion } from "@/types/inscripcion";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

const EstadoInscripcionContext = createContext<EstadoInscripcion | null>(null);

/** Estado de la inscripción tal como lo devolvió el backend al entrar al paso. */
export function useEstadoInscripcion() {
  return useContext(EstadoInscripcionContext);
}

type Verificacion =
  | { ruta: string; estado: EstadoInscripcion | null }
  | { ruta: string; error: string };

/**
 * Protege /inscripcion/*: exige sesión de aspirante y valida, contra el estado
 * real de la inscripción en el backend, que el paso solicitado corresponda a su
 * progreso. Se vuelve a verificar en cada cambio de ruta.
 */
export function InscripcionGuard({ children }: { children: ReactNode }) {
  const sesion = useSesion();
  const pathname = usePathname();
  const router = useRouter();
  const requisitosOk = useInscripcionStore((s) => requisitosCumplidos(s.requisitos));
  const [verificacion, setVerificacion] = useState<Verificacion | null>(null);
  const [intento, setIntento] = useState(0);

  const esAspirante = sesion?.tipo === "ASPIRANTE";

  useEffect(() => {
    if (sesion === undefined) return;
    if (!esAspirante) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    let cancelado = false;
    consultarMiEstado()
      .then((estado) => {
        if (cancelado) return;
        const destino = rutaPermitida(estado, pathname, requisitosOk);
        if (destino !== pathname) {
          router.replace(destino);
        } else {
          setVerificacion({ ruta: pathname, estado });
        }
      })
      .catch((err: unknown) => {
        if (cancelado || (err instanceof ApiError && err.status === 401)) return;
        setVerificacion({
          ruta: pathname,
          error: err instanceof Error ? err.message : "No se pudo consultar tu inscripción.",
        });
      });
    return () => {
      cancelado = true;
    };
  }, [sesion, esAspirante, pathname, requisitosOk, router, intento]);

  if (!esAspirante || !verificacion || verificacion.ruta !== pathname) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6 text-navy-900" />
      </div>
    );
  }

  if ("error" in verificacion) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{verificacion.error}</p>
        <Button variant="outline" className="mt-4" onClick={() => setIntento((n) => n + 1)}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <EstadoInscripcionContext.Provider value={verificacion.estado}>
      {children}
    </EstadoInscripcionContext.Provider>
  );
}
