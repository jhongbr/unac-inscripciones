import Link from "next/link";

const PASOS = [
  { numero: "01", titulo: "Verificar requisitos" },
  { numero: "02", titulo: "Formulario" },
  { numero: "03", titulo: "Documentos" },
  { numero: "04", titulo: "Pago" },
  { numero: "05", titulo: "Evaluación" },
];

const DATOS_INFERIORES = [
  { etiqueta: "Cierre de inscripciones", valor: "15 de diciembre de 2026" },
  { etiqueta: "Derechos de inscripción", valor: "$180.000 COP" },
  { etiqueta: "Duración del programa", valor: "10 semestres" },
  { etiqueta: "Soporte", valor: "admisiones@unac.edu.co" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 z-20 w-full border-b border-white/10 bg-navy-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-green-600 font-serif text-lg font-bold text-white">
              U
            </span>
            <span className="font-bold text-white">
              Corporación Universitaria Adventista
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-gray-300 sm:flex">
            <a href="#programas" className="hover:text-white">
              Programas
            </a>
            <Link href="/admin/admisiones" className="hover:text-white">
              Admisiones
            </Link>
            <a href="#contacto" className="hover:text-white">
              Contacto
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-gradient-to-b from-navy-900 via-navy-900 to-navy-950 pt-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-green-600/15 px-4 py-1.5 text-xs font-medium text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              INSCRIPCIONES ABIERTAS · SEMESTRE 2025-2
            </span>

            <h1 className="mt-6 font-serif text-6xl leading-[1.05] text-white sm:text-7xl">
              Ingeniería
              <br />
              <span className="italic text-green-400">de Sistemas</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-gray-300">
              Fórmate como ingeniero de sistemas con un enfoque integral,
              docentes especializados y convenios de práctica profesional.
              Inicia tu proceso de inscripción en línea, sin filas ni
              trámites presenciales.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700"
              >
                Iniciar inscripción <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-transparent px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Consultar estado
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {PASOS.map((paso) => (
              <div
                key={paso.numero}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <span className="font-serif text-2xl text-green-400">
                  {paso.numero}
                </span>
                <p className="mt-2 text-sm text-gray-200">{paso.titulo}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-8 sm:grid-cols-4">
          {DATOS_INFERIORES.map((dato) => (
            <div key={dato.etiqueta}>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {dato.etiqueta}
              </p>
              <p className="mt-1 text-sm font-medium text-navy-900">
                {dato.valor}
              </p>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
