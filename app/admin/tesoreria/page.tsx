"use client";

import { useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type EstadoPago = "confirmado" | "por-verificar" | "sin-pago";

interface Pago {
  id: string;
  inscripcion: string;
  aspirante: string;
  monto: number;
  referencia: string | null;
  banco: string | null;
  fecha: string | null;
  estado: EstadoPago;
}

const MONTO_INSCRIPCION = 145243;

const PAGOS: Pago[] = [
  {
    id: "PAG-04821",
    inscripcion: "INS-2025-04821",
    aspirante: "María José García López",
    monto: MONTO_INSCRIPCION,
    referencia: "TXN-20250810-00298",
    banco: "Bancolombia",
    fecha: "10 ago, 14:32",
    estado: "confirmado",
  },
  {
    id: "PAG-04819",
    inscripcion: "INS-2025-04819",
    aspirante: "Sofía Ramírez Cárdenas",
    monto: MONTO_INSCRIPCION,
    referencia: "TXN-20250807-00156",
    banco: "Davivienda",
    fecha: "07 ago, 09:14",
    estado: "confirmado",
  },
  {
    id: "PAG-04818",
    inscripcion: "INS-2025-04818",
    aspirante: "Diego Hernández Ríos",
    monto: MONTO_INSCRIPCION,
    referencia: "TXN-20250807-00143",
    banco: "PSE / BBVA",
    fecha: "07 ago, 11:42",
    estado: "por-verificar",
  },
  {
    id: "PAG-04816",
    inscripcion: "INS-2025-04816",
    aspirante: "Andrés Felipe Mora",
    monto: MONTO_INSCRIPCION,
    referencia: "TXN-20250806-00099",
    banco: "Nequi",
    fecha: "06 ago, 16:55",
    estado: "confirmado",
  },
  {
    id: "PAG-04820",
    inscripcion: "INS-2025-04820",
    aspirante: "Pedro Alonso Martínez",
    monto: MONTO_INSCRIPCION,
    referencia: null,
    banco: null,
    fecha: null,
    estado: "sin-pago",
  },
  {
    id: "PAG-04817",
    inscripcion: "INS-2025-04817",
    aspirante: "Valentina Ospina Meza",
    monto: MONTO_INSCRIPCION,
    referencia: "TXN-20250805-00072",
    banco: "Bancolombia",
    fecha: "05 ago, 10:05",
    estado: "confirmado",
  },
];

const BADGE_POR_ESTADO: Record<EstadoPago, { color: "green" | "amber" | "red"; label: string }> = {
  confirmado: { color: "green", label: "Confirmado" },
  "por-verificar": { color: "amber", label: "Por verificar" },
  "sin-pago": { color: "red", label: "Sin pago" },
};

const formatoMoneda = {
  format: (valor: number) => `$${valor.toLocaleString("es-CO")} COP`,
};

export default function TesoreriaPage() {
  const conteos = useMemo(() => {
    const confirmados = PAGOS.filter((p) => p.estado === "confirmado");
    const porVerificar = PAGOS.filter((p) => p.estado === "por-verificar");
    const sinPago = PAGOS.filter((p) => p.estado === "sin-pago");
    return {
      confirmados: confirmados.length,
      recaudado: confirmados.reduce((acc, p) => acc + p.monto, 0),
      porVerificar: porVerificar.length,
      sinPago: sinPago.length,
      total: PAGOS.length,
      esperado: PAGOS.reduce((acc, p) => acc + p.monto, 0),
    };
  }, []);

  const pagosPorVerificar = PAGOS.filter((p) => p.estado === "por-verificar");

  return (
    <AdminLayout
      title="Tesorería"
      area="tesoreria"
      header={
        <div className="border-b border-navy-800 bg-navy-900">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div>
              <h1 className="text-lg font-bold text-white">Tesorería</h1>
              <p className="text-sm text-gray-400">
                Verificación de derechos de inscripción · 2025-2
              </p>
            </div>
            <p className="text-sm text-gray-400">
              Total recaudado:{" "}
              <span className="text-xl font-bold text-green-400">
                {formatoMoneda.format(conteos.recaudado)}
              </span>
            </p>
          </div>
        </div>
      }
    >
      <div className="py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 border-green-500 p-5">
            <p className="text-4xl font-bold text-navy-900">{conteos.confirmados}</p>
            <p className="mt-2 text-sm font-semibold text-green-600">Pagos recibidos</p>
            <p className="text-xs text-gray-500">{formatoMoneda.format(conteos.recaudado)}</p>
          </Card>
          <Card className="border-2 border-amber-500 p-5">
            <p className="text-4xl font-bold text-navy-900">{conteos.porVerificar}</p>
            <p className="mt-2 text-sm font-semibold text-amber-600">Por verificar</p>
            <p className="text-xs text-gray-500">Pendiente de revisión</p>
          </Card>
          <Card className="border-2 border-red-500 p-5">
            <p className="text-4xl font-bold text-navy-900">{conteos.sinPago}</p>
            <p className="mt-2 text-sm font-semibold text-red-600">Sin pago registrado</p>
            <p className="text-xs text-gray-500">Notificación enviada</p>
          </Card>
          <Card className="border-2 border-blue-500 p-5">
            <p className="text-4xl font-bold text-navy-900">{conteos.total}</p>
            <p className="mt-2 text-sm font-semibold text-blue-600">Total esperado</p>
            <p className="text-xs text-gray-500">{formatoMoneda.format(conteos.esperado)}</p>
          </Card>
        </div>

        <Card className="mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-bold text-navy-900">Registro de pagos</h2>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
            >
              <span aria-hidden="true">↓</span> Exportar
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Aspirante</th>
                  <th className="px-4 py-3 font-medium">Referencia</th>
                  <th className="px-4 py-3 font-medium">Banco</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Monto</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {PAGOS.map((pago) => (
                  <tr
                    key={pago.id}
                    className={cn(
                      pago.estado === "por-verificar" ? "bg-amber-50" : "hover:bg-gray-50"
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">{pago.aspirante}</p>
                      <p className="text-xs text-gray-500">{pago.inscripcion}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{pago.referencia ?? "–"}</td>
                    <td className="px-4 py-3 text-gray-600">{pago.banco ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{pago.fecha ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold text-navy-900">
                      {formatoMoneda.format(pago.monto)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={BADGE_POR_ESTADO[pago.estado].color}>
                        {BADGE_POR_ESTADO[pago.estado].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {pago.estado === "confirmado" && (
                        <span className="text-sm font-medium text-green-600">✓ Listo</span>
                      )}
                      {pago.estado === "por-verificar" && (
                        <button
                          type="button"
                          className="rounded-lg bg-navy-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-navy-800"
                        >
                          Verificar
                        </button>
                      )}
                      {pago.estado === "sin-pago" && (
                        <button
                          type="button"
                          className="rounded-full bg-amber-400 px-3 py-1.5 text-sm font-semibold text-amber-950 hover:bg-amber-500"
                        >
                          Notificar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {pagosPorVerificar.map((pago) => (
          <div
            key={pago.id}
            className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">
                ⚠️
              </span>
              <div className="flex-1">
                <p className="font-semibold text-navy-900">
                  Pago pendiente de verificación — {pago.aspirante}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  El aspirante reportó pago vía {pago.banco} con referencia{" "}
                  <span className="font-mono font-semibold text-navy-900">
                    {pago.referencia}
                  </span>
                  . El sistema no ha confirmado la transacción automáticamente. Verifica
                  directamente con el banco.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="secondary">Confirmar pago</Button>
                  <Button variant="warning">Solicitar corrección al aspirante</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
