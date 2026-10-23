"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useEstadoInscripcion } from "@/components/inscripcion/InscripcionGuard";
import { etiquetaEstado, formatearFecha } from "@/lib/inscripcion";
import { useSesion } from "@/lib/auth";

const PROXIMOS_PASOS = [
  {
    titulo: "Verificación documental",
    descripcion: "El equipo de admisiones revisará tus documentos e información académica.",
  },
  {
    titulo: "Confirmación de pago",
    descripcion: "Tesorería verificará el pago de los derechos de inscripción.",
  },
  {
    titulo: "Evaluación",
    descripcion: "Se validará tu puntaje Saber 11 y el cumplimiento de requisitos del programa.",
  },
  {
    titulo: "Notificación de admisión",
    descripcion: "Recibirás el resultado de tu proceso en tu correo electrónico registrado.",
  },
];

export default function ConfirmacionPage() {
  const estado = useEstadoInscripcion();
  const sesion = useSesion();

  // el guard solo deja entrar aquí con una inscripción con pago registrado
  if (!estado) return null;

  const badge = etiquetaEstado(estado.estado);

  return (
    <div>
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
          ✓
        </span>
        <h1 className="mt-4 font-serif text-3xl text-navy-900">
          Inscripción
          <br />
          <span className="italic text-green-600">completada con éxito</span>
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Hemos recibido tu inscripción. Guarda tu número de inscripción para hacer
          seguimiento a tu proceso.
        </p>
      </div>

      <Card className="mt-8 p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-gray-500">Número de inscripción</p>
        <p data-testid="numero-inscripcion" className="mt-1 font-serif text-2xl text-navy-900">
          {estado.numeroInscripcion}
        </p>
        <div className="mt-3 flex justify-center">
          <Badge color={badge.color}>{badge.label}</Badge>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="font-serif text-xl text-navy-900">Resumen de tu inscripción</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Correo</dt>
            <dd className="mt-0.5 text-navy-900">
              {sesion?.tipo === "ASPIRANTE" ? sesion.correo : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Programa</dt>
            <dd className="mt-0.5 text-navy-900">{estado.programa}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Semestre</dt>
            <dd className="mt-0.5 text-navy-900">{estado.semestre}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Referencia de pago</dt>
            <dd className="mt-0.5 text-navy-900">{estado.referenciaPago}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Fecha de pago</dt>
            <dd className="mt-0.5 text-navy-900">{formatearFecha(estado.fechaPago)}</dd>
          </div>
        </dl>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="font-serif text-xl text-navy-900">Próximos pasos</h2>
        <ol className="mt-4 space-y-5">
          {PROXIMOS_PASOS.map((paso, i) => (
            <li key={paso.titulo} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-navy-900">{paso.titulo}</p>
                <p className="mt-0.5 text-sm text-gray-500">{paso.descripcion}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-6 text-center">
        <Link href="/estado" className="text-sm font-medium text-green-600 hover:text-green-700">
          Consultar el estado de mi inscripción →
        </Link>
      </div>
    </div>
  );
}
