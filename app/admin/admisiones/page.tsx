"use client";

import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { cn } from "@/lib/utils";

type EstadoSolicitud = "enviado" | "en-revision" | "admitido" | "no-admitido";

interface Solicitud {
  id: string;
  nombre: string;
  correo: string;
  documento: string;
  programa: string;
  semestre: string;
  fecha: string;
  estado: EstadoSolicitud;
}

const SOLICITUDES: Solicitud[] = [
  { id: "INS-2025-104233", nombre: "Laura Martínez Ríos", correo: "laura.martinez@example.com", documento: "CC 1098234511", programa: "Ingeniería de Sistemas", semestre: "2025-2", fecha: "2025-11-02", estado: "en-revision" },
  { id: "INS-2025-104187", nombre: "Andrés Felipe Gómez", correo: "andres.gomez@example.com", documento: "CC 1042789233", programa: "Administración de Empresas", semestre: "2025-2", fecha: "2025-10-29", estado: "admitido" },
  { id: "INS-2025-104165", nombre: "Camila Vargas Serna", correo: "camila.vargas@example.com", documento: "TI 1193456782", programa: "Enfermería", semestre: "2025-2", fecha: "2025-10-27", estado: "enviado" },
  { id: "INS-2025-104120", nombre: "Juan Sebastián Rojas", correo: "juan.rojas@example.com", documento: "CC 1015678902", programa: "Ingeniería Industrial", semestre: "2025-2", fecha: "2025-10-21", estado: "no-admitido" },
  { id: "INS-2025-104098", nombre: "María José Castaño", correo: "mariajose.castano@example.com", documento: "CC 1088234567", programa: "Contaduría Pública", semestre: "2025-2", fecha: "2025-10-18", estado: "admitido" },
  { id: "INS-2025-104071", nombre: "David Esteban Peña", correo: "david.pena@example.com", documento: "CC 1024567890", programa: "Ingeniería de Sistemas", semestre: "2025-2", fecha: "2025-10-15", estado: "en-revision" },
];

const ESTADOS: { value: EstadoSolicitud | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "enviado", label: "Enviado" },
  { value: "en-revision", label: "En revisión" },
  { value: "admitido", label: "Admitido" },
  { value: "no-admitido", label: "No admitido" },
];

const BADGE_POR_ESTADO: Record<EstadoSolicitud, { color: "green" | "blue" | "amber" | "red"; label: string }> = {
  enviado: { color: "amber", label: "Enviado" },
  "en-revision": { color: "blue", label: "En revisión" },
  admitido: { color: "green", label: "Admitido" },
  "no-admitido": { color: "red", label: "No admitido" },
};

export default function AdmisionesPage() {
  const [filtro, setFiltro] = useState<EstadoSolicitud | "todos">("todos");
  const [seleccionadoId, setSeleccionadoId] = useState(SOLICITUDES[0]?.id ?? null);

  const solicitudesFiltradas = useMemo(
    () =>
      filtro === "todos"
        ? SOLICITUDES
        : SOLICITUDES.filter((s) => s.estado === filtro),
    [filtro]
  );

  const seleccionado =
    SOLICITUDES.find((s) => s.id === seleccionadoId) ?? solicitudesFiltradas[0] ?? null;

  return (
    <AdminLayout title="Admisiones">
      <Tabs options={ESTADOS} value={filtro} onChange={setFiltro} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Aspirante</th>
                  <th className="px-4 py-3 font-medium">Programa</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {solicitudesFiltradas.map((solicitud) => (
                  <tr
                    key={solicitud.id}
                    onClick={() => setSeleccionadoId(solicitud.id)}
                    className={cn(
                      "cursor-pointer hover:bg-gray-50",
                      seleccionado?.id === solicitud.id && "bg-green-50/60"
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">{solicitud.nombre}</p>
                      <p className="text-xs text-gray-500">{solicitud.id}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{solicitud.programa}</td>
                    <td className="px-4 py-3 text-gray-600">{solicitud.fecha}</td>
                    <td className="px-4 py-3">
                      <Badge color={BADGE_POR_ESTADO[solicitud.estado].color}>
                        {BADGE_POR_ESTADO[solicitud.estado].label}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {solicitudesFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No hay solicitudes con este estado.
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
                    {seleccionado.nombre}
                  </h2>
                </div>
                <Badge color={BADGE_POR_ESTADO[seleccionado.estado].color}>
                  {BADGE_POR_ESTADO[seleccionado.estado].label}
                </Badge>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Correo</dt>
                  <dd className="mt-0.5 text-navy-900">{seleccionado.correo}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Documento</dt>
                  <dd className="mt-0.5 text-navy-900">{seleccionado.documento}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Programa</dt>
                  <dd className="mt-0.5 text-navy-900">{seleccionado.programa}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Semestre</dt>
                  <dd className="mt-0.5 text-navy-900">{seleccionado.semestre}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    Fecha de solicitud
                  </dt>
                  <dd className="mt-0.5 text-navy-900">{seleccionado.fecha}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="text-sm text-gray-500">Selecciona una solicitud para ver el detalle.</p>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
