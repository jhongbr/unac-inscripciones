import Link from "next/link";
import { ReactNode } from "react";

const PASOS = [
  "Verificar requisitos",
  "Completar formulario",
  "Adjuntar documentos",
  "Realizar el pago",
  "Evaluación y admisión",
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy-900 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded bg-green-600 font-serif text-lg font-bold">
            U
          </span>
          <span className="font-bold">Corporación Universitaria Adventista</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="font-serif text-4xl leading-tight">
            Tu futuro empieza
            <br />
            <span className="italic text-green-400">con una decisión.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-300">
            Acompañamos tu proceso de inscripción de principio a fin: desde la
            verificación de requisitos hasta la confirmación de tu cupo.
          </p>

          <ol className="mt-10 space-y-4">
            {PASOS.map((paso, i) => (
              <li key={paso} className="flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-green-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-gray-200">{paso}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="relative z-10 text-xs text-gray-400">
          © {new Date().getFullYear()} Corporación Universitaria Adventista
        </p>
      </div>

      <div className="flex w-full flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
