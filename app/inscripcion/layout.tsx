import Link from "next/link";
import { StepIndicator } from "@/components/inscripcion/StepIndicator";

export default function InscripcionLayout({
  children,
}: LayoutProps<"/inscripcion">) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-green-600 font-serif text-sm font-bold text-white">
              U
            </span>
            <span className="text-sm font-bold text-navy-900">
              Corporación Universitaria Adventista
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-navy-900"
          >
            <span aria-hidden="true">←</span>
            Volver al inicio
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <StepIndicator />
      </div>

      <main className="mx-auto max-w-3xl px-6 pb-20">{children}</main>
    </div>
  );
}
