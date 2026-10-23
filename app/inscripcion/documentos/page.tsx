"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileUploadField } from "@/components/inscripcion/FileUploadField";
import { useEstadoInscripcion } from "@/components/inscripcion/InscripcionGuard";
import { ApiError, adjuntarDocumentos } from "@/lib/api";
import { documentosCompletos, RUTAS_INSCRIPCION } from "@/lib/inscripcion";

export default function DocumentosPage() {
  const router = useRouter();
  const estado = useEstadoInscripcion();
  const [documentoIdentidad, setDocumentoIdentidad] = useState<File | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<{ status: number; mensaje: string } | null>(null);

  const yaCargados = !!estado && documentosCompletos(estado);
  const puedeSubir = !!documentoIdentidad && !!foto && !subiendo;

  const handleSubir = async () => {
    if (!documentoIdentidad || !foto) return;
    setError(null);
    setSubiendo(true);
    try {
      await adjuntarDocumentos(documentoIdentidad, foto);
      toast.success("Documentos validados y guardados.");
      router.push(RUTAS_INSCRIPCION.pago);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setError({
        status: err instanceof ApiError ? err.status : 0,
        mensaje: err instanceof Error ? err.message : "Ocurrió un error inesperado.",
      });
      if (err instanceof ApiError && err.status === 422) {
        setDocumentoIdentidad(null);
        setFoto(null);
      }
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div>
      <p className="text-xs font-bold tracking-wide text-green-600">PASO 3 DE 5</p>
      <h1 className="mt-2 font-serif text-3xl text-navy-900">
        Sube tus
        <br />
        <span className="italic">documentos</span>
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Adjunta los documentos requeridos. Cada archivo se analiza con antivirus antes de
        guardarse.
      </p>

      {yaCargados && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Ya cargaste tus documentos. Puedes{" "}
          <button
            type="button"
            className="font-medium underline"
            onClick={() => router.push(RUTAS_INSCRIPCION.pago)}
          >
            continuar al pago
          </button>{" "}
          o subirlos de nuevo para reemplazarlos.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className={
            error.status === 503
              ? "mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
              : "mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {error.mensaje}
        </div>
      )}

      <Card className="mt-8 space-y-8 p-6">
        <FileUploadField
          id="documentoIdentidad"
          label="Documento de identidad"
          hint="Sube una copia legible por ambas caras."
          accept=".pdf,.jpg,.jpeg,.png"
          value={documentoIdentidad}
          onChange={setDocumentoIdentidad}
          disabled={subiendo}
        />
        <FileUploadField
          id="foto"
          label="Foto 3x4"
          hint="Fondo blanco, formato reciente."
          accept=".jpg,.jpeg,.png"
          value={foto}
          onChange={setFoto}
          disabled={subiendo}
        />
      </Card>

      <div className="mt-6 flex justify-end">
        <Button variant="secondary" arrow loading={subiendo} disabled={!puedeSubir} onClick={handleSubir}>
          {subiendo ? "Analizando y subiendo…" : "Subir y continuar al pago"}
        </Button>
      </div>
    </div>
  );
}
