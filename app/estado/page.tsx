"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AspiranteHeader } from "@/components/layout/AspiranteHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ApiError, consultarMiEstado } from "@/lib/api";
import { useSesion } from "@/lib/auth";
import { documentosCompletos, etiquetaEstado, formatearFecha, rutaPermitida } from "@/lib/inscripcion";
import type { EstadoInscripcion } from "@/types/inscripcion";

type Resultado =
  | { tipo: "ok"; estado: EstadoInscripcion | null }
  | { tipo: "error"; mensaje: string };

function Fila({ etiqueta, valor, testId }: { etiqueta: string; valor: React.ReactNode; testId?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{etiqueta}</dt>
      <dd data-testid={testId} className="mt-0.5 text-sm text-navy-900">
        {valor}
      </dd>
    </div>
  );
}

function Check({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <li className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
      <span className="text-navy-900">{texto}</span>
      <span className={ok ? "text-xs font-semibold text-green-600" : "text-xs font-semibold text-amber-600"}>
        {ok ? "✓ Recibido" : "Pendiente"}
      </span>
    </li>
  );
}

export default function EstadoPage() {
  const router = useRouter();
  const sesion = useSesion();
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [intento, setIntento] = useState(0);
  const esAspirante = sesion?.tipo === "ASPIRANTE";

  useEffect(() => {
    if (sesion === undefined) return;
    if (!esAspirante) {
      router.replace("/login?next=/estado");
      return;
    }
    let cancelado = false;
    consultarMiEstado()
      .then((estado) => {
        if (!cancelado) setResultado({ tipo: "ok", estado });
      })
      .catch((err: unknown) => {
        if (cancelado || (err instanceof ApiError && err.status === 401)) return;
        setResultado({
          tipo: "error",
          mensaje: err instanceof Error ? err.message : "No se pudo consultar tu inscripción.",
        });
      });
    return () => {
      cancelado = true;
    };
  }, [sesion, esAspirante, router, intento]);

  let contenido: React.ReactNode;
  if (!esAspirante || !resultado) {
    contenido = (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6 text-navy-900" />
      </div>
    );
  } else if (resultado.tipo === "error") {
    contenido = (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{resultado.mensaje}</p>
        <Button variant="outline" className="mt-4" onClick={() => setIntento((n) => n + 1)}>
          Reintentar
        </Button>
      </div>
    );
  } else if (!resultado.estado) {
    contenido = (
      <Card className="p-8 text-center">
        <p className="font-serif text-xl text-navy-900">Aún no has iniciado tu inscripción</p>
        <p className="mt-2 text-sm text-gray-500">
          Cuando completes el formulario podrás seguir aquí el avance de tu proceso.
        </p>
        <Link
          href="/inscripcion/requisitos"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700"
        >
          Iniciar inscripción →
        </Link>
      </Card>
    );
  } else {
    const estado = resultado.estado;
    const badge = etiquetaEstado(estado.estado);
    const pasoPendiente = rutaPermitida(estado, "", false);
    const completa = !!estado.referenciaPago;

    contenido = (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Número de inscripción</p>
              <p data-testid="estado-numero" className="mt-1 font-serif text-2xl text-navy-900">
                {estado.numeroInscripcion}
              </p>
            </div>
            <span data-testid="estado-badge">
              <Badge color={badge.color}>{badge.label}</Badge>
            </span>
          </div>
          <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Fila etiqueta="Programa" valor={estado.programa} />
            <Fila etiqueta="Semestre" valor={estado.semestre} />
            <Fila etiqueta="Fecha de inscripción" valor={formatearFecha(estado.fechaCreacion)} />
            <Fila etiqueta="Referencia de pago" valor={estado.referenciaPago ?? "—"} />
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="font-serif text-xl text-navy-900">Tu avance</h2>
          <ul className="mt-4 space-y-2">
            <Check ok texto="Formulario de inscripción" />
            <Check ok={estado.documentoIdentidadCargado} texto="Documento de identidad" />
            <Check ok={estado.fotoCargada} texto="Foto 3x4" />
            <Check ok={completa} texto="Pago de derechos de inscripción" />
          </ul>
          {!completa && (
            <Link
              href={pasoPendiente}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-3 text-sm font-medium text-white hover:bg-navy-800"
            >
              {documentosCompletos(estado) ? "Registrar pago" : "Adjuntar documentos"} →
            </Link>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <AspiranteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-serif text-3xl text-navy-900">
          Estado de tu
          <br />
          <span className="italic">inscripción</span>
        </h1>
        <div className="mt-8">{contenido}</div>
      </main>
    </div>
  );
}
