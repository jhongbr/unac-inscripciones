"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { iniciarSesion } from "@/lib/api";
import { guardarToken, iniciarSesionAdmin } from "@/lib/auth";
import type { AreaAdministrativa } from "@/types/auth";

const RUTA_POR_AREA: Record<AreaAdministrativa, string> = {
  admisiones: "/admin/admisiones",
  tesoreria: "/admin/tesoreria",
  programa: "/admin/evaluacion",
};

const loginSchema = z.object({
  correoElectronico: z
    .string()
    .trim()
    .min(1, "El correo electrónico es obligatorio.")
    .email("Ingresa un correo electrónico válido."),
  contrasena: z.string().min(1, "La contraseña es obligatoria."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [errorCredenciales, setErrorCredenciales] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorCredenciales(null);

    const areaAdmin = iniciarSesionAdmin(data.correoElectronico, data.contrasena);
    if (areaAdmin) {
      router.push(RUTA_POR_AREA[areaAdmin]);
      return;
    }

    try {
      const { token } = await iniciarSesion(data);
      guardarToken(token);
      router.push("/inscripcion/requisitos");
    } catch {
      setErrorCredenciales("Correo electrónico o contraseña incorrectos.");
    }
  };

  return (
    <AuthLayout>
      <h1 className="font-serif text-3xl text-navy-900">
        Bienvenido
        <br />
        <span className="italic">de nuevo</span>
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Ingresa tus credenciales para continuar tu inscripción.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        {errorCredenciales && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorCredenciales}
          </div>
        )}

        <div>
          <Label htmlFor="correoElectronico">Correo electrónico</Label>
          <Input
            id="correoElectronico"
            type="email"
            autoComplete="email"
            hasError={!!errors.correoElectronico}
            {...register("correoElectronico", {
              onChange: () => setErrorCredenciales(null),
            })}
          />
          <FieldError message={errors.correoElectronico?.message} />
        </div>

        <div>
          <Label htmlFor="contrasena">Contraseña</Label>
          <Input
            id="contrasena"
            type="password"
            autoComplete="current-password"
            hasError={!!errors.contrasena}
            {...register("contrasena", {
              onChange: () => setErrorCredenciales(null),
            })}
          />
          <FieldError message={errors.contrasena?.message} />
        </div>

        <Button type="submit" arrow loading={isSubmitting} className="w-full">
          Iniciar sesión
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-green-600 hover:text-green-700">
          Crear cuenta
        </Link>
      </p>
    </AuthLayout>
  );
}
