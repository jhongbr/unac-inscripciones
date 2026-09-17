"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ToggleOption } from "@/components/ui/ToggleOption";
import { useInscripcionStore } from "@/store/inscripcionStore";
import { cn } from "@/lib/utils";

const DOCUMENTOS_REQUERIDOS = [
  "Copia del documento de identidad (CC o TI) — ambas caras",
  "Fotografía tamaño 3×4 reciente — fondo blanco, sin lentes",
  "Comprobante de pago de derechos de inscripción ($145.243 COP)",
];

export default function RequisitosPage() {
  const router = useRouter();
  const requisitos = useInscripcionStore((state) => state.requisitos);
  const setRequisitos = useInscripcionStore((state) => state.setRequisitos);

  const puedeContinuar =
    requisitos.tieneTituloBachiller === "si" &&
    requisitos.presentoIcfes === "si" &&
    requisitos.confirmaVeracidad;

  const handleContinuar = () => {
    if (!puedeContinuar) return;
    router.push("/inscripcion/formulario");
  };

  return (
    <div>
      <p className="text-xs font-bold tracking-wide text-green-600">
        PASO 1 DE 5
      </p>
      <h1 className="mt-2 font-serif text-3xl text-navy-900">
        ¿Cumples los
        <br />
        <span className="italic">requisitos?</span>
      </h1>
      <p className="mt-3 text-sm text-gray-500">
        Para inscribirte debes cumplir los siguientes requisitos mínimos de
        admisión establecidos por la UNAC.
      </p>

      <div className="mt-8 space-y-6">
        <Card className="overflow-hidden p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-2xl">
              🎓
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-navy-900">
                Título de Bachiller
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Debes haber completado la educación media y contar con título
                o acta de grado en cualquier modalidad.
              </p>
              <div className="mt-4 flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-sm font-medium text-navy-900">
                  ¿Eres bachiller o estás próximo a graduarte?
                </p>
                <div className="flex shrink-0 gap-2">
                  <ToggleOption
                    label="Sí"
                    selected={requisitos.tieneTituloBachiller === "si"}
                    onSelect={() =>
                      setRequisitos({
                        ...requisitos,
                        tieneTituloBachiller: "si",
                      })
                    }
                  />
                  <ToggleOption
                    label="No"
                    selected={requisitos.tieneTituloBachiller === "no"}
                    onSelect={() =>
                      setRequisitos({
                        ...requisitos,
                        tieneTituloBachiller: "no",
                      })
                    }
                  />
                </div>
              </div>
              {requisitos.tieneTituloBachiller === "no" && (
                <p className="mt-2 text-xs text-red-600">
                  Necesitas contar con el título de bachiller para continuar.
                </p>
              )}
            </div>
          </div>
          <div
            className={cn(
              "-mx-6 -mb-6 mt-6 h-1",
              requisitos.tieneTituloBachiller === "si" && "bg-green-500",
              requisitos.tieneTituloBachiller === "no" && "bg-red-400"
            )}
          />
        </Card>

        <Card className="overflow-hidden p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-2xl">
              📋
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-navy-900">
                Pruebas Saber 11 (ICFES)
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Haber presentado el examen de Estado Saber 11. Se requiere el
                código del resultado para la verificación.
              </p>
              <div className="mt-4 flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-sm font-medium text-navy-900">
                  ¿Has presentado el Saber 11?
                </p>
                <div className="flex shrink-0 gap-2">
                  <ToggleOption
                    label="Sí"
                    selected={requisitos.presentoIcfes === "si"}
                    onSelect={() =>
                      setRequisitos({ ...requisitos, presentoIcfes: "si" })
                    }
                  />
                  <ToggleOption
                    label="No"
                    selected={requisitos.presentoIcfes === "no"}
                    onSelect={() =>
                      setRequisitos({ ...requisitos, presentoIcfes: "no" })
                    }
                  />
                </div>
              </div>
              {requisitos.presentoIcfes === "no" && (
                <p className="mt-2 text-xs text-red-600">
                  Necesitas haber presentado el examen Saber 11 para
                  continuar.
                </p>
              )}
            </div>
          </div>
          <div
            className={cn(
              "-mx-6 -mb-6 mt-6 h-1",
              requisitos.presentoIcfes === "si" && "bg-green-500",
              requisitos.presentoIcfes === "no" && "bg-red-400"
            )}
          />
        </Card>
      </div>

      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-6">
        <p className="text-xs font-bold tracking-wide text-blue-900">
          DOCUMENTOS QUE NECESITARÁS
        </p>
        <ul className="mt-4 space-y-3">
          {DOCUMENTOS_REQUERIDOS.map((documento) => (
            <li
              key={documento}
              className="flex items-start gap-3 text-sm text-blue-900"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-700">
                →
              </span>
              {documento}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Checkbox
          id="confirmaVeracidad"
          label="Confirmo que cumplo los requisitos y la información es veraz."
          checked={requisitos.confirmaVeracidad}
          onChange={(e) =>
            setRequisitos({
              ...requisitos,
              confirmaVeracidad: e.target.checked,
            })
          }
        />
        <Button
          variant="secondary"
          arrow
          disabled={!puedeContinuar}
          onClick={handleContinuar}
          className="w-full sm:w-auto"
        >
          Continuar al formulario
        </Button>
      </div>
    </div>
  );
}
