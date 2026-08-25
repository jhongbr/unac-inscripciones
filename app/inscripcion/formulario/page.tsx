"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { useInscripcionStore } from "@/store/inscripcionStore";

const formularioSchema = z.object({
  nombres: z.string().trim().min(1, "Los nombres son obligatorios."),
  apellidos: z.string().trim().min(1, "Los apellidos son obligatorios."),
  tipoDocumento: z.string().min(1, "Selecciona un tipo de documento."),
  numeroDocumento: z.string().trim().min(4, "Ingresa un número de documento válido."),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria."),
  genero: z.string().min(1, "Selecciona un género."),
  correo: z
    .string()
    .trim()
    .min(1, "El correo electrónico es obligatorio.")
    .email("Ingresa un correo electrónico válido."),
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
    .regex(/^\d{1,3}$/, "Ingresa un puntaje válido (0-500)."),

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
  const datosPersonales = useInscripcionStore((s) => s.datosPersonales);
  const datosAcademicos = useInscripcionStore((s) => s.datosAcademicos);
  const programa = useInscripcionStore((s) => s.programa);
  const setFormulario = useInscripcionStore((s) => s.setFormulario);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormularioValues>({
    resolver: zodResolver(formularioSchema),
    defaultValues: {
      ...datosPersonales,
      ...datosAcademicos,
      ...programa,
    },
  });

  const facultadSeleccionada = watch("facultad");

  const onSubmit = async (data: FormularioValues) => {
    setFormulario({
      datosPersonales: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        fechaNacimiento: data.fechaNacimiento,
        genero: data.genero,
        correo: data.correo,
        telefono: data.telefono,
        ciudadResidencia: data.ciudadResidencia,
      },
      datosAcademicos: {
        institucionBachillerato: data.institucionBachillerato,
        municipioColegio: data.municipioColegio,
        anioGraduacion: data.anioGraduacion,
        codigoResultadoIcfes: data.codigoResultadoIcfes,
        puntajeGlobalSaber11: data.puntajeGlobalSaber11,
      },
      programa: {
        facultad: data.facultad,
        programa: data.programa,
        semestre: data.semestre,
      },
    });
    router.push("/inscripcion/documentos");
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-navy-900">
        Formulario de
        <br />
        <span className="italic">inscripción</span>
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Completa tus datos personales, académicos y el programa al que
        deseas aplicar.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8" noValidate>
        <Card className="p-6">
          <h2 className="font-serif text-xl text-navy-900">Datos personales</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
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

            <div>
              <Label htmlFor="tipoDocumento">Tipo de documento</Label>
              <Select id="tipoDocumento" hasError={!!errors.tipoDocumento} {...register("tipoDocumento")}>
                <option value="">Selecciona</option>
                <option value="CC">Cédula de ciudadanía</option>
                <option value="TI">Tarjeta de identidad</option>
                <option value="CE">Cédula de extranjería</option>
                <option value="PA">Pasaporte</option>
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
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="otro">Otro</option>
                <option value="prefiero-no-decir">Prefiero no decir</option>
              </Select>
              <FieldError message={errors.genero?.message} />
            </div>

            <div>
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input id="correo" type="email" hasError={!!errors.correo} {...register("correo")} />
              <FieldError message={errors.correo?.message} />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" hasError={!!errors.telefono} {...register("telefono")} />
              <FieldError message={errors.telefono?.message} />
            </div>

            <div className="sm:col-span-2">
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
              <Input id="anioGraduacion" placeholder="AAAA" hasError={!!errors.anioGraduacion} {...register("anioGraduacion")} />
              <FieldError message={errors.anioGraduacion?.message} />
            </div>

            <div>
              <Label htmlFor="codigoResultadoIcfes">Código resultado ICFES</Label>
              <Input id="codigoResultadoIcfes" hasError={!!errors.codigoResultadoIcfes} {...register("codigoResultadoIcfes")} />
              <FieldError message={errors.codigoResultadoIcfes?.message} />
            </div>
            <div>
              <Label htmlFor="puntajeGlobalSaber11">Puntaje global Saber 11</Label>
              <Input id="puntajeGlobalSaber11" placeholder="0-500" hasError={!!errors.puntajeGlobalSaber11} {...register("puntajeGlobalSaber11")} />
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
                <option value="2025-2">2025-2</option>
                <option value="2026-1">2026-1</option>
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
