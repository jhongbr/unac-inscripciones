"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { Checkbox } from "@/components/ui/Checkbox";
import { ApiError, registrarPago } from "@/lib/api";
import { COSTO_INSCRIPCION, formatearPesos } from "@/lib/config";
import { RUTAS_INSCRIPCION } from "@/lib/inscripcion";

const pagoSchema = z.object({
  referenciaPago: z.string().trim().min(1, "La referencia de pago es obligatoria."),
  fechaPago: z.string().min(1, "La fecha de pago es obligatoria."),
  bancoPago: z.string().trim().min(1, "El banco es obligatorio."),
  confirmacionVeracidad: z.literal(true, {
    message: "Debes confirmar que los datos de pago son correctos.",
  }),
});

type PagoFormValues = z.infer<typeof pagoSchema>;

export default function PagoPage() {
  const router = useRouter();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema),
  });

  const onSubmit = async (data: PagoFormValues) => {
    setErrorServidor(null);
    try {
      await registrarPago(data);
      toast.success("Pago registrado. Tu inscripción quedó en revisión.");
      router.push(RUTAS_INSCRIPCION.confirmacion);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      if (err instanceof ApiError && err.status === 409) {
        toast.error(err.message);
        router.push(RUTAS_INSCRIPCION.documentos);
        return;
      }
      setErrorServidor(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    }
  };

  return (
    <div>
      <p className="text-xs font-bold tracking-wide text-green-600">PASO 4 DE 5</p>
      <h1 className="mt-2 font-serif text-3xl text-navy-900">
        Registra tu
        <br />
        <span className="italic">pago</span>
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Registra los datos de la transacción con la que pagaste los derechos de inscripción (
        {formatearPesos(COSTO_INSCRIPCION)}).
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6" noValidate>
        {errorServidor && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorServidor}
          </div>
        )}

        <Card className="p-6">
          <h2 className="font-serif text-xl text-navy-900">Datos de la transacción</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="referenciaPago">Referencia de pago</Label>
              <Input id="referenciaPago" hasError={!!errors.referenciaPago} {...register("referenciaPago")} />
              <FieldError message={errors.referenciaPago?.message} />
            </div>
            <div>
              <Label htmlFor="fechaPago">Fecha de pago</Label>
              <Input id="fechaPago" type="date" hasError={!!errors.fechaPago} {...register("fechaPago")} />
              <FieldError message={errors.fechaPago?.message} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="bancoPago">Banco</Label>
              <Input id="bancoPago" hasError={!!errors.bancoPago} {...register("bancoPago")} />
              <FieldError message={errors.bancoPago?.message} />
            </div>
          </div>

          <div className="mt-6">
            <Checkbox
              id="confirmacionVeracidad"
              label="Confirmo que los datos de pago registrados son correctos."
              {...register("confirmacionVeracidad")}
            />
            <FieldError message={errors.confirmacionVeracidad?.message} />
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push(RUTAS_INSCRIPCION.documentos)}
            className="text-sm font-medium text-gray-500 hover:text-navy-900"
          >
            ← Volver a documentos
          </button>
          <Button type="submit" variant="secondary" arrow loading={isSubmitting}>
            Confirmar inscripción
          </Button>
        </div>
      </form>
    </div>
  );
}
