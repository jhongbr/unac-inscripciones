"use client";

import { useRef, useState } from "react";
import { cn, formatearTamano } from "@/lib/utils";
import { TAMANO_MAXIMO_ARCHIVO } from "@/lib/config";

/** Misma validación que aplica el backend antes del escaneo antivirus. */
function validarArchivo(file: File, accept: string): string | null {
  const extensiones = accept.split(",").map((e) => e.trim().toLowerCase());
  const nombre = file.name.toLowerCase();
  if (!extensiones.some((ext) => nombre.endsWith(ext))) {
    return `Formato no permitido. Usa: ${extensiones.join(", ")}.`;
  }
  if (file.size > TAMANO_MAXIMO_ARCHIVO) {
    return `El archivo no debe superar los ${formatearTamano(TAMANO_MAXIMO_ARCHIVO)}.`;
  }
  return null;
}

export function FileUploadField({
  id,
  label,
  hint,
  accept,
  value,
  onChange,
  error,
  disabled,
}: {
  id: string;
  label: string;
  hint: string;
  accept: string;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string | null;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const problema = validarArchivo(file, accept);
    setErrorLocal(problema);
    onChange(problema ? null : file);
    if (problema && inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = () => {
    setErrorLocal(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const mensajeError = errorLocal ?? error;

  return (
    <div>
      <p className="text-sm font-medium text-navy-900">{label}</p>
      <p className="mt-0.5 text-xs text-gray-500">{hint}</p>

      {value ? (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-navy-900">{value.name}</p>
            <p className="text-xs text-gray-500">{formatearTamano(value.size)}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="ml-4 shrink-0 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault();
            setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastrando(false);
            if (!disabled) handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
            arrastrando ? "border-green-500 bg-green-50" : "border-gray-300 bg-white hover:bg-gray-50",
            mensajeError && "border-red-300"
          )}
        >
          <span className="text-sm font-medium text-navy-900">
            Arrastra el archivo aquí o haz clic para seleccionarlo
          </span>
          <span className="mt-1 text-xs text-gray-500">
            {accept.split(",").join(", ")} · máx. {formatearTamano(TAMANO_MAXIMO_ARCHIVO)}
          </span>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={accept}
            disabled={disabled}
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      )}
      {mensajeError && <p className="mt-1.5 text-xs text-red-600">{mensajeError}</p>}
    </div>
  );
}
