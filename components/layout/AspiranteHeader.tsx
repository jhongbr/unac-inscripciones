"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cerrarSesion, useSesion } from "@/lib/auth";
import { useInscripcionStore } from "@/store/inscripcionStore";

export function AspiranteHeader() {
  const router = useRouter();
  const sesion = useSesion();
  const resetInscripcion = useInscripcionStore((s) => s.reset);

  const handleCerrarSesion = () => {
    cerrarSesion();
    resetInscripcion();
    router.replace("/login");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-green-600 font-serif text-sm font-bold text-white">
            U
          </span>
          <span className="text-sm font-bold text-navy-900">
            Corporación Universitaria Adventista
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/estado" className="font-medium text-gray-500 hover:text-navy-900">
            Consultar estado
          </Link>
          {sesion?.tipo === "ASPIRANTE" && (
            <>
              <span className="hidden text-xs text-gray-400 sm:inline">{sesion.correo}</span>
              <button
                type="button"
                onClick={handleCerrarSesion}
                className="font-medium text-gray-500 hover:text-navy-900"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
