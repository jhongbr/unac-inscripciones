"use client";

import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { cn } from "@/lib/utils";

type EstadoPago = "pendiente" | "confirmado" | "rechazado";

interface Pago {
  id: string;
  inscripcion: string;
  aspirante: string;
  monto: number;
  metodo: string;
  referencia: string;
  banco: string;
  fecha: string;
  estado: EstadoPago;
}

const PAGOS: Pago[] = [
  { id: "PAG-88231", inscripcion: "INS-2025-104233", aspirante: "Laura Martínez Ríos", monto: 180000, metodo: "PSE", referencia: "PSE-9982341", banco: "Bancolombia", fecha: "2025-11-02", estado: "confirmado" },
  { id: "PAG-88214", inscripcion: "INS-2025-104187", aspirante: "Andrés Felipe Gómez", monto: 180000, metodo: "Transferencia", referencia: "TRX-4471982", banco: "Davivienda", fecha: "2025-10-29", estado: "confirmado" },
  { id: "PAG-88197", inscripcion: "INS-2025-104165", aspirante: "Camila Vargas Serna", monto: 180000, metodo: "Consignación", referencia: "CONS-330214", banco: "Banco de Bogotá", fecha: "2025-10-27", estado: "pendiente" },
  { id: "PAG-88180", inscripcion: "INS-2025-104120", aspirante: "Juan Sebastián Rojas", monto: 180000, metodo: "Tarjeta", referencia: "TAR-772013", banco: "Bancolombia", fecha: "2025-10-21", estado: "rechazado" },
  { id: "PAG-88162", inscripcion: "INS-2025-104098", aspirante: "María José Castaño", monto: 180000, metodo: "PSE", referencia: "PSE-9981755", banco: "BBVA", fecha: "2025-10-18", estado: "confirmado" },
  { id: "PAG-88149", inscripcion: "INS-2025-104071", aspirante: "David Esteban Peña", monto: 180000, metodo: "Transferencia", referencia: "TRX-4470512", banco: "Davivienda", fecha: "2025-10-15", estado: "pendiente" },
];

const ESTADOS: { value: EstadoPago | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "rechazado", label: "Rechazado" },
];

const BADGE_POR_ESTADO: Record<EstadoPago, { color: "green" | "amber" | "red"; label: string }> = {
  pendiente: { color: "amber", label: "Pendiente" },
  confirmado: { color: "green", label: "Confirmado" },
  rechazado: { color: "red", label: "Rechazado" },
};

const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function TesoreriaPage() {
  const [filtro, setFiltro] = useState<EstadoPago | "todos">("todos");
  const [seleccionadoId, setSeleccionadoId] = useState(PAGOS[0]?.id ?? null);

  const pagosFiltrados = useMemo(
    () => (filtro === "todos" ? PAGOS : PAGOS.filter((p) => p.estado === filtro)),
    [filtro]
  );

  const seleccionado =
    PAGOS.find((p) => p.id === seleccionadoId) ?? pagosFiltrados[0] ?? null;

  const totalConfirmado = PAGOS.filter((p) => p.estado === "confirmado").reduce(
    (acc, p) => acc + p.monto,
    0
  );

  return (
    <AdminLayout title="Tesorería">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-gray-500">Recaudado</p>
          <p className="mt-1 font-serif text-2xl text-navy-900">
            {formatoMoneda.format(totalConfirmado)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-gray-500">Pagos confirmados</p>
          <p className="mt-1 font-serif text-2xl text-navy-900">
            {PAGOS.filter((p) => p.estado === "confirmado").length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-gray-500">Pagos pendientes</p>
          <p className="mt-1 font-serif text-2xl text-navy-900">
            {PAGOS.filter((p) => p.estado === "pendiente").length}
          </p>
        </Card>
      </div>

      <Tabs options={ESTADOS} value={filtro} onChange={setFiltro} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Aspirante</th>
                  <th className="px-4 py-3 font-medium">Método</th>
                  <th className="px-4 py-3 font-medium">Monto</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagosFiltrados.map((pago) => (
                  <tr
                    key={pago.id}
                    onClick={() => setSeleccionadoId(pago.id)}
                    className={cn(
                      "cursor-pointer hover:bg-gray-50",
                      seleccionado?.id === pago.id && "bg-green-50/60"
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">{pago.aspirante}</p>
                      <p className="text-xs text-gray-500">{pago.inscripcion}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{pago.metodo}</td>
                    <td className="px-4 py-3 text-gray-600">{formatoMoneda.format(pago.monto)}</td>
                    <td className="px-4 py-3">
                      <Badge color={BADGE_POR_ESTADO[pago.estado].color}>
                        {BADGE_POR_ESTADO[pago.estado].label}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {pagosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No hay pagos con este estado.
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
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Monto</dt>
                  <dd className="mt-0.5 text-navy-900">{formatoMoneda.format(seleccionado.monto)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Método</dt>
                  <dd className="mt-0.5 text-navy-900">{seleccionado.metodo}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Referencia</dt>
                  <dd className="mt-0.5 text-navy-900">{seleccionado.referencia}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Banco</dt>
                  <dd className="mt-0.5 text-navy-900">{seleccionado.banco}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Fecha</dt>
                  <dd className="mt-0.5 text-navy-900">{seleccionado.fecha}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="text-sm text-gray-500">Selecciona un pago para ver el detalle.</p>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
