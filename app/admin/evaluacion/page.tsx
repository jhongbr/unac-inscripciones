"use client";

import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type EstadoEvaluacion = "admitido" | "evaluando" | "pendiente" | "no-admitido";

interface Areas {
  matematicas: number;
  cienciasNaturales: number;
  lecturaCritica: number;
  ingles: number;
}

interface Candidato {
  id: string;
  inscripcion: string;
  nombre: string;
  colegio: string;
  ciudad: string;
  icfesGlobal: number;
  estado: EstadoEvaluacion;
  areas: Areas;
  observaciones: string;
}

const PUNTAJE_MINIMO = 250;
const PUNTAJE_MAXIMO = 500;
const UMBRAL_AREA_BUENA = 65;

const CANDIDATOS: Candidato[] = [
  {
    id: "EVA-04821",
    inscripcion: "INS-2025-04821",
    nombre: "María José García López",
    colegio: "Col. San José de La Salle",
    ciudad: "Medellín",
    icfesGlobal: 298,
    estado: "evaluando",
    areas: { matematicas: 65, cienciasNaturales: 60, lecturaCritica: 58, ingles: 52 },
    observaciones:
      "Puntaje global por encima del mínimo (298 > 250). Área de matemáticas con espacio de mejora. Perfil aceptable para el programa.",
  },
  {
    id: "EVA-04819",
    inscripcion: "INS-2025-04819",
    nombre: "Sofía Ramírez Cárdenas",
    colegio: "IED Liceo Nacional",
    ciudad: "Medellín",
    icfesGlobal: 335,
    estado: "admitido",
    areas: { matematicas: 74, cienciasNaturales: 68, lecturaCritica: 65, ingles: 58 },
    observaciones:
      "Puntaje global muy por encima del mínimo (335 > 250). Desempeño sólido y consistente en todas las áreas.",
  },
  {
    id: "EVA-04818",
    inscripcion: "INS-2025-04818",
    nombre: "Diego Hernández Ríos",
    colegio: "IE San Ignacio",
    ciudad: "Bello",
    icfesGlobal: 310,
    estado: "pendiente",
    areas: { matematicas: 69, cienciasNaturales: 62, lecturaCritica: 59, ingles: 54 },
    observaciones:
      "Documentación de admisiones incompleta. En espera de verificación antes de evaluar.",
  },
  {
    id: "EVA-04816",
    inscripcion: "INS-2025-04816",
    nombre: "Andrés Felipe Mora",
    colegio: "Normal Superior",
    ciudad: "Bello",
    icfesGlobal: 387,
    estado: "admitido",
    areas: { matematicas: 88, cienciasNaturales: 78, lecturaCritica: 72, ingles: 69 },
    observaciones:
      "Puntaje global sobresaliente (387 > 250). Perfil altamente competitivo para el programa.",
  },
  {
    id: "EVA-04820",
    inscripcion: "INS-2025-04820",
    nombre: "Pedro Alonso Martínez",
    colegio: "IE Manuel José Sierra",
    ciudad: "Itagüí",
    icfesGlobal: 262,
    estado: "evaluando",
    areas: { matematicas: 60, cienciasNaturales: 55, lecturaCritica: 63, ingles: 48 },
    observaciones:
      "Puntaje global ligeramente por encima del mínimo (262 > 250). Requiere revisión detallada del área de inglés.",
  },
  {
    id: "EVA-04817",
    inscripcion: "INS-2025-04817",
    nombre: "Valentina Ospina Meza",
    colegio: "IE Santa Catalina",
    ciudad: "Envigado",
    icfesGlobal: 198,
    estado: "no-admitido",
    areas: { matematicas: 48, cienciasNaturales: 45, lecturaCritica: 50, ingles: 40 },
    observaciones:
      "Puntaje global por debajo del mínimo requerido (198 < 250). No cumple el perfil académico del programa.",
  },
];

const AREAS: { key: keyof Areas; label: string; relevancia: string }[] = [
  { key: "matematicas", label: "Matemáticas", relevancia: "Alta relevancia" },
  { key: "cienciasNaturales", label: "Ciencias Naturales", relevancia: "Alta relevancia" },
  { key: "lecturaCritica", label: "Lectura Crítica", relevancia: "Media relevancia" },
  { key: "ingles", label: "Inglés", relevancia: "Media relevancia" },
];

const BADGE_POR_ESTADO: Record<EstadoEvaluacion, { color: "green" | "blue" | "gray" | "red"; label: string }> = {
  admitido: { color: "green", label: "Admitido" },
  evaluando: { color: "blue", label: "Evaluando" },
  pendiente: { color: "gray", label: "Pendiente" },
  "no-admitido": { color: "red", label: "No admitido" },
};

function esAreaBuena(score: number) {
  return score >= UMBRAL_AREA_BUENA;
}

export default function EvaluacionPage() {
  const [seleccionadoId, setSeleccionadoId] = useState(CANDIDATOS[0].id);
  const seleccionado = CANDIDATOS.find((c) => c.id === seleccionadoId) ?? CANDIDATOS[0];

  const conteos = useMemo(
    () => ({
      admitidos: CANDIDATOS.filter((c) => c.estado === "admitido").length,
      evaluando: CANDIDATOS.filter((c) => c.estado === "evaluando").length,
      noAdmitidos: CANDIDATOS.filter((c) => c.estado === "no-admitido").length,
    }),
    []
  );

  return (
    <AdminLayout
      title="Evaluación"
      area="programa"
      header={
        <div className="border-b border-navy-800 bg-navy-900">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div>
              <h1 className="text-lg font-bold text-white">
                Programa · Ingeniería de Sistemas
              </h1>
              <p className="text-sm text-gray-400">
                Evaluación de candidatos · Admisiones 2025-2
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl bg-white/10 px-5 py-2.5 text-center">
                <p className="text-2xl font-bold text-green-400">{conteos.admitidos}</p>
                <p className="text-xs text-gray-400">Admitidos</p>
              </div>
              <div className="rounded-xl bg-white/10 px-5 py-2.5 text-center">
                <p className="text-2xl font-bold text-blue-400">{conteos.evaluando}</p>
                <p className="text-xs text-gray-400">En evaluación</p>
              </div>
              <div className="rounded-xl bg-white/10 px-5 py-2.5 text-center">
                <p className="text-2xl font-bold text-red-400">{conteos.noAdmitidos}</p>
                <p className="text-xs text-gray-400">No admitidos</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Candidatos recibidos de admisiones
          </p>
          <div className="mt-4 space-y-4">
            {CANDIDATOS.map((candidato) => (
              <button
                key={candidato.id}
                type="button"
                onClick={() => setSeleccionadoId(candidato.id)}
                className={cn(
                  "w-full rounded-xl border bg-white p-5 text-left transition-colors",
                  seleccionado.id === candidato.id
                    ? "border-2 border-blue-500"
                    : "border border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-navy-900">{candidato.nombre}</h3>
                      <Badge color={BADGE_POR_ESTADO[candidato.estado].color}>
                        {BADGE_POR_ESTADO[candidato.estado].label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {candidato.inscripcion} · {candidato.colegio} · {candidato.ciudad}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-bold text-navy-900">{candidato.icfesGlobal}</p>
                    <p className="text-xs text-gray-400">/ {PUNTAJE_MAXIMO} ICFES</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3">
                  {AREAS.map((area) => {
                    const score = candidato.areas[area.key];
                    const buena = esAreaBuena(score);
                    return (
                      <div key={area.key}>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{area.label}</span>
                          <span
                            className={cn(
                              "font-semibold",
                              buena ? "text-green-600" : "text-amber-600"
                            )}
                          >
                            {score}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                          <div
                            className={cn(
                              "h-1.5 rounded-full",
                              buena ? "bg-green-500" : "bg-amber-500"
                            )}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="h-fit rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
            Evaluando candidato
          </p>
          <h2 className="mt-1 text-lg font-semibold text-navy-900">{seleccionado.nombre}</h2>
          <p className="text-sm text-gray-500">
            {seleccionado.inscripcion} · {seleccionado.colegio}
          </p>

          <div className="mt-5 rounded-xl bg-gray-50 p-5">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Puntaje global ICFES</span>
              <span>Resultado</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-4">
              <span className="text-3xl font-bold text-navy-900">
                {seleccionado.icfesGlobal}
              </span>
              <Badge color={seleccionado.icfesGlobal >= PUNTAJE_MINIMO ? "blue" : "red"}>
                {seleccionado.icfesGlobal >= PUNTAJE_MINIMO
                  ? "Sobre el mínimo"
                  : "Bajo el mínimo"}
              </Badge>
            </div>
            <div className="mt-3 h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-linear-to-r from-blue-500 to-green-500"
                style={{
                  width: `${(seleccionado.icfesGlobal / PUNTAJE_MAXIMO) * 100}%`,
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>0</span>
              <span>Mín. {PUNTAJE_MINIMO}</span>
              <span>{PUNTAJE_MAXIMO}</span>
            </div>
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-wide text-gray-500">
            Rendimiento por área
          </p>
          <div className="mt-3 space-y-4">
            {AREAS.map((area) => {
              const score = seleccionado.areas[area.key];
              const buena = esAreaBuena(score);
              return (
                <div key={area.key}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-navy-900">
                      {area.label}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        {area.relevancia}
                      </span>
                    </p>
                    <span
                      className={cn(
                        "shrink-0 text-sm font-bold",
                        buena ? "text-green-600" : "text-amber-600"
                      )}
                    >
                      {score}/100
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-gray-100">
                    <div
                      className={cn(
                        "h-2 rounded-full",
                        buena ? "bg-green-500" : "bg-amber-500"
                      )}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-wide text-gray-500">
            Observaciones
          </p>
          <div className="mt-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
            {seleccionado.observaciones}
          </div>

          <div className="mt-6 space-y-3">
            <Button variant="primary" size="lg" pill className="w-full justify-center">
              ✓ Admitir aspirante
            </Button>
            <Button variant="danger" size="lg" pill className="w-full justify-center">
              ✗ Rechazar candidato
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
