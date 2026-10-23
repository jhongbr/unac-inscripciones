"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { FieldError } from "@/components/ui/FieldError";
import { ApiError, registrarPersonal } from "@/lib/api";

const ROLES = [
  { value: "ADMISIONES", label: "Admisiones — revisión de solicitudes" },
  { value: "TESORERIA", label: "Tesorería — verificación de pagos" },
  { value: "EVALUACION", label: "Evaluación — evaluación académica" },
] as const;

const personalSchema = z
  .object({
    nombres: z.string().trim().min(1, "Los nombres son obligatorios."),
    apellidos: z.string().trim().min(1, "Los apellidos son obligatorios."),
    correoElectronico: z
      .string()
      .trim()
      .min(1, "El correo electrónico es obligatorio.")
      .email("Ingresa un correo electrónico válido."),
    contrasena: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmarContrasena: z.string(),
    rol: z.enum(["ADMISIONES", "TESORERIA", "EVALUACION"], { message: "Selecciona un rol." }),
  })
  .refine((data) => data.contrasena === data.confirmarContrasena, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmarContrasena"],
  });

type PersonalFormValues = z.infer<typeof personalSchema>;

function FormularioPersonal() {
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonalFormValues>({ resolver: zodResolver(personalSchema) });

  const onSubmit = async (data: PersonalFormValues) => {
    setErrorServidor(null);
    try {
      const creado = await registrarPersonal({
        nombres: data.nombres,
        apellidos: data.apellidos,
        correoElectronico: data.correoElectronico,
        contrasena: data.contrasena,
        rol: data.rol,
      });
      toast.success(`Cuenta creada para ${creado.correoElectronico} (${creado.rol}).`);
      reset();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setErrorServidor(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    }
  };

  return (
    <Card className="max-w-2xl p-6">
      <p className="text-sm text-gray-500">
        Crea cuentas para el personal de Admisiones, Tesorería o Evaluación. Cada persona solo
        tendrá acceso a la sección de su rol.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
        {errorServidor && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorServidor}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="nombres">Nombres</Label>
            <Input id="nombres" hasError={!!errors.nombres} {...register("nombres")} />
            <FieldError message={errors.nombres?.message} />
          </div>
          <div>
            <Label htmlFor="apellidos">Apellidos</Label>
            <Input id="apellidos" hasError={!!errors.apellidos} {...register("apellidos")} />
            <FieldError message={errors.apellidos?.message} />
          </div>
        </div>
        <div>
          <Label htmlFor="correoElectronico">Correo electrónico</Label>
          <Input id="correoElectronico" type="email" autoComplete="off" hasError={!!errors.correoElectronico} {...register("correoElectronico")} />
          <FieldError message={errors.correoElectronico?.message} />
        </div>
        <div>
          <Label htmlFor="rol">Rol</Label>
          <Select id="rol" hasError={!!errors.rol} defaultValue="" {...register("rol")}>
            <option value="" disabled>
              Selecciona
            </option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
          <FieldError message={errors.rol?.message} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contrasena">Contraseña inicial</Label>
            <Input id="contrasena" type="password" autoComplete="new-password" hasError={!!errors.contrasena} {...register("contrasena")} />
            <FieldError message={errors.contrasena?.message} />
          </div>
          <div>
            <Label htmlFor="confirmarContrasena">Confirmar contraseña</Label>
            <Input id="confirmarContrasena" type="password" autoComplete="new-password" hasError={!!errors.confirmarContrasena} {...register("confirmarContrasena")} />
            <FieldError message={errors.confirmarContrasena?.message} />
          </div>
        </div>
        <Button type="submit" variant="secondary" arrow loading={isSubmitting}>
          Registrar personal
        </Button>
      </form>
    </Card>
  );
}

export default function PersonalPage() {
  return (
    <AdminLayout title="Registrar personal administrativo" rol="ADMISIONES">
      <FormularioPersonal />
    </AdminLayout>
  );
}
