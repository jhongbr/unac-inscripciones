"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { Checkbox } from "@/components/ui/Checkbox";
import { RadioCard } from "@/components/ui/RadioCard";
import { useInscripcionStore } from "@/store/inscripcionStore";

const pagoSchema = z.object({
  metodoPago: z.enum(["transferencia", "consignacion", "pse", "tarjeta"], {
    message: "Selecciona un método de pago.",
  }),
  referenciaPago: z.string().trim().min(1, "La referencia de pago es obligatoria."),
  fechaPago: z.string().min(1, "La fecha de pago es obligatoria."),
  banco: z.string().trim().min(1, "El banco es obligatorio."),
  confirmaDatos: z.literal(true, {
    message: "Debes confirmar que los datos de pago son correctos.",
  }),
});

type PagoFormValues = z.infer<typeof pagoSchema>;

const METODOS_PAGO = [
  { value: "transferencia", label: "Transferencia bancaria", description: "Desde tu cuenta a la cuenta de la universidad." },
  { value: "consignacion", label: "Consignación en banco", description: "Pago presencial en entidad bancaria." },
  { value: "pse", label: "PSE", description: "Pago en línea débito a cuenta bancaria." },
  { value: "tarjeta", label: "Tarjeta de crédito/débito", description: "Pago en línea con tarjeta." },
] as const;

export default function PagoPage() {
  const router = useRouter();
  const pago = useInscripcionStore((s) => s.pago);
  const setPago = useInscripcionStore((s) => s.setPago);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: pago
      ? {
          ...pago,
          metodoPago: pago.metodoPago ?? undefined,
          confirmaDatos: pago.confirmaDatos ? (true as const) : undefined,
        }
      : undefined,
  });

  const onSubmit = async (data: PagoFormValues) => {
    setPago(data);
    router.push("/inscripcion/confirmacion");
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-navy-900">
        Registra tu
        <br />
        <span className="italic">pago</span>
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Selecciona el método de pago y registra los datos de tu transacción.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6" noValidate>
        <Card className="p-6">
          <h2 className="font-serif text-xl text-navy-900">Método de pago</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {METODOS_PAGO.map((metodo) => (
              <RadioCard
                key={metodo.value}
                id={metodo.value}
                label={metodo.label}
                description={metodo.description}
                value={metodo.value}
                {...register("metodoPago")}
              />
            ))}
          </div>
          <FieldError message={errors.metodoPago?.message} />
        </Card>

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
              <Label htmlFor="banco">Banco</Label>
              <Input id="banco" hasError={!!errors.banco} {...register("banco")} />
              <FieldError message={errors.banco?.message} />
            </div>
          </div>

          <div className="mt-6">
            <Checkbox
              id="confirmaDatos"
              label="Confirmo que los datos de pago registrados son correctos."
              {...register("confirmaDatos")}
            />
            <FieldError message={errors.confirmaDatos?.message} />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="secondary" arrow loading={isSubmitting}>
            Confirmar inscripción
          </Button>
        </div>
      </form>
    </div>
  );
}
