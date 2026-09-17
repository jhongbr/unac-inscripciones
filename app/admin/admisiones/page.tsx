"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type EstadoSolicitud =
  | "pendiente"
  | "en-revision"
  | "incompleto"
  | "enviado"
  | "no-admitido";

interface Documento {
  nombre: string;
  ok: boolean;
}

interface Solicitud {
  id: string;
  nombre: string;
  fecha: string;
  docsOk: boolean;
  pagoOk: boolean;
  icfes: number | null;
  estado: EstadoSolicitud;
  documentos: Documento[];
}

const PUNTAJE_MAXIMO_ICFES = 500;
const PUNTAJE_MINIMO_RECOMENDADO = 250;

const META_MATRICULA_STORAGE_KEY = "unac_meta_matricula_admisiones";
const META_MATRICULA_POR_DEFECTO = 40;

const SOLICITUDES: Solicitud[] = [
  {
    id: "INS-2025-04821",
    nombre: "María José García López",
    fecha: "08 ago",
    docsOk: true,
    pagoOk: true,
    icfes: 298,
    estado: "en-revision",
    documentos: [
      { nombre: "Copia documento identidad", ok: true },
      { nombre: "Fotografía 3×4", ok: true },
      { nombre: "Pago $145.243 COP", ok: true },
    ],
  },
  {
    id: "INS-2025-04820",
    nombre: "Pedro Alonso Martínez",
    fecha: "08 ago",
    docsOk: false,
    pagoOk: false,
    icfes: null,
    estado: "pendiente",
    documentos: [
      { nombre: "Copia documento identidad", ok: false },
      { nombre: "Fotografía 3×4", ok: false },
      { nombre: "Pago $145.243 COP", ok: false },
    ],
  },
  {
    id: "INS-2025-04819",
    nombre: "Sofía Ramírez Cárdenas",
    fecha: "07 ago",
    docsOk: true,
    pagoOk: true,
    icfes: 335,
    estado: "enviado",
    documentos: [
      { nombre: "Copia documento identidad", ok: true },
      { nombre: "Fotografía 3×4", ok: true },
      { nombre: "Pago $145.243 COP", ok: true },
    ],
  },
  {
    id: "INS-2025-04818",
    nombre: "Diego Hernández Ríos",
    fecha: "07 ago",
    docsOk: false,
    pagoOk: true,
    icfes: 310,
    estado: "incompleto",
    documentos: [
      { nombre: "Copia documento identidad", ok: false },
      { nombre: "Fotografía 3×4", ok: true },
      { nombre: "Pago $145.243 COP", ok: true },
    ],
  },
  {
    id: "INS-2025-04817",
    nombre: "Valentina Ospina Meza",
    fecha: "06 ago",
    docsOk: true,
    pagoOk: true,
    icfes: 198,
    estado: "no-admitido",
    documentos: [
      { nombre: "Copia documento identidad", ok: true },
      { nombre: "Fotografía 3×4", ok: true },
      { nombre: "Pago $145.243 COP", ok: true },
    ],
  },
  {
    id: "INS-2025-04816",
    nombre: "Andrés Felipe Mora",
    fecha: "06 ago",
    docsOk: true,
    pagoOk: true,
    icfes: 387,
    estado: "enviado",
    documentos: [
      { nombre: "Copia documento identidad", ok: true },
      { nombre: "Fotografía 3×4", ok: true },
      { nombre: "Pago $145.243 COP", ok: true },
    ],
  },
];

const TABS: { value: "todas" | "en-revision" | "incompleto" | "enviado"; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "en-revision", label: "En revisión" },
  { value: "incompleto", label: "Incompletos" },
  { value: "enviado", label: "Enviados" },
];

const BADGE_POR_ESTADO: Record<EstadoSolicitud, { color: "green" | "blue" | "amber" | "red" | "gray"; label: string }> = {
  pendiente: { color: "gray", label: "Pendiente" },
  "en-revision": { color: "blue", label: "En revisión" },
  incompleto: { color: "amber", label: "Incompleto" },
  enviado: { color: "green", label: "Enviado" },
  "no-admitido": { color: "red", label: "No admitido" },
};

function EstadoDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full",
        ok ? "bg-green-500" : "bg-red-500"
      )}
    />
  );
}

export default function AdmisionesPage() {
  const [filtro, setFiltro] = useState<(typeof TABS)[number]["value"]>("todas");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionadoId, setSeleccionadoId] = useState(SOLICITUDES[0]?.id ?? null);

  const [metaMatricula, setMetaMatricula] = useState(META_MATRICULA_POR_DEFECTO);
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [borradorMeta, setBorradorMeta] = useState(String(META_MATRICULA_POR_DEFECTO));

  useEffect(() => {
    const guardada = Number(localStorage.getItem(META_MATRICULA_STORAGE_KEY));
    if (guardada > 0) {
      setMetaMatricula(guardada);
      setBorradorMeta(String(guardada));
    }
  }, []);

  const guardarMeta = () => {
    const valor = Number(borradorMeta);
    if (!Number.isFinite(valor) || valor <= 0) return;
    setMetaMatricula(valor);
    localStorage.setItem(META_MATRICULA_STORAGE_KEY, String(valor));
    setEditandoMeta(false);
  };

  const cancelarEdicionMeta = () => {
    setBorradorMeta(String(metaMatricula));
    setEditandoMeta(false);
  };

  const conteos = useMemo(
    () => ({
      total: SOLICITUDES.length,
      enRevision: SOLICITUDES.filter((s) => s.estado === "en-revision").length,
      incompletos: SOLICITUDES.filter((s) => s.estado === "incompleto").length,
      enviados: SOLICITUDES.filter((s) => s.estado === "enviado").length,
    }),
    []
  );

  const solicitudesFiltradas = useMemo(() => {
    return SOLICITUDES.filter((s) => {
      const coincideTab = filtro === "todas" || s.estado === filtro;
      const coincideBusqueda = s.nombre
        .toLowerCase()
        .includes(busqueda.trim().toLowerCase());
      return coincideTab && coincideBusqueda;
    });
  }, [filtro, busqueda]);

  const seleccionado =
    SOLICITUDES.find((s) => s.id === seleccionadoId) ??
    solicitudesFiltradas[0] ??
    null;

  return (
    <AdminLayout
      title="Admisiones"
      area="admisiones"
      header={
        <div className="border-b border-navy-800 bg-navy-900">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div>
              <h1 className="text-lg font-bold text-white">
                Departamento de Admisiones
              </h1>
              <p className="text-sm text-gray-400">
                UNAC · Ingeniería de Sistemas · 2025-2
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl bg-white/10 px-5 py-2.5 text-center">
                <p className="text-2xl font-bold text-white">{conteos.total}</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
              <div className="rounded-xl bg-white/10 px-5 py-2.5 text-center">
                <p className="text-2xl font-bold text-blue-400">{conteos.enRevision}</p>
                <p className="text-xs text-gray-400">En revisión</p>
              </div>
              <div className="rounded-xl bg-white/10 px-5 py-2.5 text-center">
                <p className="text-2xl font-bold text-amber-400">{conteos.incompletos}</p>
                <p className="text-xs text-gray-400">Incompletos</p>
              </div>
              <div className="rounded-xl bg-white/10 px-5 py-2.5 text-center">
                <p className="text-2xl font-bold text-green-400">{conteos.enviados}</p>
                <p className="text-xs text-gray-400">Enviados</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs options={TABS} value={filtro} onChange={setFiltro} />
          <Input
            placeholder="Buscar aspirante..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-64"
          />
        </div>

        <Card className="mt-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Meta de matrícula · 2025-2
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {conteos.enviados} de {metaMatricula} aspirantes matriculados
              </p>
            </div>
            {editandoMeta ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={borradorMeta}
                  onChange={(e) => setBorradorMeta(e.target.value)}
                  className="w-24"
                />
                <button
                  type="button"
                  onClick={guardarMeta}
                  className="rounded-lg bg-navy-900 px-3 py-2 text-sm font-medium text-white hover:bg-navy-800"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={cancelarEdicionMeta}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditandoMeta(true)}
                className="text-sm font-medium text-green-600 hover:text-green-700"
              >
                Editar meta
              </button>
            )}
          </div>
          <div className="mt-4 h-3 rounded-full bg-gray-100">
            <div
              className="h-3 rounded-full bg-green-500 transition-all"
              style={{
                width: `${Math.min((conteos.enviados / metaMatricula) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {Math.min(Math.round((conteos.enviados / metaMatricula) * 100), 100)}% de la meta
            alcanzada
          </p>
        </Card>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="overflow-hidden lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Aspirante</th>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Docs</th>
                    <th className="px-4 py-3 font-medium">Pago</th>
                    <th className="px-4 py-3 font-medium">ICFES</th>
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
                      <td className="px-4 py-3 text-gray-600">{solicitud.fecha}</td>
                      <td className="px-4 py-3">
                        <EstadoDot ok={solicitud.docsOk} />
                      </td>
                      <td className="px-4 py-3">
                        <EstadoDot ok={solicitud.pagoOk} />
                      </td>
                      <td className="px-4 py-3">
                        {solicitud.icfes === null ? (
                          <span className="text-gray-400">--</span>
                        ) : (
                          <span
                            className={cn(
                              "font-semibold",
                              solicitud.icfes >= PUNTAJE_MINIMO_RECOMENDADO
                                ? "text-green-600"
                                : "text-amber-600"
                            )}
                          >
                            {solicitud.icfes}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={BADGE_POR_ESTADO[solicitud.estado].color}>
                          {BADGE_POR_ESTADO[solicitud.estado].label}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {solicitudesFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No hay solicitudes con este criterio.
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
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Solicitud seleccionada
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-white">
                    {seleccionado.nombre}
                  </h2>
                  <p className="text-sm text-gray-400">{seleccionado.id}</p>
                </div>

                <div className="space-y-6 p-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Documentos
                    </p>
                    <ul className="mt-3 space-y-2">
                      {seleccionado.documentos.map((doc) => (
                        <li
                          key={doc.nombre}
                          className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-4 text-sm"
                        >
                          <span className="text-navy-900">{doc.nombre}</span>
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              doc.ok ? "text-green-600" : "text-red-600"
                            )}
                          >
                            {doc.ok ? "✓ OK" : "Falta"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      ICFES Saber 11
                    </p>
                    <div className="mt-3 rounded-xl bg-gray-50 p-5">
                      <div className="flex items-end justify-between">
                        <span className="font-serif text-3xl text-navy-900">
                          {seleccionado.icfes ?? "--"}
                        </span>
                        <span className="pb-0.5 text-sm text-gray-400">
                          / {PUNTAJE_MAXIMO_ICFES}
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{
                            width: `${((seleccionado.icfes ?? 0) / PUNTAJE_MAXIMO_ICFES) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Mínimo recomendado: {PUNTAJE_MINIMO_RECOMENDADO} pts
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Acciones
                    </p>
                    <div className="mt-3 space-y-3">
                      <Button
                        variant="primary"
                        size="lg"
                        pill
                        className="w-full justify-center"
                      >
                        ✓ Enviar al Sistema Académico
                      </Button>
                      <Button
                        variant="warning"
                        size="lg"
                        pill
                        className="w-full justify-center"
                      >
                        ⚠ Solicitar corrección
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        pill
                        className="w-full justify-center"
                      >
                        ✎ Ver documentos adjuntos
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="p-6 text-sm text-gray-500">
                Selecciona una solicitud para ver el detalle.
              </p>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
