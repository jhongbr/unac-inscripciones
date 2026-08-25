"use client";

import { useRef, useState } from "react";
import { cn, formatearTamano } from "@/lib/utils";
import type { DocumentoAdjunto } from "@/types/inscripcion";

export function FileUploadField({
  label,
  hint,
  accept,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  accept: string;
  value: DocumentoAdjunto | null;
  onChange: (doc: DocumentoAdjunto | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    onChange({ nombre: file.name, tamano: file.size, tipo: file.type });
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <p className="text-sm font-medium text-navy-900">{label}</p>
      <p className="mt-0.5 text-xs text-gray-500">{hint}</p>

      {value ? (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-navy-900">{value.nombre}</p>
            <p className="text-xs text-gray-500">{formatearTamano(value.tamano)}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="ml-4 shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
          >
            Eliminar
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastrando(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
            arrastrando ? "border-green-500 bg-green-50" : "border-gray-300 bg-white hover:bg-gray-50"
          )}
        >
          <span className="text-sm font-medium text-navy-900">
            Arrastra el archivo aquí o haz clic para seleccionarlo
          </span>
          <span className="mt-1 text-xs text-gray-500">{accept.split(",").join(", ")}</span>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      )}
    </div>
  );
}
