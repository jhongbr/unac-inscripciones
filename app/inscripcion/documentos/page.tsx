"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileUploadField } from "@/components/inscripcion/FileUploadField";
import { useInscripcionStore } from "@/store/inscripcionStore";

export default function DocumentosPage() {
  const router = useRouter();
  const documentoIdentidad = useInscripcionStore((s) => s.documentoIdentidad);
  const fotoDocumento = useInscripcionStore((s) => s.fotoDocumento);
  const setDocumentoIdentidad = useInscripcionStore((s) => s.setDocumentoIdentidad);
  const setFotoDocumento = useInscripcionStore((s) => s.setFotoDocumento);

  const puedeContinuar = !!documentoIdentidad && !!fotoDocumento;

  const handleContinuar = () => {
    if (!puedeContinuar) return;
    router.push("/inscripcion/pago");
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-navy-900">
        Sube tus
        <br />
        <span className="italic">documentos</span>
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Adjunta los documentos requeridos en formato digital para continuar.
      </p>

      <Card className="mt-8 space-y-8 p-6">
        <FileUploadField
          label="Documento de identidad"
          hint="Sube una copia legible por ambas caras."
          accept=".pdf,.jpg,.jpeg,.png"
          value={documentoIdentidad}
          onChange={setDocumentoIdentidad}
        />
        <FileUploadField
          label="Foto 3x4"
          hint="Fondo blanco, formato reciente."
          accept=".jpg,.jpeg,.png"
          value={fotoDocumento}
          onChange={setFotoDocumento}
        />
      </Card>

      <div className="mt-6 flex justify-end">
        <Button variant="secondary" arrow disabled={!puedeContinuar} onClick={handleContinuar}>
          Continuar al pago
        </Button>
      </div>
    </div>
  );
}
