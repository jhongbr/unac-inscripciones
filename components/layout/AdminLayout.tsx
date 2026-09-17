"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { cerrarSesionAdmin, obtenerSesionAdmin } from "@/lib/auth";
import type { AreaAdministrativa, SesionAdmin } from "@/types/auth";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

const SECCIONES: { href: string; label: string; area: AreaAdministrativa }[] = [
  { href: "/admin/admisiones", label: "Admisiones", area: "admisiones" },
  { href: "/admin/tesoreria", label: "Tesorería", area: "tesoreria" },
  { href: "/admin/evaluacion", label: "Evaluación", area: "programa" },
];

export function AdminLayout({
  title,
  area,
  header,
  children,
}: {
  title: string;
  area: AreaAdministrativa;
  header?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const [sesion, setSesion] = useState<SesionAdmin | null | undefined>(undefined);

  useEffect(() => {
    const actual = obtenerSesionAdmin();
    setSesion(actual);
    if (!actual) {
      router.replace("/login");
    }
  }, [router]);

  const handleCerrarSesion = () => {
    cerrarSesionAdmin();
    router.push("/login");
  };

  if (sesion === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Spinner className="h-6 w-6 text-navy-900" />
      </div>
    );
  }

  if (!sesion) {
    return null;
  }

  const seccionPropia = SECCIONES.find((s) => s.area === sesion.area);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-gray-200 bg-navy-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-green-600 font-serif text-sm font-bold text-white">
              U
            </span>
            <span className="text-sm font-bold text-white">
              Panel administrativo
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1">
              {SECCIONES.map((seccion) => (
                <Link
                  key={seccion.href}
                  href={seccion.href}
                  className="rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  {seccion.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <span className="text-xs text-gray-400">{sesion.correoElectronico}</span>
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

      {sesion.area !== area ? (
        <main className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="font-serif text-2xl text-navy-900">Acceso restringido</h1>
          <p className="mt-2 text-sm text-gray-500">
            Tu cuenta solo tiene acceso a la sección de{" "}
            <span className="font-medium text-navy-900">{seccionPropia?.label}</span>.
          </p>
          {seccionPropia && (
            <Button
              variant="secondary"
              arrow
              className="mt-6"
              onClick={() => router.push(seccionPropia.href)}
            >
              Ir a {seccionPropia.label}
            </Button>
          )}
        </main>
      ) : (
        <>
          {header}
          <main className="mx-auto max-w-7xl px-6 py-8">
            {!header && <h1 className="font-serif text-3xl text-navy-900">{title}</h1>}
            <div className={header ? undefined : "mt-6"}>{children}</div>
          </main>
        </>
      )}
    </div>
  );
}
