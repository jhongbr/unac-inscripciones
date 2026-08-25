"use client";

import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { cn } from "@/lib/utils";

type EstadoEvaluacion = "por-verificar" | "evaluando" | "aprobado" | "rechazado";

interface Evaluacion {
  id: string;
  inscripcion: string;
  aspirante: string;
  programa: string;
  puntajeSaber11: number;
  codigoIcfes: string;
  evaluador: string;
  estado: EstadoEvaluacion;
}

const EVALUACIONES: Evaluacion[] = [
  { id: "EVA-55021", inscripcion: "INS-2025-104233", aspirante: "Laura Martínez Ríos", programa: "Ingeniería de Sistemas", puntajeSaber11: 342, codigoIcfes: "AC202510001234", evaluador: "Sin asignar", estado: "por-verificar" },
  { id: "EVA-55014", inscripcion: "INS-2025-104187", aspirante: "Andrés Felipe Gómez", programa: "Administración de Empresas", puntajeSaber11: 298, codigoIcfes: "AC202510001187", evaluador: "Patricia Ospina", estado: "aprobado" },
  { id: "EVA-55009", inscripcion: "INS-2025-104165", aspirante: "Camila Vargas Serna", programa: "Enfermería", puntajeSaber11: 275, codigoIcfes: "AC202510001165", evaluador: "Jorge Salcedo", estado: "evaluando" },
  { id: "EVA-55002", inscripcion: "INS-2025-104120", aspirante: "Juan Sebastián Rojas", programa: "Ingeniería Industrial", puntajeSaber11: 231, codigoIcfes: "AC202510001120", evaluador: "Patricia Ospina", estado: "rechazado" },
  { id: "EVA-54996", inscripcion: "INS-2025-104098", aspirante: "María José Castaño", programa: "Contaduría Pública", puntajeSaber11: 310, codigoIcfes: "AC202510001098", evaluador: "Jorge Salcedo", estado: "aprobado" },
  { id: "EVA-54988", inscripcion: "INS-2025-104071", aspirante: "David Esteban Peña", programa: "Ingeniería de Sistemas", puntajeSaber11: 289, codigoIcfes: "AC202510001071", evaluador: "Sin asignar", estado: "evaluando" },
];

const ESTADOS: { value: EstadoEvaluacion | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "por-verificar", label: "Por verificar" },
  { value: "evaluando", label: "Evaluando" },
  { value: "aprobado", label: "Aprobado" },
  { value: "rechazado", label: "Rechazado" },
];

const BADGE_POR_ESTADO: Record<EstadoEvaluacion, { color: "green" | "blue" | "amber" | "red"; label: string }> = {
  "por-verificar": { color: "amber", label: "Por verificar" },
  evaluando: { color: "blue", label: "Evaluando" },
  aprobado: { color: "green", label: "Aprobado" },
  rechazado: { color: "red", label: "Rechazado" },
};

export default function EvaluacionPage() {
  const [filtro, setFiltro] = useState<EstadoEvaluacion | "todos">("todos");
  const [seleccionadoId, setSeleccionadoId] = useState(EVALUACIONES[0]?.id ?? null);

  const evaluacionesFiltradas = useMemo(
    () =>
      filtro === "todos"
        ? EVALUACIONES
        : EVALUACIONES.filter((e) => e.estado === filtro),
    [filtro]
  );

  const seleccionado =
    EVALUACIONES.find((e) => e.id === seleccionadoId) ?? evaluacionesFiltradas[0] ?? null;

  return (
    <AdminLayout title="Evaluación">
      <Tabs options={ESTADOS} value={filtro} onChange={setFiltro} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Aspirante</th>
                  <th className="px-4 py-3 font-medium">Programa</th>
                  <th className="px-4 py-3 font-medium">Puntaje Saber 11</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {evaluacionesFiltradas.map((evaluacion) => (
                  <tr
                    key={evaluacion.id}
                    onClick={() => setSeleccionadoId(evaluacion.id)}
                    className={cn(
                      "cursor-pointer hover:bg-gray-50",
                      seleccionado?.id === evaluacion.id && "bg-green-50/60"
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">{evaluacion.aspirante}</p>
                      <p className="text-xs text-gray-500">{evaluacion.inscripcion}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{evaluacion.programa}</td>
                    <td className="px-4 py-3 text-gray-600">{evaluacion.puntajeSaber11}</td>
                    <td className="px-4 py-3">
                      <Badge color={BADGE_POR_ESTADO[evaluacion.estado].color}>
                        {BADGE_POR_ESTADO[evaluacion.estado].label}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {evaluacionesFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No hay evaluaciones con este estado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="h-fit p-6">
          {seleccionado ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {seleccionado.id}
                  </p>
                  <h2 className="mt-1 font-serif text-xl text-navy-900">
                    {seleccionado.aspirante}
                  </h2>
                </div>
                <Badge color={BADGE_POR_ESTADO[seleccionado.estado].color}>
                  {BADGE_POR_ESTADO[seleccionado.estado].label}
                </Badge>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Inscripción</dt>
                  <dd className="mt-0.5 text-navy-900">{seleccionado.inscripcion}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Programa</dt>
                  <dd className="mt-0.5 text-navy-900">{seleccionado.programa}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    Código resultado ICFES
                  </dt>
                  <dd className="mt-0.5 text-navy-900">{seleccionado.codigoIcfes}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    Puntaje global Saber 11
                  </dt>
                  <dd className="mt-0.5 text-navy-900">{seleccionado.puntajeSaber11}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Evaluador</dt>
                  <dd className="mt-0.5 text-navy-900">{seleccionado.evaluador}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="text-sm text-gray-500">Selecciona una evaluación para ver el detalle.</p>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
