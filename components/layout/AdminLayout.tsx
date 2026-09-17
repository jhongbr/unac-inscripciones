import Link from "next/link";
import { ReactNode } from "react";

const SECCIONES = [
  { href: "/admin/admisiones", label: "Admisiones" },
  { href: "/admin/tesoreria", label: "Tesorería" },
  { href: "/admin/evaluacion", label: "Evaluación" },
];

export function AdminLayout({
  title,
  header,
  children,
}: {
  title: string;
  header?: ReactNode;
  children: ReactNode;
}) {
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
