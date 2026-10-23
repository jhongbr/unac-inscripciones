"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { cerrarSesion, RUTA_POR_ROL, useSesion } from "@/lib/auth";
import type { RolPersonal } from "@/types/auth";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const SECCIONES: { href: string; label: string; rol: RolPersonal }[] = [
  { href: "/admin/admisiones", label: "Admisiones", rol: "ADMISIONES" },
  { href: "/admin/personal", label: "Personal", rol: "ADMISIONES" },
  { href: "/admin/tesoreria", label: "Tesorería", rol: "TESORERIA" },
  { href: "/admin/evaluacion", label: "Evaluación", rol: "EVALUACION" },
];

/**
 * Protege las páginas del panel: exige una sesión de personal administrativo
 * con el rol de la sección. Un rol distinto se redirige a su propia sección.
 */
export function AdminLayout({
  title,
  rol,
  header,
  children,
}: {
  title: string;
  rol: RolPersonal;
  header?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sesion = useSesion();

  const esPersonal = sesion?.tipo === "PERSONAL";
  const rolSesion = esPersonal ? sesion.rol : null;
  const autorizado = rolSesion === rol;

  useEffect(() => {
    if (sesion === undefined) return;
    if (!rolSesion) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (rolSesion !== rol) {
      router.replace(RUTA_POR_ROL[rolSesion]);
    }
  }, [sesion, rolSesion, rol, pathname, router]);

  const handleCerrarSesion = () => {
    cerrarSesion();
    router.replace("/login");
  };

  if (!esPersonal || !autorizado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Spinner className="h-6 w-6 text-navy-900" />
      </div>
    );
  }

  const secciones = SECCIONES.filter((s) => s.rol === sesion.rol);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-gray-200 bg-navy-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href={RUTA_POR_ROL[sesion.rol]} className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-green-600 font-serif text-sm font-bold text-white">
              U
            </span>
            <span className="text-sm font-bold text-white">Panel administrativo</span>
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <nav className="flex items-center gap-1">
              {secciones.map((seccion) => (
                <Link
                  key={seccion.href}
                  href={seccion.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm hover:bg-white/10 hover:text-white",
                    pathname === seccion.href ? "bg-white/10 text-white" : "text-gray-300"
                  )}
                >
                  {seccion.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <span className="text-xs text-gray-400">{sesion.correo}</span>
              <button
                type="button"
                onClick={handleCerrarSesion}
                className="text-sm text-gray-300 hover:text-white"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {header}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {!header && <h1 className="font-serif text-3xl text-navy-900">{title}</h1>}
        <div className={header ? undefined : "mt-6"}>{children}</div>
      </main>
    </div>
  );
}
