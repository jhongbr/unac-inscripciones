"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ToggleOption } from "@/components/ui/ToggleOption";
import { useInscripcionStore } from "@/store/inscripcionStore";

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
      <h1 className="font-serif text-3xl text-navy-900">
        Verifica tus
        <br />
        <span className="italic">requisitos</span>
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Antes de continuar, confirma que cumples con los requisitos básicos
        del proceso de admisión.
      </p>

      <Card className="mt-8 space-y-8 p-6">
        <div>
          <p className="text-sm font-medium text-navy-900">
            ¿Cuentas con título de bachiller?
          </p>
          <div className="mt-3 flex gap-3">
            <ToggleOption
              label="Sí"
              selected={requisitos.tieneTituloBachiller === "si"}
              onSelect={() =>
                setRequisitos({ ...requisitos, tieneTituloBachiller: "si" })
              }
            />
            <ToggleOption
              label="No"
              selected={requisitos.tieneTituloBachiller === "no"}
              onSelect={() =>
                setRequisitos({ ...requisitos, tieneTituloBachiller: "no" })
              }
            />
          </div>
          {requisitos.tieneTituloBachiller === "no" && (
            <p className="mt-2 text-xs text-red-600">
              Necesitas contar con el título de bachiller para continuar.
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-navy-900">
            ¿Presentaste el examen Saber 11 (ICFES)?
          </p>
          <div className="mt-3 flex gap-3">
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
          {requisitos.presentoIcfes === "no" && (
            <p className="mt-2 text-xs text-red-600">
              Necesitas haber presentado el examen Saber 11 para continuar.
            </p>
          )}
        </div>

        <Checkbox
          id="confirmaVeracidad"
          label="Confirmo que la información que suministraré durante el proceso de inscripción es veraz."
          checked={requisitos.confirmaVeracidad}
          onChange={(e) =>
            setRequisitos({ ...requisitos, confirmaVeracidad: e.target.checked })
          }
        />
      </Card>

      <div className="mt-6 flex justify-end">
        <Button
          variant="secondary"
          arrow
          disabled={!puedeContinuar}
          onClick={handleContinuar}
        >
          Continuar al formulario
        </Button>
      </div>
    </div>
  );
}
