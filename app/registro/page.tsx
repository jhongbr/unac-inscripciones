"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { Checkbox } from "@/components/ui/Checkbox";
import { RadioCard } from "@/components/ui/RadioCard";
import { registrarAspirante } from "@/lib/api";
import { registrarCuentaAdmin } from "@/lib/auth";

const AREAS_ADMINISTRATIVAS = [
  { value: "admisiones", label: "Admisiones", description: "Revisión de solicitudes y documentos." },
  { value: "tesoreria", label: "Tesorería", description: "Verificación de pagos de inscripción." },
  { value: "programa", label: "Programa", description: "Evaluación académica de candidatos." },
] as const;

const registroSchema = z
  .object({
    nombres: z.string().trim().min(1, "Los nombres son obligatorios."),
    apellidos: z.string().trim().min(1, "Los apellidos son obligatorios."),
    correoElectronico: z
      .string()
      .trim()
      .min(1, "El correo electrónico es obligatorio.")
      .email("Ingresa un correo electrónico válido."),
    contrasena: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmarContrasena: z.string(),
    esAdministrativo: z.boolean().optional(),
    areaAdministrativa: z.enum(["admisiones", "tesoreria", "programa"]).optional(),
    aceptaTerminos: z.literal(true, {
      message: "Debes aceptar los términos y la política de tratamiento de datos.",
    }),
  })
  .refine((data) => data.contrasena === data.confirmarContrasena, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmarContrasena"],
  })
  .refine((data) => !data.esAdministrativo || !!data.areaAdministrativa, {
    message: "Selecciona tu área administrativa.",
    path: ["areaAdministrativa"],
  });

type RegistroFormValues = z.infer<typeof registroSchema>;

export default function RegistroPage() {
  const router = useRouter();
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
  });

  const esAdministrativo = watch("esAdministrativo");

  const onSubmit = async (data: RegistroFormValues) => {
    setErrorCorreo(null);

    if (data.esAdministrativo && data.areaAdministrativa) {
      registrarCuentaAdmin(data.correoElectronico, data.contrasena, data.areaAdministrativa);
      toast.success("Cuenta administrativa creada correctamente. Ahora puedes iniciar sesión.");
      router.push("/login");
      return;
    }

    try {
      await registrarAspirante({
        nombres: data.nombres,
        apellidos: data.apellidos,
        correoElectronico: data.correoElectronico,
        contrasena: data.contrasena,
      });
      toast.success("Cuenta creada correctamente. Ahora puedes iniciar sesión.");
      router.push("/login");
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Ocurrió un error inesperado.";
      if (mensaje.toLowerCase().includes("correo")) {
        setErrorCorreo(mensaje);
      } else {
        toast.error(mensaje);
      }
    }
  };

  return (
    <AuthLayout>
      <h1 className="font-serif text-3xl text-navy-900">
        Crea tu cuenta
        <br />
        <span className="italic">en minutos</span>
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Completa tus datos para iniciar tu proceso de inscripción.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nombres">Nombres</Label>
            <Input
              id="nombres"
              autoComplete="given-name"
              hasError={!!errors.nombres}
              {...register("nombres")}
            />
            <FieldError message={errors.nombres?.message} />
          </div>
          <div>
            <Label htmlFor="apellidos">Apellidos</Label>
            <Input
              id="apellidos"
              autoComplete="family-name"
              hasError={!!errors.apellidos}
              {...register("apellidos")}
            />
            <FieldError message={errors.apellidos?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="correoElectronico">Correo electrónico</Label>
          <Input
            id="correoElectronico"
            type="email"
            autoComplete="email"
            hasError={!!errors.correoElectronico || !!errorCorreo}
            {...register("correoElectronico", {
              onChange: () => setErrorCorreo(null),
            })}
          />
          <FieldError message={errors.correoElectronico?.message ?? errorCorreo ?? undefined} />
        </div>

        <div>
          <Label htmlFor="contrasena">Contraseña</Label>
          <Input
            id="contrasena"
            type="password"
            autoComplete="new-password"
            hasError={!!errors.contrasena}
            {...register("contrasena")}
          />
          <FieldError message={errors.contrasena?.message} />
        </div>

        <div>
          <Label htmlFor="confirmarContrasena">Confirmar contraseña</Label>
          <Input
            id="confirmarContrasena"
            type="password"
            autoComplete="new-password"
            hasError={!!errors.confirmarContrasena}
            {...register("confirmarContrasena")}
          />
          <FieldError message={errors.confirmarContrasena?.message} />
        </div>

        <div>
          <Checkbox
            id="esAdministrativo"
            label="Soy personal administrativo de la universidad."
            {...register("esAdministrativo")}
          />
        </div>

        {esAdministrativo && (
          <div>
            <Label>Área administrativa</Label>
            <div className="mt-2 space-y-2">
              {AREAS_ADMINISTRATIVAS.map((area) => (
                <RadioCard
                  key={area.value}
                  id={`area-${area.value}`}
                  label={area.label}
                  description={area.description}
                  value={area.value}
                  {...register("areaAdministrativa")}
                />
              ))}
            </div>
            <FieldError message={errors.areaAdministrativa?.message} />
          </div>
        )}

        <div>
          <Checkbox
            id="aceptaTerminos"
            label="Acepto los términos y la política de tratamiento de datos."
            {...register("aceptaTerminos")}
          />
          <FieldError message={errors.aceptaTerminos?.message} />
        </div>

        <Button type="submit" arrow loading={isSubmitting} className="w-full">
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-green-600 hover:text-green-700">
          Iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
