"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { PendienteIntegracion } from "@/components/ui/PendienteIntegracion";
import { ApiError, listarInscripcionesPendientes } from "@/lib/api";
import { PERIODO_ACADEMICO } from "@/lib/config";
import { formatearFecha } from "@/lib/inscripcion";
import { cn } from "@/lib/utils";
import type { InscripcionPendiente } from "@/types/inscripcion";

const PREFIJO_STORAGE_METAS = "unac_meta_admisiones_";

function leerMeta(storageKey: string, porDefecto: number) {
  try {
    const guardada = Number(localStorage.getItem(PREFIJO_STORAGE_METAS + storageKey));
    return guardada > 0 ? guardada : porDefecto;
  } catch {
    return porDefecto;
  }
}

// Solo se monta en el cliente (AdminLayout no renderiza hijos hasta validar la
// sesión), así que el inicializador perezoso puede leer localStorage.
function TarjetaMeta({
  titulo,
  descripcion,
  actual,
  unidad = "",
  storageKey,
  metaPorDefecto,
  sentido = "meta-minima",
}: {
  titulo: string;
  descripcion: (meta: number) => string;
  actual: number;
  unidad?: string;
  storageKey: string;
  metaPorDefecto: number;
  sentido?: "meta-minima" | "meta-maxima";
}) {
  const [meta, setMeta] = useState(() => leerMeta(storageKey, metaPorDefecto));
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState(() => String(meta));

  const guardar = () => {
    const valor = Number(borrador);
    if (!Number.isFinite(valor) || valor <= 0) return;
    setMeta(valor);
    try {
      localStorage.setItem(PREFIJO_STORAGE_METAS + storageKey, String(valor));
    } catch {
      // preferencia local; si no se puede guardar, vale solo para esta vista
    }
    setEditando(false);
  };

  const cancelar = () => {
    setBorrador(String(meta));
    setEditando(false);
  };

  const excedida = sentido === "meta-maxima" && actual > meta;
  const porcentaje = Math.min(Math.round((actual / meta) * 100), 100);

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{titulo}</p>
          <p className="mt-1 text-sm text-gray-500">{descripcion(meta)}</p>
        </div>
        {editando ? (
          <div className="flex items-center gap-2">
            <Input type="number" min={1} value={borrador} onChange={(e) => setBorrador(e.target.value)} className="w-20" />
            <span className="text-xs text-gray-400">{unidad}</span>
            <button
              type="button"
              onClick={guardar}
              className="rounded-lg bg-navy-900 px-3 py-2 text-sm font-medium text-white hover:bg-navy-800"
            >
              Guardar
            </button>
            <button type="button" onClick={cancelar} className="text-sm text-gray-500 hover:text-gray-700">
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="text-sm font-medium text-green-600 hover:text-green-700"
          >
            Editar meta
          </button>
        )}
      </div>
      <div className="mt-4 h-3 rounded-full bg-gray-100">
        <div
          className={cn("h-3 rounded-full transition-all", excedida ? "bg-red-500" : "bg-green-500")}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-400">
        {excedida ? "Meta máxima superada" : `${porcentaje}% de la meta alcanzada`}
      </p>
    </Card>
  );
}

type Carga =
  | { tipo: "cargando" }
  | { tipo: "ok"; datos: InscripcionPendiente[] }
  | { tipo: "error"; mensaje: string };

function PanelAdmisiones() {
  const [carga, setCarga] = useState<Carga>({ tipo: "cargando" });
  const [intento, setIntento] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);

  useEffect(() => {
    let cancelado = false;
    listarInscripcionesPendientes()
      .then((datos) => {
        if (!cancelado) setCarga({ tipo: "ok", datos });
      })
      .catch((err: unknown) => {
        if (cancelado || (err instanceof ApiError && err.status === 401)) return;
        setCarga({
          tipo: "error",
          mensaje: err instanceof Error ? err.message : "No se pudieron cargar las inscripciones.",
        });
      });
    return () => {
      cancelado = true;
    };
  }, [intento]);

  const pendientes = useMemo(() => (carga.tipo === "ok" ? carga.datos : []), [carga]);

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return pendientes;
    return pendientes.filter((p) =>
      [p.nombresAspirante, p.apellidosAspirante, p.correoAspirante, p.numeroInscripcion]
        .join(" ")
        .toLowerCase()
        .includes(termino)
    );
  }, [pendientes, busqueda]);

  const seleccionado =
    pendientes.find((p) => p.inscripcionId === seleccionadoId) ?? filtradas[0] ?? null;

  if (carga.tipo === "cargando") {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6 text-navy-900" />
      </div>
    );
  }

  if (carga.tipo === "error") {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{carga.mensaje}</p>
        <Button variant="outline" className="mt-4" onClick={() => setIntento((n) => n + 1)}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-navy-900 px-5 py-2.5 text-center">
            <p data-testid="total-pendientes" className="text-2xl font-bold text-white">
              {pendientes.length}
            </p>
            <p className="text-xs text-gray-400">Pendientes</p>
          </div>
          <Button variant="outline" onClick={() => setIntento((n) => n + 1)}>
            Actualizar
          </Button>
        </div>
        <Input
          placeholder="Buscar por nombre, correo o número..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-72"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TarjetaMeta
          titulo="Solicitudes en cola de revisión"
          descripcion={(meta) => `${pendientes.length} de un máximo de ${meta} en cola`}
          actual={pendientes.length}
          storageKey="cola-revision"
          metaPorDefecto={15}
          sentido="meta-maxima"
        />
        <PendienteIntegracion titulo="Más indicadores pendientes de integración">
          Matrícula, solicitudes recibidas y documentación completa requieren un endpoint de
          estadísticas por estado de inscripción en el backend.
        </PendienteIntegracion>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Aspirante</th>
                  <th className="px-4 py-3 font-medium">Inscripción</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtradas.map((p) => (
                  <tr
                    key={p.inscripcionId}
                    data-testid="fila-inscripcion"
                    onClick={() => setSeleccionadoId(p.inscripcionId)}
                    className={cn(
                      "cursor-pointer hover:bg-gray-50",
                      seleccionado?.inscripcionId === p.inscripcionId && "bg-green-50/60"
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">
                        {p.nombresAspirante} {p.apellidosAspirante}
                      </p>
                      <p className="text-xs text-gray-500">{p.correoAspirante}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{p.numeroInscripcion}</td>
                    <td className="px-4 py-3 text-gray-600">{formatearFecha(p.fechaCreacion)}</td>
                    <td className="px-4 py-3">
                      <Badge color="gray">Pendiente</Badge>
                    </td>
                  </tr>
                ))}
                {filtradas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      {pendientes.length === 0
                        ? "No hay inscripciones pendientes."
                        : "No hay inscripciones con este criterio."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="h-fit overflow-hidden p-0">
          {seleccionado ? (
            <>
              <div className="bg-navy-900 px-6 py-5">
                <p className="text-xs uppercase tracking-wide text-gray-400">Solicitud seleccionada</p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  {seleccionado.nombresAspirante} {seleccionado.apellidosAspirante}
                </h2>
                <p className="text-sm text-gray-400">{seleccionado.numeroInscripcion}</p>
              </div>

              <div className="space-y-6 p-6">
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray-500">Correo</dt>
                    <dd className="text-navy-900">{seleccionado.correoAspirante}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray-500">Fecha de inscripción</dt>
                    <dd className="text-navy-900">{formatearFecha(seleccionado.fechaCreacion)}</dd>
                  </div>
                </dl>

                <PendienteIntegracion titulo="Detalle no disponible aún">
                  Documentos, pago y puntaje ICFES de cada solicitud dependen de un endpoint de
                  detalle que el backend todavía no expone.
                </PendienteIntegracion>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Acciones</p>
                  <div className="mt-3 space-y-3">
                    {["✓ Enviar al Sistema Académico", "⚠ Solicitar corrección", "✎ Ver documentos adjuntos"].map(
                      (accion) => (
                        <Button
                          key={accion}
                          variant="outline"
                          size="lg"
                          pill
                          disabled
                          title="No disponible aún: el backend no tiene un endpoint para esta acción."
                          className="w-full justify-center"
                        >
                          {accion}
                        </Button>
                      )
                    )}
                    <p className="text-xs text-gray-500">
                      No disponible aún: el backend no tiene endpoints para estas acciones.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="p-6 text-sm text-gray-500">Selecciona una solicitud para ver el detalle.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function AdmisionesPage() {
  return (
    <AdminLayout
      title="Admisiones"
      rol="ADMISIONES"
      header={
        <div className="border-b border-navy-800 bg-navy-900">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div>
              <h1 className="text-lg font-bold text-white">Departamento de Admisiones</h1>
              <p className="text-sm text-gray-400">
                UNAC · Inscripciones pendientes · {PERIODO_ACADEMICO}
              </p>
            </div>
            <Link
              href="/admin/personal"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Registrar personal
            </Link>
          </div>
        </div>
      }
    >
      <PanelAdmisiones />
    </AdminLayout>
  );
}
