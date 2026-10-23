"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import {
  ApiError,
  listarInscripcionesPendientes,
  obtenerDetalleInscripcion,
  validarPago,
} from "@/lib/api";
import { COSTO_INSCRIPCION, formatearPesos, PERIODO_ACADEMICO } from "@/lib/config";
import { formatearFecha } from "@/lib/inscripcion";
import { cn } from "@/lib/utils";
import type { InscripcionDetalle, InscripcionPendiente } from "@/types/inscripcion";

type Carga =
  | { tipo: "cargando" }
  | { tipo: "ok"; datos: InscripcionPendiente[] }
  | { tipo: "error"; mensaje: string };

type CargaDetalle =
  | { tipo: "idle" }
  | { tipo: "cargando" }
  | { tipo: "ok"; datos: InscripcionDetalle }
  | { tipo: "error"; mensaje: string };

function PanelTesoreria() {
  const [carga, setCarga] = useState<Carga>({ tipo: "cargando" });
  const [intento, setIntento] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<CargaDetalle>({ tipo: "idle" });
  const [observacion, setObservacion] = useState("");
  const [enviando, setEnviando] = useState<"aprobar" | "rechazar" | null>(null);

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

  const todas = useMemo(() => (carga.tipo === "ok" ? carga.datos : []), [carga]);

  // A Tesorería solo le corresponden las inscripciones con el pago ya
  // registrado y en espera de verificación (EN_REVISION).
  const enRevision = useMemo(
    () => todas.filter((p) => p.estado === "EN_REVISION"),
    [todas]
  );

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return enRevision;
    return enRevision.filter((p) =>
      [p.nombresAspirante, p.apellidosAspirante, p.correoAspirante, p.numeroInscripcion]
        .join(" ")
        .toLowerCase()
        .includes(termino)
    );
  }, [enRevision, busqueda]);

  const seleccionado =
    filtradas.find((p) => p.inscripcionId === seleccionadoId) ?? filtradas[0] ?? null;

  useEffect(() => {
    if (!seleccionado) {
      setDetalle({ tipo: "idle" });
      return;
    }
    let cancelado = false;
    setDetalle({ tipo: "cargando" });
    setObservacion("");
    obtenerDetalleInscripcion(seleccionado.inscripcionId)
      .then((datos) => {
        if (!cancelado) setDetalle({ tipo: "ok", datos });
      })
      .catch((err: unknown) => {
        if (cancelado || (err instanceof ApiError && err.status === 401)) return;
        setDetalle({
          tipo: "error",
          mensaje: err instanceof Error ? err.message : "No se pudo cargar el detalle.",
        });
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seleccionado?.inscripcionId]);

  const actuar = async (aprobado: boolean) => {
    if (!seleccionado) return;
    setEnviando(aprobado ? "aprobar" : "rechazar");
    try {
      await validarPago(seleccionado.inscripcionId, aprobado, observacion.trim() || undefined);
      toast.success(
        aprobado
          ? "Pago aprobado. La inscripción pasó a evaluación."
          : "Pago rechazado. Se notificó al aspirante."
      );
      setSeleccionadoId(null);
      setIntento((n) => n + 1);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      toast.error(err instanceof Error ? err.message : "No se pudo registrar la decisión.");
    } finally {
      setEnviando(null);
    }
  };

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
            <p data-testid="total-en-revision" className="text-2xl font-bold text-white">
              {enRevision.length}
            </p>
            <p className="text-xs text-gray-400">Pagos por verificar</p>
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
                      <Badge color="blue">En revisión</Badge>
                    </td>
                  </tr>
                ))}
                {filtradas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      {enRevision.length === 0
                        ? "No hay pagos pendientes de verificación."
                        : "No hay inscripciones con este criterio."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="h-fit overflow-hidden p-0">
          {!seleccionado ? (
            <p className="p-6 text-sm text-gray-500">Selecciona una inscripción para ver el pago.</p>
          ) : (
            <>
              <div className="bg-navy-900 px-6 py-5">
                <p className="text-xs uppercase tracking-wide text-gray-400">Pago a verificar</p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  {seleccionado.nombresAspirante} {seleccionado.apellidosAspirante}
                </h2>
                <p className="text-sm text-gray-400">{seleccionado.numeroInscripcion}</p>
              </div>

              <div className="space-y-6 p-6">
                {detalle.tipo === "cargando" && (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-5 w-5 text-navy-900" />
                  </div>
                )}

                {detalle.tipo === "error" && (
                  <p className="text-sm text-red-600">{detalle.mensaje}</p>
                )}

                {detalle.tipo === "ok" && (
                  <>
                    <dl className="space-y-3 text-sm">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-gray-500">Correo</dt>
                        <dd className="text-navy-900">{detalle.datos.correoAspirante}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-gray-500">Valor esperado</dt>
                        <dd className="text-navy-900">{formatearPesos(COSTO_INSCRIPCION)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-gray-500">Referencia de pago</dt>
                        <dd className="font-mono text-navy-900">{detalle.datos.referenciaPago ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-gray-500">Banco</dt>
                        <dd className="text-navy-900">{detalle.datos.bancoPago ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-gray-500">Fecha de pago</dt>
                        <dd className="text-navy-900">{formatearFecha(detalle.datos.fechaPago)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-gray-500">Documentos</dt>
                        <dd className="space-x-3 text-navy-900">
                          {detalle.datos.documentoIdentidadUrl ? (
                            <a
                              href={detalle.datos.documentoIdentidadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-green-600 underline hover:text-green-700"
                            >
                              Documento de identidad
                            </a>
                          ) : (
                            <span className="text-gray-400">Sin documento</span>
                          )}
                          {detalle.datos.fotoUrl ? (
                            <a
                              href={detalle.datos.fotoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-green-600 underline hover:text-green-700"
                            >
                              Foto
                            </a>
                          ) : (
                            <span className="text-gray-400">Sin foto</span>
                          )}
                        </dd>
                      </div>
                    </dl>

                    <div>
                      <label htmlFor="observacion-pago" className="text-xs font-bold uppercase tracking-wide text-gray-500">
                        Observación (opcional)
                      </label>
                      <textarea
                        id="observacion-pago"
                        rows={3}
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        placeholder="Motivo del rechazo o nota para el aspirante..."
                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        size="lg"
                        pill
                        loading={enviando === "aprobar"}
                        disabled={enviando !== null}
                        className="w-full justify-center"
                        onClick={() => actuar(true)}
                      >
                        ✓ Aprobar pago
                      </Button>
                      <Button
                        variant="danger"
                        size="lg"
                        pill
                        loading={enviando === "rechazar"}
                        disabled={enviando !== null}
                        className="w-full justify-center"
                        onClick={() => actuar(false)}
                      >
                        ✗ Rechazar pago
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function TesoreriaPage() {
  return (
    <AdminLayout
      title="Tesorería"
      rol="TESORERIA"
      header={
        <div className="border-b border-navy-800 bg-navy-900">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div>
              <h1 className="text-lg font-bold text-white">Tesorería</h1>
              <p className="text-sm text-gray-400">
                Verificación de derechos de inscripción ({formatearPesos(COSTO_INSCRIPCION)}) ·{" "}
                {PERIODO_ACADEMICO}
              </p>
            </div>
          </div>
        </div>
      }
    >
      <PanelTesoreria />
    </AdminLayout>
  );
}
