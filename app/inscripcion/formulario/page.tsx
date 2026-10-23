"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { ApiError, crearInscripcion } from "@/lib/api";
import { SEMESTRES_DISPONIBLES } from "@/lib/config";
import { RUTAS_INSCRIPCION } from "@/lib/inscripcion";
import { useInscripcionStore } from "@/store/inscripcionStore";

const PUNTAJE_MAXIMO_SABER11 = 500;

const formularioSchema = z.object({
  tipoDocumento: z.string().min(1, "Selecciona un tipo de documento."),
  numeroDocumento: z.string().trim().min(4, "Ingresa un número de documento válido."),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria."),
  genero: z.string().min(1, "Selecciona un género."),
  telefono: z.string().trim().min(7, "Ingresa un teléfono válido."),
  ciudadResidencia: z.string().trim().min(1, "La ciudad de residencia es obligatoria."),

  institucionBachillerato: z
    .string()
    .trim()
    .min(1, "La institución de bachillerato es obligatoria."),
  municipioColegio: z.string().trim().min(1, "El municipio del colegio es obligatorio."),
  anioGraduacion: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Ingresa un año válido (AAAA)."),
  codigoResultadoIcfes: z
    .string()
    .trim()
    .min(1, "El código de resultado ICFES es obligatorio."),
  puntajeGlobalSaber11: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, `Ingresa un puntaje válido (0-${PUNTAJE_MAXIMO_SABER11}).`)
    .refine((valor) => Number(valor) <= PUNTAJE_MAXIMO_SABER11, {
      message: `Ingresa un puntaje válido (0-${PUNTAJE_MAXIMO_SABER11}).`,
    }),

  facultad: z.string().min(1, "Selecciona una facultad."),
  programa: z.string().min(1, "Selecciona un programa."),
  semestre: z.string().min(1, "Selecciona un semestre."),
});

type FormularioValues = z.infer<typeof formularioSchema>;

const PROGRAMAS_POR_FACULTAD: Record<string, string[]> = {
  "Facultad de Ingeniería": ["Ingeniería de Sistemas", "Ingeniería Industrial"],
  "Facultad de Ciencias de la Salud": ["Enfermería", "Nutrición y Dietética"],
  "Facultad de Ciencias Administrativas": ["Administración de Empresas", "Contaduría Pública"],
};

export default function FormularioPage() {
  const router = useRouter();
  const requisitos = useInscripcionStore((s) => s.requisitos);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormularioValues>({
    resolver: zodResolver(formularioSchema),
  });

  const facultadSeleccionada = useWatch({ control, name: "facultad" });

  const onSubmit = async (data: FormularioValues) => {
    setErrorServidor(null);
    try {
      await crearInscripcion({
        cumpleTituloBachiller: requisitos.tieneTituloBachiller === "si",
        cumpleIcfes: requisitos.presentoIcfes === "si",
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        fechaNacimiento: data.fechaNacimiento,
        genero: data.genero,
        telefono: data.telefono,
        ciudadResidencia: data.ciudadResidencia,
        institucionBachillerato: data.institucionBachillerato,
        municipioColegio: data.municipioColegio,
        anioGraduacion: Number(data.anioGraduacion),
        codigoResultadoIcfes: data.codigoResultadoIcfes,
        puntajeGlobalIcfes: Number(data.puntajeGlobalSaber11),
        facultad: data.facultad,
        programa: data.programa,
        semestre: data.semestre,
      });
      toast.success("Inscripción creada. Ahora adjunta tus documentos.");
      router.push(RUTAS_INSCRIPCION.documentos);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      if (err instanceof ApiError && err.status === 409) {
        // ya existe una inscripción: el guard lo lleva al paso que le corresponde
        toast.info(err.message);
        router.push(RUTAS_INSCRIPCION.documentos);
        return;
      }
      setErrorServidor(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    }
  };

  return (
    <div>
      <p className="text-xs font-bold tracking-wide text-green-600">PASO 2 DE 5</p>
      <h1 className="mt-2 font-serif text-3xl text-navy-900">
        Formulario de
        <br />
        <span className="italic">inscripción</span>
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Completa tus datos personales, académicos y el programa al que deseas aplicar. Tu
        nombre y correo se toman de tu cuenta.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8" noValidate>
        {errorServidor && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorServidor}
          </div>
        )}

        <Card className="p-6">
          <h2 className="font-serif text-xl text-navy-900">Datos personales</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="tipoDocumento">Tipo de documento</Label>
              <Select id="tipoDocumento" hasError={!!errors.tipoDocumento} {...register("tipoDocumento")}>
                <option value="">Selecciona</option>
                <option value="CEDULA_CIUDADANIA">Cédula de ciudadanía</option>
                <option value="TARJETA_IDENTIDAD">Tarjeta de identidad</option>
                <option value="CEDULA_EXTRANJERA">Cédula de extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
              </Select>
              <FieldError message={errors.tipoDocumento?.message} />
            </div>
            <div>
              <Label htmlFor="numeroDocumento">Número de documento</Label>
              <Input id="numeroDocumento" hasError={!!errors.numeroDocumento} {...register("numeroDocumento")} />
              <FieldError message={errors.numeroDocumento?.message} />
            </div>

            <div>
              <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
              <Input id="fechaNacimiento" type="date" hasError={!!errors.fechaNacimiento} {...register("fechaNacimiento")} />
              <FieldError message={errors.fechaNacimiento?.message} />
            </div>
            <div>
              <Label htmlFor="genero">Género</Label>
              <Select id="genero" hasError={!!errors.genero} {...register("genero")}>
                <option value="">Selecciona</option>
                <option value="FEMENINO">Femenino</option>
                <option value="MASCULINO">Masculino</option>
                <option value="OTRO">Otro</option>
                <option value="PREFIERO_NO_DECIRLO">Prefiero no decir</option>
              </Select>
              <FieldError message={errors.genero?.message} />
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" hasError={!!errors.telefono} {...register("telefono")} />
              <FieldError message={errors.telefono?.message} />
            </div>
            <div>
              <Label htmlFor="ciudadResidencia">Ciudad de residencia</Label>
              <Input id="ciudadResidencia" hasError={!!errors.ciudadResidencia} {...register("ciudadResidencia")} />
              <FieldError message={errors.ciudadResidencia?.message} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-serif text-xl text-navy-900">Datos académicos</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="institucionBachillerato">Institución de bachillerato</Label>
              <Input id="institucionBachillerato" hasError={!!errors.institucionBachillerato} {...register("institucionBachillerato")} />
              <FieldError message={errors.institucionBachillerato?.message} />
            </div>

            <div>
              <Label htmlFor="municipioColegio">Municipio del colegio</Label>
              <Input id="municipioColegio" hasError={!!errors.municipioColegio} {...register("municipioColegio")} />
              <FieldError message={errors.municipioColegio?.message} />
            </div>
            <div>
              <Label htmlFor="anioGraduacion">Año de graduación</Label>
              <Input id="anioGraduacion" placeholder="AAAA" inputMode="numeric" hasError={!!errors.anioGraduacion} {...register("anioGraduacion")} />
              <FieldError message={errors.anioGraduacion?.message} />
            </div>

            <div>
              <Label htmlFor="codigoResultadoIcfes">Código resultado ICFES</Label>
              <Input id="codigoResultadoIcfes" hasError={!!errors.codigoResultadoIcfes} {...register("codigoResultadoIcfes")} />
              <FieldError message={errors.codigoResultadoIcfes?.message} />
            </div>
            <div>
              <Label htmlFor="puntajeGlobalSaber11">Puntaje global Saber 11</Label>
              <Input id="puntajeGlobalSaber11" placeholder={`0-${PUNTAJE_MAXIMO_SABER11}`} inputMode="numeric" hasError={!!errors.puntajeGlobalSaber11} {...register("puntajeGlobalSaber11")} />
              <FieldError message={errors.puntajeGlobalSaber11?.message} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-serif text-xl text-navy-900">Programa seleccionado</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="facultad">Facultad</Label>
              <Select id="facultad" hasError={!!errors.facultad} {...register("facultad")}>
                <option value="">Selecciona</option>
                {Object.keys(PROGRAMAS_POR_FACULTAD).map((facultad) => (
                  <option key={facultad} value={facultad}>
                    {facultad}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.facultad?.message} />
            </div>

            <div>
              <Label htmlFor="programa">Programa</Label>
              <Select id="programa" hasError={!!errors.programa} {...register("programa")}>
                <option value="">Selecciona</option>
                {(PROGRAMAS_POR_FACULTAD[facultadSeleccionada] ?? []).map((prog) => (
                  <option key={prog} value={prog}>
                    {prog}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.programa?.message} />
            </div>
            <div>
              <Label htmlFor="semestre">Semestre</Label>
              <Select id="semestre" hasError={!!errors.semestre} {...register("semestre")}>
                <option value="">Selecciona</option>
                {SEMESTRES_DISPONIBLES.map((semestre) => (
                  <option key={semestre} value={semestre}>
                    {semestre}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.semestre?.message} />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="secondary" arrow loading={isSubmitting}>
            Continuar a documentos
          </Button>
        </div>
      </form>
    </div>
  );
}
